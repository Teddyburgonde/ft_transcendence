const storage = require('electron-json-storage'),
  sendAnalyticsEvent = require('./sendAnalytics'),
  DB_KEY = 'userPartitionData';
let cache;

const authDataInterface = {
  async init () {
    if (cache) {
      return cache;
    }
    return await this.getAll();
  },

  getAll () {
    return new Promise((resolve, reject) => {
      if (cache) {
        return resolve(cache);
      }
      storage.get(DB_KEY, (err, data) => {
        if (err) {
          sendAnalyticsEvent('auth-data-getAll', 'failed', `${err && err.name}:${err && err.message}`);
          return reject(err);
        }

        sendAnalyticsEvent('auth-data-getAll', 'successful');
        cache = data;
        resolve(data);
      });
    });
  },

  getItem (key) {
    if (!key) {
      return Promise.resolve(null);
    }

    if (cache) {
      return Promise.resolve(cache[key]);
    }

    return new Promise((resolve, reject) => {
      storage.get(DB_KEY, (err, data) => {
        if (err) {
          sendAnalyticsEvent('auth-data-getItem', 'failed', `${err && err.name}:${err && err.message}`);
          return reject(err);
        }

        sendAnalyticsEvent('auth-data-getItem', 'successful');
        cache = data;
        resolve(data[key]);
      });
    });
  },

  setItem (key, value) {
    return this.getAll()
      .then((data) => {
        // change the value for the specific key
        data[key] = value;
        return this.setData(data);
      });
  },

  setData (data) {
    if (!data) {
      return Promise.resolve();
    }

    data = this.sanitizeData(data);

    return new Promise((resolve, reject) => {
      storage.set(DB_KEY, data, (err) => {
        if (err) {
          sendAnalyticsEvent('auth-data-setData', 'failed', `${err && err.name}:${err && err.message}`);
          return reject(err);
        }

        sendAnalyticsEvent('auth-data-setData', 'successful');
        cache = data;
        resolve();
      });
    });
  },

  exists () {
    return new Promise((resolve, reject) => {
      storage.has(DB_KEY, (err, hasKey) => {
        if (err) {
          sendAnalyticsEvent('auth-data-exists', 'failed', `${err && err.name}:${err && err.message}`);
          return reject(err);
        }

        sendAnalyticsEvent('auth-data-exists', 'successful');
        resolve(hasKey);
      });
    });
  },

  clear () {
    return new Promise((resolve, reject) => {
      storage.remove(DB_KEY, (err) => {
        if (err) {
          sendAnalyticsEvent('auth-data-remove', 'failed', `${err && err.name}:${err && err.message}`);
          return reject(err);
        }

        sendAnalyticsEvent('auth-data-remove', 'successful');
        cache = null;
        resolve();
      });
    });
  },

  sanitizeData (data) {
    if (!data) {
      return;
    }

    let v8Partitions = data.v8Partitions;

    if (v8Partitions) {
      Object.keys(v8Partitions).forEach((key) => {
        if (v8Partitions[key]?.meta?.auth) {
          delete v8Partitions[key].meta.auth;
        }
      });
    }

    return data;
  }
};

module.exports = authDataInterface;
