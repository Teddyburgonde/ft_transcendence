const WorkerThread = require('../Worker/WorkerThread');
const { startup } = require('./_thread-group-lifecycle');
const { sendEventOnIPC, subscribeOnIPC, CONSTANTS, createError, } = require('../../lib/communication');
const { log } = require('../../lib/logging');

/**
 * Executable for a thread group. This is the entry point for the thread group subprocess. This will be responsible
 * for starting the thread group and managing the threads in the thread group. This will also be responsible for
 * communicating with the parent process by acting like a proxy b/w parent process and threads.
 */
class ThreadGroupExecutable {
  /**
   * Thread group members
   * @type {Map<string, WorkerThread>}
   */
  members = new Map();
  sequencesForThread = new Map();
  contextOfSequences = new Map();

  isStopping = false;

  urlProxyConfigMap = new Map();

  /**
   * A health-check for the worker-process.
   *
   * @returns {Boolean} Always true
   */
  isAlive = () => {
    log.info('Thread group is alive and well');

    return true;
  };

  /**
   * Called when the thread group executable is started and IPC is established.
   * This will be called from the lifecycle manager of the executable.
   */
  onStartup = () => {
    // Subscribe to the runtime request response channel to receive the responses from the parent process (ExecutionSystem)
    subscribeOnIPC('runtimeRequestResponse', (payload) => {
      payload = typeof payload === 'string' ? JSON.parse(payload) : payload;

      const { threadId, requestType, ...data } = payload,
        worker = this.members.get(threadId);

      if (requestType === 'get-system-proxy') {
        this.urlProxyConfigMap.set(data.url, data.proxyConfig);
      }

      worker.handleRuntimeRequestResponse(payload);
    });
  };

  /**
   * Adds a thread to the thread group. This will be called from the parent process.
   *
   * @param {string} id - Id of the thread
   *
   * @returns {{id}} - Thread reference UID
   */
  addThread = (id) => {
    if (!id) {
      createError({
        message: 'ThreadGroupExecutable ~ Cannot start a worker without an id.',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.startWorkerThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL,
      });
    }

    if (this.isStopping) {
      createError({
        message: 'ThreadGroupExecutable ~ Cannot start a worker while thread group is stopping.',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.startWorkerThread',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.CRITICAL,
      });
    }

    log.info('ThreadGroupExecutable ~ Adding thread', id);

    const worker = new WorkerThread(
      { id },
      (data) => this.handleRunEvents(data, id),
      (data) => this.handleRuntimeRequest(data, id),
      () => this.handleThreadExit(id)
    );

    this.members.set(id, worker);
    this.sequencesForThread.set(id, new Set());

    return { id };
  };

  /**
   * Handles the propagation of run events from the worker thread to the execution process
   *
   * @param {Object} payload - The payload sent by the runtime request/callback
   * @param {String} threadId - The id of the worker thread which is the source of the request
   */
  handleRunEvents = (payload, threadId) => {
    if (payload.event === 'allRunFinished') {
      this.sequencesForThread.get(threadId).delete(payload.executionContext.sequenceId);
      this.contextOfSequences.delete(payload.executionContext.sequenceId);
    }

    sendEventOnIPC(threadId, 'runEvents', payload, false);
  };

  /**
   * Handles and callbacks from runtime
   *
   * @param {Object} payload - The payload sent by the runtime request/callback
   * @param {String} threadId - The id of the worker thread which is the source of the request
   */
  handleRuntimeRequest = (payload, threadId) => {
    if (payload.requestType === 'get-system-proxy') {
      const url = payload.data.url;

      if (this.urlProxyConfigMap.has(url)) {
        const proxyConfig = this.urlProxyConfigMap.get(url),
          worker = this.members.get(threadId),
          proxyFetchId = payload.data.proxyFetchId;

        worker.relayMessageToWorkerThread({
          threadId,
          requestType: 'get-system-proxy',
          proxyFetchId,
          url,
          proxyConfig,
          sequenceId: payload.sequenceId
        });

        return;
      }
    }

    sendEventOnIPC(`${threadId}:runtimeRequest`, 'handleRuntimeRequestCallback', payload, false);
  };

  /**
   * Handles the exit of a thread. This will be called from the container process whenever a thread exits with an error
   *
   * @param {string} threadId
   */
  handleThreadExit = (threadId) => {
    log.info(`ThreadGroupExecutable - Thread ${threadId} exited`);

    // Get all the sequences that were executing on this thread and send them all error messages so that
    // they can assign more runs to the new thread that we have just created
    this.sequencesForThread.get(threadId).forEach((sequenceId) => {
      const runContext = this.contextOfSequences.get(sequenceId);

      sendEventOnIPC(threadId, 'runEvents',
        {
          executorReferenceId: runContext.executionContextId,
          event: 'error',
          executionContext: runContext,
          timestamp: new Date().toISOString()
        }
      );
    });

    // Add a replacement thread only if the thread group is not stopping and the thread
    // that exited was a member of the thread group (which means we did not stop it intentionally)
    if (!this.isStopping && this.members.has(threadId)) {
      // Remove the existing thread from the thread group
      this.members.delete(threadId);

      // Create a new thread with the same ID and add it to the thread group
      this.addThread(threadId);

      log.info(`ThreadGroupExecutable - New thread created to replace the one that exited ${threadId}`);
    }
  };

  /**
   * Removes a thread from the thread group. This will be called from the parent process.
   *
   * @param {string} threadId - thread id
   *
   * @returns {Promise<void>}
   */
  removeThread = async (threadId) => {
    const thread = this.members.get(threadId);

    if (thread) {
      log.info('ThreadGroupExecutable - Removing thread', threadId);

      await thread.stop();

      // Since thread is stopped, remove all listeners to avoid memory leaks.
      thread.removeAllListeners();

      this.members.delete(threadId);
    } else {
      createError({
        message: 'ThreadGroupExecutable ~ Attempted to remove a worker that does not exist',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.removeThread ',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR,
      });
    }
  };

  /**
   * Assigns a run to a thread. This will be called from the parent process.
   *
   * @param {string} threadId - thread id
   * @param {object} executionContext - execution context
   * @param {object} data - run data
   *
   * @returns {Promise<void>}
   */
  assignRun = (threadId, executionContext, data) => {
    const thread = this.members.get(threadId);

    log.debug('ThreadGroupExecutable ~ Assigning run to thread', threadId);

    this.sequencesForThread.get(threadId).add(executionContext.sequenceId);
    this.contextOfSequences.set(executionContext.sequenceId, executionContext);

    if (thread) {
      return thread.assignRun({
        executorReferenceId: threadId,
        collection: data.collection,
        environment: data.environment,
        globals: data.globals,
        requestSelection: data.requestSelection,
        VUData: data.VUData,
        count: 1,
        executionContext: Object.assign(executionContext, { executorReferenceId: threadId }),
        runOptions: data.runOptions || {}
      });
    } else {
      createError({
        message: 'ThreadGroupExecutable ~ Attempted to assign a run to a worker that does not exist',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.assignRun',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR,
      });
    }
  };

  /**
   * Stops a run on a thread. This will be called from the parent process (execution process) to abort a particular
   * run running on a thread of this process.
   *
   * @param {string} threadId - thread id on which the run is running
   * @param {object} executionContext - execution context of the run
   *
   * @returns {Promise<*>}
   */
  stopRun = (threadId, executionContext) => {
    const thread = this.members.get(threadId);

    log.debug('ThreadGroupExecutable ~ Stopping run on thread', threadId);

    if (thread) {
      return thread.stopRun(executionContext);
    }
    else {
      createError({
        message: 'ThreadGroupExecutable ~ Attempted to stop a run from a worker that does not exist',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.stopRun',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR,
      });
    }
  };

  /**
   * Aborts a run on a thread. This will be called from the parent process (execution process) to abort a particular
   * run running on a thread of this process.
   *
   * @param {string} threadId - thread id on which the run is running
   * @param {object} executionContext - execution context of the run
   *
   * @returns {Promise<*>}
   */
  abortRun = (threadId, executionContext) => {
    const thread = this.members.get(threadId);

    log.debug('ThreadGroupExecutable ~ Aborting run on thread', threadId);

    if (thread) {
      return thread.abortRun(executionContext);
    }
    else {
      createError({
        message: 'ThreadGroupExecutable ~ Attempted to abort a run from a worker that does not exist',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.abortRun',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR,
      });
    }
  };

  /**
   * Stops all threads in the thread group. This will be called from the parent process when the run is stopped.
   *
   * @returns {Promise<void>}
   */
  stopAll = async () => {
    this.isStopping = true;

    log.info('[ThreadGroupExecutable] ~ Stopping all threads');

    // Stop all threads using Promise.allSettled to make sure all threads are stopped even if one of them fails to stop.
    const results = await Promise.allSettled([...this.members.values()].map(({ id }) => this.removeThread(id)));
    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length) {
      log.error({
        message: 'ThreadGroupExecutable ~ Failed to stop all threads',
        source: 'Engine.ThreadGroup.ThreadGroupExecutable.stopAll',
        subsystem: 'ScenarioManager',
        severity: CONSTANTS.SEVERITY.ERROR,
        data: {
          failed,
        },
      });

      // If any of the threads failed to stop, kill the thread group process to make sure cleanup is done properly.
      this.kill();
    }

    this.isStopping = false;
  };

  /**
   * Kills the thread group process. This will be called from the parent process.
   */
  kill = () => {
    log.info('ThreadGroupExecutable ~ Killing container');

    // 9 => SIGKILL
    process.exit(9);
  };
}

startup(new ThreadGroupExecutable());
