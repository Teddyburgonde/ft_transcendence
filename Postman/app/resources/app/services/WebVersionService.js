const ipcMain = pm.sdk.IPC;
const { getEventName, getEventNamespace } = require('../common/model-event');

/**
 * WebVersionService takes care of ensuring that the correct web app version
 * is shown in the Postman App windows at all times.
 *
 * TLDR; When the first window is spawned, the Postman application’s main process does not yet have
 * a webVersion, as the web version has not been loaded yet (obvious, right?).
 *
 * As a result, the URL used for the first window will not include the webVersion. Artemis will
 * serve the most recent version available for the current desktop version.
 *
 * Once the webview is spawned, the renderer will trigger an `booted` event, containing
 * the current version of the web application.
 *
 * The WebVersionService will store this version, which will then be used for the URLs of subsequent
 * windows. This ensures that all windows use the same version, providing a consistent experience for our users.
 *
 */
class WebVersionService {
  version = '';

  /**
   * Initialize the WebVersionService. This initializes the
   * version and sets up listeners to handle updation of the
   * version
   *
   * @param {String} version
   */
  initialize (version) {
    try {
      this.version = version;

      /**
       * This event is trigger by the renderer during the clear cache and hard reload phase.
       */
      ipcMain.subscribe('resetWebAppVersion', () => {
        this.resetVersion();
      });

      this.setupListeners();

      pm.logger.info(`WebVersionService: Initialized successfully with version: ${version}`);
    }
    catch (e) {
      pm.logger.error('WebVersionService: Initialization failed ', e);
    }
  }


  /**
   * Set up listeners to manage the cached web version
   */
  setupListeners () {
    // Setting up listener to listen for add, switch, & logout user account events. We need to reset the
    // UI version when these events occur to load the latest version
    pm.eventBus.channel('model-events').subscribe((event) => {
      const eventName = getEventName(event);
      const eventNamespace = getEventNamespace(event);

      if ((eventNamespace === 'users' && (eventName === 'add' || eventName === 'switch' || eventName === 'addAndSwitch')) ||
        (eventNamespace === 'user' && eventName === 'logout')) {
        pm.logger.info('WebVersionService: Resetting UI version as user logged out/switched account');
        this.resetVersion();
      }
    });
  }

  resetVersion () {
    this.version = '';
    pm.logger.info('WebVersionService: Resetting web app version');
  }
}

module.exports = new WebVersionService();
