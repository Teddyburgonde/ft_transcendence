const appSettings = require('../services/appSettings').appSettings;


module.exports = {
  /**
   * Retrieve an application setting from Postman appSettings (electron JSON storage)
   * @param {string} key setting key
   * @returns {Promise} Promise that resolves with the retrieved value or reject with error
   */
   getAppSettings: (key) => {
    return new Promise((resolve, reject) => {
      appSettings.get(key, (error, val) => {
        if (error) {
          reject(error);
        } else {
          resolve(val);
        }
      });
    });
  },

  /**
   * Set an application setting in Postman appSettings (electron JSON storage)
   * @param {string} key setting key
   * @param {string} value setting value
   * @returns {Promise} Promise that resolves once the set operation is successful or rejects with the error
   */
  setAppSettings: (key, value) => {
    return new Promise((resolve, reject) => {
      appSettings.set(key, value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
};
