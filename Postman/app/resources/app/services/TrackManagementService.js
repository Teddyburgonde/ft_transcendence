const ipcMain = pm.sdk.IPC;

const appSettings = require('../utils/appSettingsUtils');

const context = pm.logger.getContext('TrackManagementService', 'client-distribution');

/**
 * The TrackManagementService handles the desktop UI track's state
 * within the Postman desktop app window.
 *
 * The track feature is specifically designed for testing UI changes
 * in remote non-prod environments. Therefore, it should not be initialized
 * for the following `__WP_RELEASE_CHANNEL__` values:
 * - `dev`
 * - `canary`
 * - `prod`
 */
class TrackManagementService {
  /**
   * Initialize the TrackManagementService. This sets up listeners
   * to manage desktop UI track
   */
  initialize () {
    try {
      this.eventBus = pm.eventBus.channel('track-management');
      this.setupListeners();

      pm.logger.info('TrackManagementService: Initialized successfully');
    }
    catch (e) {
      pm.logger.error('TrackManagementService: Initialization failed ', e, { context });
    }
  }

  /**
   * Update the desktop UI track that needs to be opened in the app windows
   *
   * @param {String} trackName desktop UI track name
   */
  async updateDesktopUITrack (trackName) {
    if (!trackName) {
      pm.logger.info('TrackManagementService~updateDesktopUITrack: Desktop UI track name is empty');
      return;
    }

    try {
      pm.logger.info('TrackManagementService~updateDesktopUITrack: Updating the desktop UI track name in the app settings.', trackName);
      await appSettings.setAppSettings('trackName', trackName);
    }
    catch (err) {
      pm.logger.error('TrackManagementService~updateDesktopUITrack: track update failed ', err, { context });
    }
  }

  /**
   * Reset the desktop UI track
   */
  async resetDesktopUITrack () {
    pm.logger.info('TrackManagementService~resetDesktopUITrack: Removing the active desktop UI track from the app settings.');

    try {
      await appSettings.setAppSettings('trackName', '');
    }
    catch (err) {
      pm.logger.error('TrackManagementService~resetDesktopUITrack: track reset failed ', err, { context });
    }
  }

  /**
   * Set up listeners to manage the desktop UI track changes
   */
  setupListeners () {
    pm.logger.info('TrackManagementService~setupListeners: Setting listeners to manage desktop UI track');

    ipcMain.subscribe('setDesktopUITrack', async (event, trackName) => {
      await this.updateDesktopUITrack(trackName);
    });

    ipcMain.subscribe('removeDesktopUITrack', async () => {
      await this.resetDesktopUITrack();
    });
  }
}

module.exports = new TrackManagementService();
