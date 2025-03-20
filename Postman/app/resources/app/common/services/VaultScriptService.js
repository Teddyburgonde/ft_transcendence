class VaultScriptService {
  constructor () {
    this.actionCallbacks = new Map();
    this._eventEmitter = null;
  }

  setEventEmitter (emitter, channel) {
    this._eventEmitter = {
      emit: (message) => {
        if (emitter) {
          emitter(channel, message);
        } else {
          pm.logger.error('No event emitter available for vault event emission');
        }
      }
    };
  }

  resolveAction (actionId, result) {
    const callback = this.actionCallbacks.get(actionId);
    if (callback) {
      callback(result);
      this.actionCallbacks.delete(actionId);
    }
  }

  storeActionCallback (actionId, callback) {
    this.actionCallbacks.set(actionId, callback);
  }

  emit (message) {
    if (this._eventEmitter) {
      this._eventEmitter.emit(message);
    } else {
      pm.logger.warn('No event emitter available for vault event emission');
    }
  }
}

module.exports = VaultScriptService;
