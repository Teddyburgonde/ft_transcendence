const { powerSaveBlocker } = require('electron');
const { constants } = require('os');
const { join } = require('path');
const { SUB_SYSTEM_REQUESTS } = require('./ScenarioManager/constants');
const { startSubProcess, detachIpcNode } = require('./sub-process-functions');
const { isProcessAlive } = require('./lib/process-management');
const getSystemProxy = require('../../utils/getSystemProxy');
const {
  START_WORKER_PROCESS_CHANNEL,
  TERMINATE_WORKER_PROCESS_CHANNEL,
  WORKER_PROCESS_EXITED_CHANNEL
} = require('./constants');

class ExecutionSystemManager {
  subProcess = null;
  _initializing = false;
  _initialized = false;
  _powerSaveBlockerId = null;
  _powerSaveBlockerTimeout = null;

  constructor () {
    if (ExecutionSystemManager.instance) {
      return ExecutionSystemManager.instance;
    }

    ExecutionSystemManager.instance = this;
    this.workerProcesses = new Map();
  }

  /**
   * Starts the sub process for performance testing execution.
   * If the sub process is already started, it does nothing.
   *
   * @returns {Promise<void>}
   */
  async init ({ type = 'performance', options = {} }) {
    let target;

    // We could be supporting multiple types of execution systems that have different needs.
    // For each of them, we should be able to specify the required sub-systems to compose
    // the whole execution system.
    if (type === 'performance') {
      target = 'ExecutionProcess.js';
    }
    else {
      throw new Error(`Unknown system type requested: ${type}`);
    }

    if (this.executionProcess && !this.isAlive()) {
      this.executionProcess = null;
      this._initializing = false;
      this.workerProcesses = new Map();
    }

    if (!this.executionProcess && !this._initializing) {
      // Setting priority to NORMAL such that it gets more CPU cycles than workers and IPC remains responsive for querying
      // and ingestion of data.
      let processPriority = constants.priority.PRIORITY_NORMAL;

      this._initializing = true;

      this.executionProcess = await startSubProcess({
        id: 'execution',
        path: join(__dirname, target),
        priority: processPriority
      });

      pm.logger.info('[ExecutionSystemManager] Spawned the execution process, pid: ', this.executionProcess.process.pid);

      this.executionProcess.process.onExit(() => {
        pm.logger.info('[ExecutionSystemManager] Execution process is exited');

        // kill all the worker processes if there are any running
        this.workerProcesses.forEach((workerProcess) => {
          !workerProcess?.process.isKilled() && workerProcess.process.kill();
        });

        // reset the state of the execution process launcher
        this.executionProcess = null;
        this.workerProcesses = new Map();
        this._initializing = false;
        this._initialized = false;
      });

      // As soon as the execution-process is spawned and ready for IPC, we need to subscribe to the worker-process
      // creation event. This has to be done before we invoke 'ready-execution' on the execution-process.
      // By invoking 'ready-execution' on the execution-process, we start the setup process that ultimately will create
      // the worker processes by sending the START_WORKER_PROCESS_CHANNEL event. So we need to add the handler before that.
      this.disposeWorkerCreateSubscription = this.executionProcess.ipcNode.subscribe(START_WORKER_PROCESS_CHANNEL,
        async (args) => {
          const { id, path, priority, responseChannels } = args;

          // TODO: Create a thin abstraction for the worker process that will help in adding some utility methods
          // on the worker processes, checking if the process is alive, for example

          // attachIPC needs to be an explicit false, since it defaults to true in the definition
          const workerProcess = await startSubProcess({
            id,
            path,
            priority,
            attachIPC: false
          });

          if (workerProcess) {
            // Check for execution-process existing to handle the case of execution-process getting killed and we cleanup
            // the worker processes. In that case, there is no execution-process to send a message to.
            workerProcess.process.onExit(() => {
              pm.logger.info('[ExecutionSystemManager] Worker process is exited, pid: ', workerProcess.process.pid);

              this.executionProcess && this.executionProcess.ipcNode.send(WORKER_PROCESS_EXITED_CHANNEL, JSON.stringify({ pid: workerProcess.process.pid }));
            });

            // consume the bytes from the stdout and stderr buffers of the worker process to prevent the buffers from filling up
            // if the buffers are full, it can lead to the process freezing (at least on Windows)
            workerProcess.process._spawnedProcess.stdout.on('data', (data) => {
              // console.log(`Received stdout from child of length : ${data.length}`);
            });

            workerProcess.process._spawnedProcess.stderr.on('data', (data) => {
              pm.logger.error('Received stderr from Execution System', data.toString());
            });

            workerProcess.process._spawnedProcess.on('close', (code) => {
              pm.logger.info(`child process exited with code ${code}`);
            });

            this.workerProcesses.set(workerProcess.process.pid, workerProcess);
            this.executionProcess && this.executionProcess.ipcNode.send(responseChannels.data,
              [JSON.stringify({ status: 'success', pid: workerProcess.process.pid })]);
          }
          else {
            this.executionProcess && this.executionProcess.ipcNode.send(responseChannels.error, [JSON.stringify({ status: 'failed' })]);
          }
        }
      );

      this.disposeWorkerTerminateSubscription = this.executionProcess.ipcNode.subscribe(TERMINATE_WORKER_PROCESS_CHANNEL,
        (args) => {
          const { pid, responseChannels } = args;

          const workerProcess = this.workerProcesses.get(pid);

          if (workerProcess) {
            const result = !workerProcess.process.isKilled() && workerProcess.process.kill();

            this.executionProcess.ipcNode.send(responseChannels.data,
              [JSON.stringify({ status: 'success', result })]);
          }
          else {
            this.executionProcess.ipcNode.send(responseChannels.error, [JSON.stringify({ status: 'failed' })]);
          }
        }
      );

      await this.executionProcess.ipcNode.invoke('ready-execution', options);

      pm.logger.info('[ExecutionSystemManager] Execution process is ready');

      // Subscribe to system-requests that the workers can make
      this.disposeSystemRequestSubscription = this.executionProcess.ipcNode.subscribe('system-request', (request) => {
        this.processSystemRequest(request);
      });

      // TODO: The below handling of data from stdout and stderr will need some changes when this PR is merged to develop:
      // [DKTPFN-371] Use utilityProcess for NodeProcess API | https://github.com/postman-eng/postman-app/pull/13653
      // This change or a subsequent one might change the way data from stdout and stderr is handled

      // Consume the bytes on stdout and stderr of the child processes
      // so that their buffers are flushed
      // if the buffers are full, it can lead to the process freezing (at least on Windows)
      this.executionProcess.process._spawnedProcess.stdout.on('data', (data) => {
        // console.log(`Received stdout from child of length : ${data.length}`);
      });

      this.executionProcess.process._spawnedProcess.stderr.on('data', (data) => {
        pm.logger.error('Received stderr from Execution System', data.toString());
      });

      this.executionProcess.process._spawnedProcess.on('close', (code) => {
        pm.logger.info(`child process exited with code ${code}`);
      });

      this._initializing = false;
      this._initialized = true;
    }
  }

  /**
   * This function serves the specific actions requested by child process which the child process itself is unable to
   * perform due to various reasons. In such cases, Child Process's system module broadcasts events on a specific channel
   * which are handled here.
   *
   * An example of such action could be an Electron API, which is not possible to be called by child process.
   *
   * @param {object} params
   * @param {string} params.action - Identifies the action to be performed.
   * @param {object} [params.data=undefined] - Data required to perform the action.
   */
  processSystemRequest = async ({ action, data }) => {
    if (action === SUB_SYSTEM_REQUESTS.ACTION.ALLOW_SLEEP) {
      this.allowPowerSaver();
    }
    else if (action === SUB_SYSTEM_REQUESTS.ACTION.PREVENT_SLEEP) {
      if (!data?.maxDuration) {
        throw new Error('ExecutionSystemManager ~ processSystemRequest: Missing required data for action: preventPowerSaver');
      }

      const { maxDuration } = data;

      this.preventPowerSaver(maxDuration);
    }
    else if (action === SUB_SYSTEM_REQUESTS.REQUEST.GET_SYSTEM_PROXY) {
      const proxyConfig = await new Promise((resolve) => {
        getSystemProxy(data.url, (err, proxyConfig) => {
          resolve(proxyConfig);
        });
      });

      this.executionProcess.ipcNode.send(data.responseChannels.data, [JSON.stringify(proxyConfig)]);
    }
  };

  isAlive () {
    return this.executionProcess?.process && isProcessAlive(this.executionProcess.process.pid);
  }

  cleanUp () {
    try {
      this.executionProcess && this.executionProcess.ipcNode.invoke('exit')
        .catch(() => {
          this.executionProcess?.kill?.();
        });

      // Dispose all the subscriptions we had created during initialization
      this.disposeSystemRequestSubscription?.();
      this.disposeWorkerCreateSubscription?.();
      this.disposeWorkerTerminateSubscription?.();

      this.allowPowerSaver();
      this.executionProcess.ipcNode.removeAllListeners();

      detachIpcNode(this.executionProcess.ipcNode);
    }
    catch (error) {
      pm.logger.error('Error in cleanUp of execution-system manager', error);
    }
  }

  /**
   * Allows the system to go to sleep by clearing the power-save-blocker set via `preventPowerSaver`.
   */
  allowPowerSaver = () => {
    // Since the ID is a number starting 0, we can't use `!this._powerSaveBlockerId` to check if the blocker is active.
    // We need to check if the ID is finite and if the blocker is active.
    // See https://www.electronjs.org/docs/latest/api/power-save-blocker for more details about the API.
    if (!Number.isFinite(this._powerSaveBlockerId) || !powerSaveBlocker.isStarted(this._powerSaveBlockerId)) {
      pm.logger.info('ExecutionSystemManager ~ No actively running power-save-blocker');
      return;
    }

    powerSaveBlocker.stop(this._powerSaveBlockerId);

    pm.logger.info('ExecutionSystemManager ~ allowPowerSaver ~ id', this._powerSaveBlockerId);

    clearTimeout(this._powerSaveBlockerTimeout);

    this._powerSaveBlockerId = null;
  };

  /**
   * Prevents the system from going to sleep for the specified duration.
   *
   * It uses Electron's power-save-blocker API to achieve this. The blocker is cleared after the specified duration to
   * allow the system to go to sleep even if the caller forgets to clear it.
   *
   * `prevent-display-sleep` is used as the type of power-save-blocker as it is the most restrictive one.
   *
   * @param {Number} maxDuration - The maximum duration for which the system should not go to sleep.
   */
  preventPowerSaver = (maxDuration) => {
    if (this._powerSaveBlockerId) {
      pm.logger.info('ExecutionSystemManager ~ preventPowerSaver: Blocker is already active. Deactivating old lock on power-saver');
      this.allowPowerSaver();
    }

    this._powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');

    if (this._powerSaveBlockerTimeout) {
      pm.logger.info('ExecutionSystemManager ~ preventPowerSaver: Clearing old timer');
      clearTimeout(this._powerSaveBlockerTimeout);
    }

    this._powerSaveBlockerTimeout = setTimeout(() => {
      this.allowPowerSaver();
    }, maxDuration);

    pm.logger.info(`ExecutionSystemManager ~ preventPowerSaver: Max Duration ${maxDuration}`);
  };
}

module.exports = ExecutionSystemManager;
