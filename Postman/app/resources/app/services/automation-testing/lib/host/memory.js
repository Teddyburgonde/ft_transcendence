const os = require('os');
const _ = require('lodash');
const si = require('systeminformation');
const { log } = require('../logging');
const { exec } = require('node:child_process');

const COMMAND_EXECUTION_TIMEOUT_MS = 10000;
const KB_TO_BYTES_MULTIPLIER = 1024;

// Win32_OperatingSystem.FreePhysicalMemory is in KBs.
// Ref: https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-operatingsystem
const ALLOWED_MEMORY_COMMANDS = {
  cimInstance: 'powershell -Command "(Get-CimInstance -ClassName Win32_OperatingSystem).FreePhysicalMemory"',
  wmiObject: 'powershell -Command "(Get-WmiObject -Class Win32_OperatingSystem).FreePhysicalMemory"'
};

/**
 * Get the available memory value based on the allowed command to be executed
 * Executes a command if it is in the list of allowed memory commands.
 * @param {String} command -- enum(cimInstance, wmiObject)
 * command to use either cimInstance (or) wmiObject
 * @returns {Promise<Number>} available memory, in bytes.
 */
async function getAvailableMemoryByCommand (command) {
  return new Promise((resolve, reject) => {
    try {
      if (!_.has(ALLOWED_MEMORY_COMMANDS, command)) {
        throw new Error(`getAvailableMemoryByCommand invoked by an invalid command: ${command}`);
      }

      const runCommand = ALLOWED_MEMORY_COMMANDS[command];

      exec(runCommand, { timeout: COMMAND_EXECUTION_TIMEOUT_MS, windowsHide: true }, (error, stdout, stderr) => {
        if (error || stderr) {
          log.error('getAvailableMemoryByCommand ~ Error while executing shell command', runCommand, error, stderr);

          return reject(error || stderr);
        }

        log.info(`Fetched free physical memory value in KBs using the command ${runCommand}: ${stdout}`);
        const freePhysicalMemBytes = parseInt(stdout.trim(), 10) * KB_TO_BYTES_MULTIPLIER;

        if (Number.isNaN(freePhysicalMemBytes)) {
          return reject(new Error(`Unable to fetch numeric free memory value using the command ${runCommand}`));
        }

        if (freePhysicalMemBytes === 0) {
          // While it's possible for there to be no available/free memory whatsoever, it's unlikely and worth a second look.
          return reject(new Error(`Parsed free memory value is zero using the command ${runCommand}`));
        }

        resolve(freePhysicalMemBytes);
      });
    }
    catch (error) {
      log.error(`getAvailableMemoryByCommand ~ Unable to get memory value via command ${command}`, error?.toString());
      reject(error);
    }
  });
}

/**
 * Get the available physical memory in windows machine, using the following commands/utilities in priority order:
 *   - Get-CimInstance; Ideal interface, for systems with powershell 3.0 and above versions
 *   - Get-WmiObject; Ideal interface for systems with powershell 2.0 and below versions
 *   - os; Information can be unreliable because it provides free system memory in bytes as an integer
 *         without including caches,buffers as System Information(SI) package would do. Can lead to JS heap
 *         out of memory issue.
 *
 * @returns {Promise<Number>} Available memory, in bytes.
 */
async function getAvailableMemoryForWindows () {

  try {

    return await getAvailableMemoryByCommand('cimInstance');
  }
  catch (error) {
    try {
      log.warn('getAvailableMemoryForWindows ~ falling back to WMI Object while calculating available memory in windows');

      return await getAvailableMemoryByCommand('wmiObject');
    }
    catch (error) {
      log.warn('getAvailableMemoryForWindows ~ falling back to os module free memory while calculating available memory in windows');

      return os.freemem();
    }
  }
}

/**
 * Get the memory information
 *
 * @returns {Promise<{total: number, available: number, active: number, used: number, free: number}>}
 */
async function getMemoryInformation () {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    total: totalMemory,
    free: freeMemory,
    used: usedMemory,
    active: (os.platform() === 'win32') ? (os.totalmem() - os.freemem()) : _.pick(await si.mem(), ['active']).active,
    available: (os.platform() === 'win32') ? await getAvailableMemoryForWindows() : _.pick(await si.mem(), ['available']).available,
  };
}

module.exports = {
  getMemoryInformation
};
