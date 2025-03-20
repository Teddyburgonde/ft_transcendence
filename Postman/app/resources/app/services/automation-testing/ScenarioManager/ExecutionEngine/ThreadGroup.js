const { constants: osConstants } = require('os');
const path = require('path');
const uuid = require('uuid/v4');
const system = require('../../lib/system');
const { createError, subscribeOnIPC, CONSTANTS } = require('../../lib/communication');
const { attachIpcNode, detachIpcNode } = require('../../sub-process-functions');
const { invokeOnIPC, isAlive } = require('../../utils/ipcUtils');
const { runTimeoutPromise } = require('../../utils/promise');
const { log } = require('../../lib/logging');
const { WORKLOAD_STATES } = require('../../ScenarioManager/constants');
const { WORKER_PROCESS_EXITED_CHANNEL } = require('../../constants');

const THREAD_GROUP_EXECUTABLE = path.resolve(__dirname, 'ThreadGroupExecutable.js');
const WORKER_CONTAINER_IDENTIFIER = 't_group';

// Using a static limit on restarts of the container process
const MAX_PROCESS_RESTART_COUNT = 5;

/**
 * This class is responsible for managing the execution of a group of threads. It will be responsible for spawning the
 * threads
 */
class ThreadGroup {
  // Priority of the container process is set to below normal so that it does not interfere with the main process
  // or renderer processes or any other OS processes. Rest of the OS functions will be given priority over this
  // process. This is done to ensure that the main process and renderer processes are not starved of CPU cycles and
  // the OS is responsive.
  static defaultProcessPriority = osConstants.priority.PRIORITY_BELOW_NORMAL;

  /**
   * We will be storing a worker thread object (returned by Executable over IPC) against composite id.
   * The composite ID will have group id prefixed with '#' as a separator.
   * @type {Map<string, Object>}
   */
  threads = new Map();

  // This will be set to true if stop command is issued.
  isStopping = false;

  // This will point reference to IPC node attached to the executable.
  ipcNode = null;

  // This will hold reference to the executable process.
  process = null;
  initializing = false;
  initialized = false;

  /**
   * @param {Symbol|String|Number} id - Id of the container to set
   * @param {Function} workerEventCallback - Callback function which will be called by the worker thread for sending data
   * @param {Function} onExitHandler - Callback function which will be called when the container process exits
   */
  constructor (id, workerEventCallback, onExitHandler) {
    this.id = id;
    this.pid = null;
    this.workerEventCallback = workerEventCallback;
    this.processPriority = ThreadGroup.defaultProcessPriority;
    this.onExitHandler = onExitHandler;
  }

  /**
   * Subscribe to the IPC events from the executable process which includes runtime events from the workers and runtime
   * requests from the workers.
   *
   * - Runtime events are the events which are emitted by the workers during the execution of the collections.
   * - Runtime requests are the special requests which are sent by the workers to the container process. These requests
   *  are used to perform some special actions like token refresh, etc. These requests are handled by the container
   *  process and the response is sent back to the workers.
   *
   * @param {string} threadId - Id of the thread to subscribe to
   *
   * @returns {{unsubscribeRuntimeEvents: *, unsubscribeRuntimeRequests: *}} - Returns the unsubscribe functions for
   * runtime events and runtime requests.
   */
  subscribeForThread (threadId) {
    return {
      unsubscribeRuntimeEvents: this.ipcNode.subscribe(threadId, this.workerEventCallback),
      unsubscribeRuntimeRequests: this.ipcNode.subscribe(`${threadId}:runtimeRequest`, this.handleRuntimeRequest.bind(null, threadId)),
    };
  }

  /**
   * Handles the runtime requests from the workers. Currently, only token refresh requests are handled.
   *
   *  For the token refresh request, the flow is as follows:
   *  1. Token manager acts as a central authority for all the tokens. It is responsible for refreshing the tokens
   *  asynchronously and persisting them in memory and serving them on demand.
   *  2. Workers will send a token refresh request to the container process when runtime requests for a token.
   *  3. Container process will forward the request to the token manager.
   *  4. Token manager will check for the token and send the response back to the container process.
   *  5. Container process will forward the response to the worker.
   *  6. Worker will forward the token to runtime for using it in the request.
   *
   * @param {string} threadId - Id of the thread which sent the request
   * @param {string|object} payload - Payload of the request
   *
   * @throws {Error} - Throws error if the payload is string and not a valid JSON
   *
   * @returns {Promise<void>}
   */
  handleRuntimeRequest = async (threadId, payload) => {
    const { data, requestType, workloadId, sequenceId } = typeof payload === 'string' ? JSON.parse(payload) : payload;

    switch (requestType) {
      case 'oauth2-token-refresh':
        try {
          // Get the access token from the token manager
          const { accessToken } = await system.invoke('tokenManager', {
            method: 'getToken',
            args: [data]
          });

          // Send the response with token, back to the worker
          this.ipcNode.send('runtimeRequestResponse', {
            threadId,
            requestType,
            refreshId: data.refreshId,
            accessToken,
            sequenceId
          });
        }
        catch (e) {
          // Continue with the execution even if the token refresh fails as runtime will be able to use last known
          // token for the request.
          log.error(`ThreadGroup ~ Error while refreshing token for thread ${threadId}`, e);
        }

        break;

      case 'get-system-proxy':
        try {
          const proxyConfig = await system.getSystemProxy(data.url);

          // Send the response with proxy-config, back to the worker
          this.ipcNode.send('runtimeRequestResponse', {
            threadId,
            requestType,
            proxyFetchId: data.proxyFetchId,
            url: data.url,
            proxyConfig,
            sequenceId
          });
        }
        catch (e) {
          // Continue with the execution even if the token refresh fails as runtime will be able to use last known
          // token for the request.
          log.error(`ThreadGroup ~ Error while getSystemProxy for thread ${threadId}`, e.toString());
        }

        break;

      case 'refreshVUData':
        try {
          // Get new data for the workload scenario
          const VUData = await system.invoke('workloadManager', {
            method: 'getDataForScenario',
            args: [workloadId]
          });

          // Send the response with vuData, back to the worker
          this.ipcNode.send('runtimeRequestResponse', {
            threadId,
            requestType: 'vu-data',
            workloadId,
            VUData,
            sequenceId
          });
        } catch (e) {
          // Continue with the execution even if the vu data fetch fails as there will be some slice of data
          // available for runs and every new assignment will have a new slice of data which will act like a
          // refreshed data for the run.
          log.error(`ThreadGroup ~ Error while sending refresh VU data for thread ${threadId}`, e.toString());
        }

        break;

      default:
        log.warn(`ThreadGroup ~ Received unknown runtime request type ${requestType} for thread ${threadId}`);
    }
  };

  /**
   * Unsubscribe from the IPC events from the executable process for the given thread.
   *
   * @param {string} threadId - Id of the thread to unsubscribe from
   *
   * @throws {Error} - Throws error if the thread does not exist
   *
   * @returns {void}
   */
  unsubscribeForThread (threadId) {
    if (this.threads.has(threadId)) {
      this.threads.get(threadId).unsubscribeRuntimeEvents();
      this.threads.get(threadId).unsubscribeRuntimeRequests();
    }
    else {
      createError({
        message: 'ThreadGroup ~ Attempted to unsubscribe from a thread that does not exist',
        source: 'Engine.ThreadGroup.unsubscribeForThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR
      });
    }
  }

  init = async () => {
    if (this.initializing || this.initialized) {
      return;
    }

    // Priority of the container process is set to below normal so that it does not interfere with the main process
    // or renderer processes or any other OS processes. Rest of the OS functions will be given priority over this
    // process. This is done to ensure that the main process and renderer processes are not starved of CPU cycles and
    // the OS is responsive.
    let configuredWorkerPriority = osConstants.priority.PRIORITY_BELOW_NORMAL;

    // If the priority was overridden by engine, validate it and use it.
    if (Object.values(osConstants.priority).includes(this.processPriority)) {
      configuredWorkerPriority = this.processPriority;
    }

    log.info('ThreadGroup ~ Starting worker-process with priority', configuredWorkerPriority, 'for thread group', this.id);

    this.initializing = true;

    if (this.isStopping) {
      // Assignment is stopped, so we don't want to start any worker-processes. Not doing so might cause the
      // worker-processes to be orphaned and continue running.
      createError({
        message: 'ThreadGroup ~ Starting worker-process while process manager is stopping',
        source: 'processManager.startSubProcess',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    const workerProcessId = `${WORKER_CONTAINER_IDENTIFIER}_${this.id}`;

    this.pid = await system.spawnWorkerProcess({
      id: workerProcessId,
      path: THREAD_GROUP_EXECUTABLE,
      priority: configuredWorkerPriority
    });

    if (this.isStopping) {
      // If the thread-group is stopped while the actual worker-process is starting, we need to kill the worker-process
      // and detach its IPC node. Not doing so might cause the worker-process to be orphaned and continue running.
      if (this.ipcNode) {
        detachIpcNode(this.ipcNode);
      }

      await system.terminateWorkerProcess({ pid: this.pid });

      createError({
        message: 'ThreadGroup ~ Started a worker-process while process manager is stopping, killing it.',
        source: 'Engine.Engine.ThreadGroup.create',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    this.ipcNode = await attachIpcNode(workerProcessId);

    this.initializing = false;
    this.initialized = true;
    this.isStopping = false;

    // Let the process perform its startup tasks and pass down system config options before proceeding.
    await runTimeoutPromise(this.ipcNode.invoke('ready', system.getConfigurationOptions()));

    // Since the main process spawns the worker-processes, it needs to listen to the exit events of the worker-processes
    // and when one of them dies, it sends out the broadcast to the execution-process to take the actions needed
    pm.sdk.ipc.subscribe(WORKER_PROCESS_EXITED_CHANNEL, async (event, message) => {
      const payload = JSON.parse(message);

      let replaceThreadGroup = true;

      // This needs to be handled based on the process that has died, else for each worker that exists, we'll run this
      // many times, equal to the number of worker-processes / thread-groups
      if (payload.pid === this.pid) {
        try {
          // Container process has died, if the engine is still running, we need to terminate all the active workloads since
          // the container process is dead and there is no way to communicate with the worker threads and the test performance
          // might have degraded.
          if (!this.isStopping) {
            const activeWorkloads = system.getInstances('workloadManager');

            for (const [_, workload] of activeWorkloads) {
              if (workload.state === WORKLOAD_STATES.RUNNING) {
                await workload.terminate();

                replaceThreadGroup = false;
              }
              else if ([WORKLOAD_STATES.STOPPING, WORKLOAD_STATES.TERMINATING, WORKLOAD_STATES.TERMINATED, WORKLOAD_STATES.FINISHING].includes(workload.state)) {
                replaceThreadGroup = false;
              }
            }
          }
        }
        catch (e) {
          log.error('Failed to terminate active workloads', e, e.stack);
        }

        // The threadGroup replacement should only happen if we did not terminate the workload above.
        this.onExitHandler && this.onExitHandler({ threadGroup: this, replaceThreadGroup });
      }
    });
  };

  destroy = () => {
    process.exit();
  };

  kill = async () => {
    await system.terminateWorkerProcess({ pid: this.pid });
  };

  stop = async () => {
    this.isStopping = true;

    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to stop. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    try {
      await invokeOnIPC(this.ipcNode, { method: 'stopAll' });
    }
    catch (e) {
      log.error('[ThreadGroup] Failed to stop all threads. Killing group explicitly.', e);

      try {
        await this.kill();
      }
      catch (e) {
        log.debug('[ThreadGroup] Process might have exited already.', e);
      }
    }
    finally {
      this.isStopping = false;
    }
  };

  createThread = async () => {
    if (this.isStopping) {
      // Assignment is stopped, so we don't want to start any workers. Not doing so might cause the workers
      // to be orphaned and continue running.
      createError({
        message: 'ThreadGroup ~ Starting worker while group is stopping',
        source: 'Engine.ThreadGroup.startWorkerThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to create a thread. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    const thread = await invokeOnIPC(this.ipcNode, { method: 'addThread', args: [`${this.id}#${uuid()}`] });

    if (this.isStopping) {
      // If the worker manager is stopped while the worker is starting, we need to kill the worker.
      // Not doing so might cause the worker to be orphaned and continue running.

      const isWorkerAlive = await isAlive(this.ipcNode);

      if (!isWorkerAlive) {
        log.info(`Worker is not alive, unable to remove a thread. id: ${this.id}, pid: ${this.pid}`);
        return;
      }

      try {
        await invokeOnIPC(this.ipcNode, { method: 'removeThread', args: [thread.id] });
      }
      catch (e) {
        await this.kill();

        createError({
          error: e,
          message: 'ThreadGroup ~ Failed to remove unwanted thread while stopping. Killing Group.',
          source: 'Engine.ThreadGroup.startWorkerThread',
          subsystem: 'ScenarioManager',
          severity: CONSTANTS.SEVERITY.CRITICAL
        });
      }

      createError({
        message: 'ThreadGroup ~ Started a worker while worker manager is stopping, killing it.',
        source: 'Engine.ThreadGroup.startWorkerThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    thread.group = this;
    thread.stop = this.removeThread.bind(this, thread.id);
    thread.assignRun = this.assignRun.bind(this, thread.id);
    thread.stopRun = this.stopRun.bind(this, thread.id);
    thread.abortRun = this.abortRun.bind(this, thread.id);

    this.threads.set(thread.id, this.subscribeForThread(thread.id));

    return thread;
  };

  removeThread = async (threadId) => {
    const thread = this.threads.has(threadId);

    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to remove a thread. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    if (thread) {
      try {
        await invokeOnIPC(this.ipcNode, {
          method: 'removeThread',
          args: [threadId]
        });

        this.unsubscribeForThread(threadId);
      }
      catch (e) {
        createError({
          error: e,
          message: 'ThreadGroup ~ Failed to remove thread',
          source: 'Engine.ThreadGroup.removeWorkerThread',
          subsystem: 'ScenarioManager',
          severity: CONSTANTS.SEVERITY.ERROR
        });
      }

      this.threads.delete(threadId);
    }
    else {
      createError({
        message: 'ThreadGroup ~ Attempted to remove a worker that does not exist',
        source: 'Engine.ThreadGroup.removeWorkerThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR
      });
    }
  };

  assignRun = async (workerId, [{ executionContext, data }]) => {
    if (!this.threads.has(workerId)) {
      createError({
        message: `ThreadGroup ~ Attempted to assign a run to a worker [${workerId}] that does not exist`,
        source: 'Engine.ThreadGroup.assignScenario',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    if (!executionContext) {
      log.error('ThreadGroup ~ No execution context provided for scenario execution');

      createError({
        message: 'ThreadGroup ~ No execution context provided for scenario execution',
        source: 'Engine.ThreadGroup.assignScenario',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    if (!data || !data.collection) {
      log.error('ThreadGroup ~ No collection provided for scenario execution');

      createError({
        message: 'ThreadGroup ~ No collection provided for scenario execution',
        source: 'Engine.ThreadGroup.assignScenario',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL
      });
    }

    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to assign-run. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    try {
      await invokeOnIPC(this.ipcNode, {
        method: 'assignRun',
        args: [workerId, executionContext, data]
      });
    } catch (e) {
      createError({
        error: e,
        message: 'ThreadGroup ~ Failed to assign run to worker',
        source: 'Engine.ThreadGroup.assignScenario',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR
      });
    }
  };

  /**
   * Sends a message to the thread group process to signal a particular thread to stop a run.
   *
   * @param {string} workerId - The id of the worker to stop the run on
   * @param {object} executionContext - The execution context of the run to stop
   *
   * @returns {Promise<*>}
   */
  stopRun = async (workerId, executionContext) => {
    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to stop run in the thread group. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    try {
      return await invokeOnIPC(this.ipcNode, {
        method: 'stopRun',
        args: [workerId, executionContext]
      });
    } catch (e) {
      createError({
        error: e,
        message: 'ThreadGroup ~ Failed to stop run',
        source: 'Engine.ThreadGroup.stopRun',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR
      });
    }
  };

  /**
   * Sends a message to the thread group process to signal a particular thread to abort a run.
   *
   * @param {string} workerId - The id of the worker to abort the run on
   * @param {object} executionContext - The execution context of the run to abort
   *
   * @returns {Promise<*>}
   */
  abortRun = async (workerId, executionContext) => {
    const isWorkerAlive = await isAlive(this.ipcNode);

    if (!isWorkerAlive) {
      log.info(`Worker is not alive, unable to abort. id: ${this.id}, pid: ${this.pid}`);
      return;
    }

    try {
      return await invokeOnIPC(this.ipcNode, {
        method: 'abortRun',
        args: [workerId, executionContext]
      });
    } catch (e) {
      createError({
        error: e,
        message: 'ThreadGroup ~ Failed to abort run',
        source: 'Engine.ThreadGroup.abortRun',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR
      });
    }
  };
}

module.exports = ThreadGroup;
