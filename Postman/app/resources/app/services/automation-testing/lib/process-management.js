const { processes } = require('./host');

/**
 * @description It is used to detect whether a process is alive
 * @param {number} pid
 * @throws InvalidParamException
 * @returns {Boolean}
 */
const isProcessAlive = (pid) => {
  let isAlive = true;

  if (typeof pid !== 'number' || isNaN(pid)) {
    throw new Error('InvalidParamException - process id should be of type number');
  }

  try {
    // https://nodejs.org/api/process.html#process_process_kill_pid_signal
    // As a special case, a signal of 0 can be used to test for the existence of a process.
    // throws an exception if the parent process doesn't exist anymore.
    process.kill(pid, 0);
  }
  catch (e) {
    isAlive = false;
  }
  return isAlive;
};

/**
 * Kills all the child processes of a given parent process.
 * @param {Number} parentId - Parent process ID.
 * @returns {Promise<void>}
 */
const killAllChildProcesses = async (parentId) => {
  const childProcesses = await processes.getChildProcesses(parentId);

  pm.logger.info('killAllChildProcesses: Found child processes', childProcesses.map(({ pid }) => pid));

  childProcesses.forEach((child) => {
    killProcess(child.pid);
    pm.logger.info(`Force killed child process ${child.pid}`);
  });
};

/**
 * Kills a process.
 *
 * @param {Number} processId - Process ID to kill.
 */
const killProcess = (processId) => {
  try {
    process.kill(processId, 'SIGKILL');
  } catch (error) {
    // Process already exited
  }
};

module.exports = {
  isProcessAlive,
  killAllChildProcesses,
  killProcess
};
