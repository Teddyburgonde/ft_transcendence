const { BrowserWindow, powerMonitor } = require('electron');
const os = require('os');

/**
 * Sends screen lock/unlock event to all browser windows
 * @param {string} eventType - Type of power event (lock-screen/unlock-screen)
 */
function sendScreenLockEvent (eventType) {
  pm.logger.info('Emitting screen event on main process', eventType);

  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('screen-event', {
      event: eventType,
      os: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        type: os.type(),
      },
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Initializes screen lock/unlock event listeners
 */
function initScreenEvents () {
  powerMonitor.on('lock-screen', () => sendScreenLockEvent('lock-screen'));
  powerMonitor.on('unlock-screen', () => sendScreenLockEvent('unlock-screen'));
}

module.exports = {
  initScreenEvents
};
