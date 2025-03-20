// src/index.ts
var EventChannel = class {
  constructor() {
    this.isClosed = false;
    this.peer = null;
    this.eventQueue = [];
    this.eventHandlers = [];
    this.cleanupCallbacks = [];
  }
  receive(event) {
    if (this.isClosed) {
      return;
    }
    for (const handler of this.eventHandlers) {
      Promise.resolve(event).then(handler.wrapped);
    }
  }
  get closed() {
    return this.isClosed;
  }
  on(eventType, callback) {
    if (this.isClosed) {
      return this;
    }
    const wrapped = (event) => {
      if (!this.isClosed && event.type === eventType) {
        callback(event);
      }
    };
    this.eventHandlers.push({ wrapped, original: callback, eventType });
    return this;
  }
  off(eventType, callback) {
    for (let i = 0; i < this.eventHandlers.length; ++i) {
      const handler = this.eventHandlers[i];
      if (handler?.original === callback && handler?.eventType === eventType) {
        this.eventHandlers.splice(i, 1);
        break;
      }
    }
    return this;
  }
  onAll(callback) {
    if (this.isClosed) {
      return this;
    }
    const wrapped = (event) => {
      if (!this.isClosed) {
        callback(event);
      }
    };
    this.eventHandlers.push({ wrapped, original: callback, eventType: null });
    return this;
  }
  offAll(callback) {
    for (let i = 0; i < this.eventHandlers.length; ++i) {
      const handler = this.eventHandlers[i];
      if (handler?.original === callback && handler?.eventType === null) {
        this.eventHandlers.splice(i, 1);
        break;
      }
    }
    return this;
  }
  onCleanup(callback) {
    if (this.isClosed) {
      Promise.resolve().then(callback);
    } else {
      this.cleanupCallbacks.push(callback);
    }
    return this;
  }
  offCleanup(callback) {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index !== -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
    return this;
  }
  send(event) {
    if (this.isClosed) {
      return;
    }
    if (this.peer) {
      this.peer.receive(event);
    } else {
      this.eventQueue.push(event);
    }
  }
  emit(eventType, payload) {
    this.send({
      type: eventType,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      payload
    });
  }
  async emitSelf(eventType, payload) {
    await new Promise((resolve) => {
      this.on(eventType, resolve);
      this.receive({
        type: eventType,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        payload
      });
      this.off(eventType, resolve);
    });
  }
  close() {
    if (this.isClosed) {
      return;
    }
    this.isClosed = true;
    this.eventHandlers = [];
    while (this.cleanupCallbacks.length) {
      Promise.resolve().then(this.cleanupCallbacks.shift());
    }
    const peer = this.peer;
    if (peer && !peer.isClosed) {
      Promise.resolve().then(() => {
        if (peer === this.peer) {
          peer.close();
        }
      });
    }
  }
  link(peer) {
    if (this.peer) {
      throw new TypeError("This EventChannel already has a linked peer");
    }
    if (peer.peer) {
      throw new TypeError("The peer EventChannel already has a linked peer");
    }
    this.peer = peer;
    peer.peer = this;
    while (this.eventQueue.length) {
      peer.receive(this.eventQueue.shift());
    }
    while (peer.eventQueue.length) {
      this.receive(peer.eventQueue.shift());
    }
    if (this.isClosed !== peer.isClosed) {
      Promise.resolve().then(() => {
        if (peer === this.peer) {
          peer.close();
          this.close();
        }
      });
    }
  }
  unlink(peer) {
    if (this.peer !== peer) {
      return;
    }
    peer.peer = null;
    this.peer = null;
  }
};
((EventChannel2) => {
  function specific(channel) {
    return channel;
  }
  EventChannel2.specific = specific;
})(EventChannel || (EventChannel = {}));
export {
  EventChannel
};
