const electron = require('electron');
const { getConfig } = require('./AppConfigService');
const WebVersionService = require('../services/WebVersionService');
const appSettings = require('../utils/appSettingsUtils');
const getQPString = require('../utils/getQPString');
const regionService = require('./region.service.js');

const app = electron.app;
const RELEASE_CHANNEL = getConfig('__WP_RELEASE_CHANNEL__');
const DESKTOP_VERSION_QP = 'desktopVersion';
const WEB_VERSION_QP = 'webVersion';

/**
 * Get the url of the web app that needs to be loaded in the browser window
 * depending on htmlFileName
 *
 * @param {string} htmlFileName Provide HTML file name from HTML_TYPE map
 * @param {Record<string, string>} userContext
 *
 * @returns {Promise<String>}
 */
module.exports = async function getAppUrl (htmlFileName, userContext) {

  let BASE_URL = getConfig('__WP_DESKTOP_UI_UPDATE_URL__');

  if (process.env.RSPACK) {
    // requester is created by desktop-ui and written to build/html and served on /build/js/html
    if (htmlFileName === 'requester.html') {
      BASE_URL = BASE_URL.replace('/build/html', '/build/js/html');
    } else {
      // all other html files are created by desktop-platform and written to build/platform/html, but served at /platform/html
      BASE_URL = BASE_URL.replace('/build/html', '/platform/html');
    }
  }

  const queryParams = await getDesktopReleaseVersionAsQueryParams(userContext);

  // The __WP_MODULE_FEDERATION__ check ensures the page is opened on /workspace
  // when running Web Platform
  if (RELEASE_CHANNEL === 'dev' || getConfig('__WP_MODULE_FEDERATION__') === true) {
    return `${BASE_URL}/${htmlFileName}${queryParams}`;
  }
  return `${BASE_URL}${(/console/).test(htmlFileName) ? '/console' : ''}${queryParams}`;
};

/**
 * Returns the release version as query params
 * @returns {Promise<String>}
 */
async function getDesktopReleaseVersionAsQueryParams (userContext) {
  const webVersion = WebVersionService.version;
  pm?.logger.info(`getDesktopReleaseVersionAsQueryParams: webVersion: ${webVersion}`);
  const queryParams = { [DESKTOP_VERSION_QP]: app.getVersion() };

  if (webVersion) {
    queryParams[WEB_VERSION_QP] = webVersion;
  }

  // We don't want to allow track in dev and prod environments
  if (!['dev', 'prod', 'canary'].includes(RELEASE_CHANNEL)) {
    const appliedDesktopUITrack = await appSettings.getAppSettings('trackName');

    pm.logger && pm.logger.info('getDesktopReleaseVersionAsQueryParams: Looking for the desktop track name ', appliedDesktopUITrack);

    if (appliedDesktopUITrack) {
      queryParams['_track'] = appliedDesktopUITrack;
    }
  }

  if (userContext && userContext.teamId && userContext.userId) {
    queryParams.userId = userContext.userId;
    queryParams.teamId = userContext.teamId;
    queryParams.region = userContext.region || regionService.DEFAULT_REGION;
  }

  return getQPString(queryParams);
}
