const IPC = require('./ipc');
const screenEvents = require('./screenEvents');

screenEvents.initScreenEvents();

module.exports = {
  IPC
};
