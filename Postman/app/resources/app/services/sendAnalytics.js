const electron = require('electron'),
  app = electron.app,
  { getConfig } = require('./AppConfigService'),
  postmanEnv = getConfig('__WP_ENV__');

module.exports = function sendAnalyticsEvent (category, action, label, meta) {
  if (!category || !action) {
    return;
  }

  try {
    const platform = require('os').platform(),
      property_prefix = isEnterpriseApplication() ? 'enterprise_' : '',
      property = property_prefix +
        (platform === 'darwin' ? 'mac_app' :
        platform === 'linux' ? 'linux_app' : 'windows_app'),

      event = {
        category,
        action,
        label,
        meta,
        type: 'events-general',
        indexType: 'client-events',
        env: postmanEnv,
        property,
        propertyId: app.installationId,
        propertyVersion: app.getVersion(),
        timestamp: (new Date()).toISOString()
      };

    fetch(getConfig('__WP_ANALYTICS_URL__'), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: btoa(JSON.stringify(event)),
      credentials: 'omit'
    }).catch((error) => {
      pm.logger.info('sendAnalytics: Error while sending request', error);
    });
  }
  catch (e) {
    pm.logger.info('sendAnalytics: Error while sending event', e);
  }
};

/**
 * Returns a value representing whether the app is enterprise or not
 *
 * @returns {Boolean}
 */
function isEnterpriseApplication () {
  return [
    'PostmanEnterpriseBeta',
    'PostmanEnterprise',
    'PostmanEnterpriseStage'
  ].includes(app.getName());
}
