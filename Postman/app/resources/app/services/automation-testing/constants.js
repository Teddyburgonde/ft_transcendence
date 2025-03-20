const constants = {};

constants.START_WORKER_PROCESS_CHANNEL = 'start-perf-test-worker-process';
constants.TERMINATE_WORKER_PROCESS_CHANNEL = 'terminate-perf-test-worker-process';
constants.START_WORKER_PROCESS_RESULT_CHANNEL = 'worker-processes-start-result';
constants.TERMINATE_WORKER_PROCESS_RESULT_CHANNEL = 'worker-processes-terminate-result';
constants.WORKER_PROCESS_EXITED_CHANNEL = 'worker-process-exited';

module.exports = constants;
