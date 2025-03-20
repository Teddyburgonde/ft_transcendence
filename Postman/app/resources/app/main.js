const { enablePerftrace, perftraceBegin, perftraceEnd } = require('./services/perftraceService');
enablePerftrace();

// IMPORTANT: This file needs to be loaded as early as possible when the app starts
require('./preload');

const { AppLaunchPerfService } = require('./services/AppLaunchPerfService'),
  { ElectronCrashReporter } = require('./services/ElectronCrashReporter');

AppLaunchPerfService.init();
ElectronCrashReporter.init();

// Node.JS dependencies
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');

// Third party dependencies
const { app, BrowserWindow, Menu, dialog, shell, nativeTheme, contentTracing } = require('electron');
const _ = require('lodash').noConflict();
const jsonStorage = require('electron-json-storage');

// Internal dependencies
const menuManager = require('./services/menuManager').menuManager;
const appSettings = require('./services/appSettings').appSettings;
const proxyUtils = require('./utils/proxy/utils').utils;
const { getOrCreateInstallationId } = require('./services/id');
const initializeEventBus = require('./common/initializeEventBus');
const { isAppUpdateEnabled } = require('./services/AutoUpdaterService');
const gpu = require('./services/gpu');
const updaterHandler = require('./services/UpdaterHandler');
const enterpriseUtils = require('./services/enterpriseUtil');
const ProtocolHandler = require('./services/ProtocolHandler');
const interceptorConnection = require('./services/InterceptorConnection').interceptorConnection;
const initializeLogger = require('./services/Logger').init;
const CrashReporter = require('./services/CrashReporter');
const { getValue } = require('./utils/processArg');
const cloudProxyManager = require('./services/CloudProxyManager');
const ProxyMainManager = require('./services/ProxyMainManager');
const WebVersionService = require('./services/WebVersionService');
const architectureService = require('./services/ArchitectureService');
const WindowController = require('./common/controllers/WindowController');
const { performShellDataMigration, isShellMigrationDone } = require('./services/shellDataMigration');
const i18nService = require('./services/i18n/i18nService');
const authPartitionService = require('./services/authPartitionService');
const { getConfig } = require('./services/AppConfigService');
const RELEASE_CHANNEL = getConfig('__WP_RELEASE_CHANNEL__');

// Constants
const {
  MAC_TRAFFIC_LIGHT_POSITION_DEFAULT,
  MAC_TRAFFIC_LIGHT_Y_POSITION_FOR_ZOOM
} = require('./constants/WindowConstants');
const { PERF_MEASURES, PERF_MARKS } = require('./constants/PerformanceAnalyticsConstants');
const { IPC_EVENT_NAMES } = require('./constants');
const MOVE_DIALOG_MESSAGE = 'Move to Applications Folder?';
const MOVE_DIALOG_ACTION_BUTTON = 'Move to Applications Folder';
const MOVE_DIALOG_CANCEL_BUTTON = 'Do Not Move';
const MOVE_DIALOG_CHECKBOX_MESSAGE = 'Do not remind me again';
const MOVE_DIALOG_DETAILS = 'I can move myself to the Applications folder if you\'d like. This will ensure that future updates will be installed correctly.';
const SUPPORT_LINK = 'https://go.pstmn.io/troubleshoot-could-not-open';
const COULD_NOT_OPEN_DIALOG_TITLE = 'Could not open Postman';
const COULD_NOT_OPEN_DIALOG_MESSAGE = 'Please try restarting the app. If the issue persists, please refer to ' + SUPPORT_LINK;

// We upgraded Electron to v7 that comes with node v12 in Postman v7.25.1. The default minimum
// supported version of TLS in node v10 was v1 which was changed to v1.2 in node v12
// Due to this, users still using the old servers won't be able to use Postman to send request
// See https://github.com/postmanlabs/postman-app-support/issues/8565
// As a fix, we are overriding this default minimum version of TLS back to v1
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

// https://postmanlabs.atlassian.net/browse/INC-735
// We uppgraded Electron 28 that comes with node v18 in Postman v11.6.0. Node v17 introduced a
// change where the default result order for DNS lookups was passed as-is to the underlying call.
// This caused an issue where the user's with servers bound to the IPV4 addresses 0.0.0.0 were not
// able to connect due to the DNS lookup returning an IPV6 address.
// As a fix, we are overriding the default result order for DNS lookups to ipv4first
require('dns').setDefaultResultOrder('ipv4first');

performance.mark(PERF_MARKS.MAIN_PROCESS_IMPORTS_COMPLETE);
performance.measure(PERF_MEASURES.MAIN_PROCESS_IMPORTS_TIME);

const proxyMainManager = new ProxyMainManager();
const ipcMain = pm.sdk.IPC;
let executionSystemManager;
let contentTracingRecorder;
let ipcClientInitialized = false;
let webSocketServerInitialized = false;

try {
  // set the path for the directory storing app's configuration files
  getValue('user-data-path') && app.setPath('userData', getValue('user-data-path'));
}
catch (e) {
  pm.logger.error(e);
}

app.sessionId = process.pid; // set the current process id as sessionId

perftraceBegin('request single instance lock');
(function () {
  let gotTheLock = app.requestSingleInstanceLock();

  // Quit if this is another instance of app trying to open
  if (!gotTheLock) {
    pm.logger.info('Could not get the lock, quitting');
    app.quit();

    return;
  }
})();
perftraceEnd('request single instance lock');


// Initializing ProtocolHandler as early as possible to handle Run-In-Postman even when the app is closed.
// Recommended to do it on will-finish-launching event in electron docs - https://electronjs.org/docs/api/app#event-will-finish-launching
app.on('will-finish-launching', function () {
  ProtocolHandler.init();
});

perftraceBegin('disable GPU');

// Disable GPU if needed. It is important to make sure this
// is done *before* the application emits the "ready" event,
// otherwise disabling the GPU might not have any effect.
if (gpu.shouldDisableGPU()) {
  gpu.disableGPU().catch((error) => {
    pm.logger.error('Main~GPU - Error while trying to disable GPU', error);
  });
} else {
  pm.logger.info('Not disabling GPU');
}
perftraceEnd('disable GPU');

/**
 * These are initialization steps that do not have to block the launch of the first app window.
 *
 * They are executed after the first window is opened.
 */
function deferredInitSteps () {
  let initialising = false;

  pm.eventBus.channel('runtime-ipc-lifecycle').subscribe((event) => {
    if (event.namespace === 'ipcAgent' && event.name === 'queryStatus') {
      if (!initialising) {
        initialising = true;

        const RuntimeIPCAgent = require('./runtime/agents/IPCAgent'),
          RuntimeExecutionService = require('./common/services/RuntimeExecutionService');

        RuntimeIPCAgent.start(RuntimeExecutionService(), (e) => {
          if (e) {
            pm.logger.warn('main.js: Could not initialise runtime module', e);
          }

          // if a window was opened before the agent could initialize itself
          // we have to broadcast an event to all of them that agent is initialized.
          pm.eventBus.channel('runtime-ipc-lifecycle').publish({ name: 'statusBroadcast', namespace: 'ipcAgent' });
        });
      } else {
        pm.eventBus.channel('runtime-ipc-lifecycle').publish({ name: 'statusBroadcast', namespace: 'ipcAgent' });
      }
    }
  });
}

/**
 * Initialize the host process used to execution collections within the app. This step isn't critical to the boot
 * sequence of the app and only needs to be triggered after the user has expressed an intent to trigger some sort of
 * collection execution -- a performance test, a collection run, or something else.
 *
 * @returns {Promise<boolean>} True if the process is available for use, false otherwise.
 */
async function bootPerformanceTestSystem ({ type, options }) {
  try {
    if (executionSystemManager && executionSystemManager.isAlive()) {
      pm.logger.info('ExecutionSystemManager - Execution process is already booted');

      return true;
    }

    pm.logger.info('ExecutionSystemManager - First boot of execution process');

    const ExecutionSystemManager = require('./services/automation-testing/ExecutionSystemManager');

    // @TODO: This doesn't necessarily have to be a class; to be cleaned up.
    executionSystemManager = new ExecutionSystemManager();

    try {
      await executionSystemManager.init({ type, options });
    }
    catch (e) {
      pm.logger.error('ExecutionSystemManager - Boot error', e);

      return false;
    }
  }
  catch (e) {
    pm.logger.error('main.js: Unable to boot execution process', e);

    return false;
  }

  return true;
}

const asyncTasksSeries = [
  /**
   * Initialize the remote module
   */
   (cb) => {
    perftraceBegin('@electron/remote.initialize()');

    // Ref: https://www.electronjs.org/docs/latest/breaking-changes#removed-remote-module
    require('@electron/remote/main').initialize();
    perftraceEnd('@electron/remote.initialize()');
    cb();
  },

  (cb) => {
    perftraceBegin('cleanup storage files');
    try {
      // Perform cleanup of redundant storage file + lock files. We do this early in the boot lifecycle because
      // we only want to cleanup stale lockfiles here. So, we do this here to avoid deleting any actual
      // lock files
      // Presence of stale lock files created by electron-json-storage causes an issue where multiple write
      // operations lead to a deadlock and the CPU usage of the app spikes
      // Refer to - https://github.com/postmanlabs/postman-app-support/issues/7294#issuecomment-1669001260

      pm.logger.info('Main: Starting cleanup of stale files');

      // List of lock files to remove
      const LOCK_FILES_LIST = [
        'requester.json.lock',
        'settings.json.lock',
        'userPartitionData.json.lock',
        'newAccountRegionSettings.json.lock'
      ],
        DATA_PATH = jsonStorage.getDataPath();

      // Remove the requester storage file (This is a redundant legacy file which is not used anymore)
      const requesterRemovePromise = new Promise((resolve, reject) => {
        perftraceBegin('jsonStorage.remove()');
        jsonStorage.remove('requester', (err) => {
          perftraceEnd('jsonStorage.remove()');
          if (err) {
            pm.logger.info('Main: Cleanup of requester.json file failed. This is non-blocking for app boot', err);
            reject(err);
          }

          resolve();
        });
      });

      // Remove each of the lockfiles
      const lockFilesCleanupPromises = LOCK_FILES_LIST.map((lockFile) => {
        const filePath = path.resolve(DATA_PATH, lockFile);

        return fs.promises.rm(filePath)
          .catch((err) => {
            // If the lock file does not exist, it's expected, so it's fine. Otherwise
            // we log the error
            if (err.code !== 'ENOENT') {
              pm.logger.info('Main: Lock file could not be deleted - ', filePath, err);
            }
          });
      });

      // We use Promise.allSettled here as even if the cleanup fails, we don't want to block the app boot
      Promise.allSettled([requesterRemovePromise, ...lockFilesCleanupPromises])
        .then((results) => {
          pm.logger.info('Main: Cleanup of stale files completed');
          perftraceEnd('cleanup storage files');
          cb();
        });
    }
    catch (e) {
      cb();
    }
  },

  /**
   * Try creating the default working directory if running for the first time
   */
  (cb) => {
    perftraceBegin('create default working dir');
    appSettings.get('createdDefaultWorkingDir', (err, created) => {
      if (err) {
        pm.logger.error('Main~createDefaultWorkingDir - Error while trying to get from appSettings', err);
      }

      if (created) {
        pm.logger.info('Main~createDefaultWorkingDir - Default working dir creation already attempted');
        perftraceEnd('create default working dir');
        return cb();
      }

      // Record the attempt regardless of success of the creation. Prevents unnecessary attempts in
      // future.
      // @todo update the only update once successfull when robust file system API's are in place
      appSettings.set('createdDefaultWorkingDir', true);

      const { createDefaultDir } = require('./services/workingDirManager');
      createDefaultDir((err) => {
        // Ignore any errors, this is single attempt flow
        if (err) {
          // Logging just for debugging
          pm.logger.error('Main~createDefaultWorkingDir - Error while creating default working dir', err);
        }

        perftraceEnd('create default working dir');
        return cb();
      });
    });
  },

  /**
   * Iniitialize crash reporter
   */
  (cb) => {
    perftraceBegin('CrashReporter.init()');
    CrashReporter.init(() => {
      perftraceEnd('CrashReporter.init()');
      cb();
    });
  },

  /**
   * initializeLogger
   */
  (cb) => {
    perftraceBegin('initializeLogger()');
    initializeLogger(() => {
      perftraceEnd('initializeLogger()');
      cb();
    });
  },

  (cb) => {
    // Initialize the devtools installer
    if (process.env.PM_BUILD_ENV === 'development' || false) {
      require('./services/devtoolsInstaller').init(cb);
      cb(null);
    } else {
      cb(null);
    }
  },

  /**
   * Initialize the event bus in the global.pm object
   */
  (cb) => {

    perftraceBegin('initializeEventBus()');

    // initializes event bus on global `pm` object
    initializeEventBus();
    perftraceEnd('initializeEventBus()');
    cb(null);
  },


  (cb) => {
    perftraceBegin('cloudProxyManager.init()');
    cloudProxyManager.init(() => {
      perftraceEnd('cloudProxyManager.init()');
      cb();
    });
  },

  /**
   * Initialize the architecture service
   */
  (cb) => {
    perftraceBegin('architectureService.init()');
    architectureService.init();
    perftraceEnd('architectureService.init()');
    cb(null);
  },

  (cb) => {
    /**
     * This step migrates the data from the shell partition to the main process. This is a
     * critical step requester for the rest of the app. This is dependeny on the app `ready`
     * event so it internally waits for the same.
     * We can also move this and the subsequent steps into the onReady handler
     */
    perftraceBegin('performShellDataMigration()');
    performShellDataMigration()
      .then(() => {
        perftraceEnd('performShellDataMigration()');
        cb();
      })
      .catch((e) => {
        cb(e);
      });
  },

  /**
   * It initialize the updateHandler and assigns the updaterInstance to the app object
   */
  (cb) => {
    perftraceBegin('updateHandler.init()');

    // For enterprise application, do not intiialize the updateHandler
    if (enterpriseUtils.isEnterpriseApplication()) {
      cb();
    }
    else {
      updaterHandler.init((err, updaterInstance) => {
        app.updaterInstance = updaterInstance;
        perftraceEnd('updateHandler.init()');
        cb(err);
      });
    }
  },
];

function onEndSeries (err) {
  if (err) {
    // We are continue proceeding for now. even we see error.
    pm.logger.error('Main~booting: Failed', err);
  }

  const leaderSelection = require('./services/LeaderSelection');
  const initializeAppBootListener = require('./common/services/AppBootListener');
  const setupOAuth2WindowManager = require('./services/OAuth2WindowManager').initialize;
  const setupRefreshTokenManager = require('./services/AppRefreshTokenManager').initialize;
  const windowManager = require('./services/windowManager').windowManager;

  perftraceBegin('leaderSelection.initialize()');
  leaderSelection.initialize();
  perftraceEnd('leaderSelection.initialize()');

  perftraceBegin('initializeAppBootListener()');
  initializeAppBootListener();
  perftraceEnd('initializeAppBootListener()');


  const eventBus = pm.eventBus;
  windowManager.eventBus = eventBus;

  // setup OAuth 2 window manager
  perftraceBegin('setupOAuth2WindowManager()');
  setupOAuth2WindowManager();
  perftraceEnd('setupOAuth2WindowManager()');

  perftraceBegin('setupRefreshTokenManager()');
  setupRefreshTokenManager();
  perftraceEnd('setupRefreshTokenManager()');

  // flag set to perform tasks before quitting
  app.quittingApp = false;

  /**
   * Populate installation id
   * it gets the installation id
   * and keep it in app object
   *
   */
  function populateInstallationId () {
    getOrCreateInstallationId()
    .then(({ id, isCreatedNow }) => {
      // Assign the values in app so that the renderers can make use of it.
      app.firstLoad = isCreatedNow;
      app.installationId = id;

      // Set the user scope for crash reporter
      CrashReporter.setUserScope({ app_id: app.installationId }, _.noop);
      CrashReporter.setExtraScope({ session: app.sessionId }, _.noop);
    })
    .catch((err) => {
      pm.logger.error('main~populateInstallationId: Failed to get or create installationId', err);
    });
  }

  /**
   * Setting whether App Updates are enabled or disabled
   */
  function populateUpdateSettings () {
    app.isUpdateEnabled = isAppUpdateEnabled();
  }

  /** */
  function attachIpcListeners () {
    let interceptorBridgeInstaller;
    let proxyCertificateService;
    ipcMain.subscribe('newConsoleWindow', function (event, arg) {
      windowManager.newConsoleWindow({}, arg);
    });

    ipcMain.subscribe('messageToElectron', async function (event, arg) {
      if (arg.event === 'rendererProxyIpcNodeStart') {
        pm.logger.info('All communication channels established. Starting proxy server...');

        // Start proxy server
        proxyMainManager.sendStartProxyServer();
      } else if (arg.event === 'requestProxyState') {
        windowManager.sendInternalMessage({
          event: 'proxyStateResponse',
          'object': proxyMainManager.isProxyConnected()
        });
      }
      else if (arg.event === 'requestCaptured') {
        proxyMainManager.recordCaptureStats();
      }
      else if (arg.event === 'regenerateCertificates') {

        ({ proxyCertificateService } = require('./services/proxyCertificateService'));
        // Regenerating certificates in proxy to support android clients and hiding android banner
        await proxyCertificateService.regenerateCertificates(app.getPath('userData'))
        .then(() => {
          pm.logger.info('Main~IPC-MessageToElectron - Certificates regenerated');

          // sending internal message to renderer to update showRegenerateCertBanner
          windowManager.sendInternalMessage({
            event: 'updateRegenerateCertBanner',
            'object': {
              value: false
            }
          });

          // sending internal message to renderer to update cert trust status as the user will have to re trust the certificates
          windowManager.sendInternalMessage({
            event: 'certsRegenerated',
            'object': {
              certTrusted: false
            }
          });
        })
        .catch((e) => {
          pm.logger.error('Main~IPC-MessageToElectron - Error regenerating certificates', e);
        });
      }
      else if (arg.event === 'installCertificates') {
        proxyUtils.installAndTrustCertificate();
      }
      else if (arg.event === 'isCertAddedToKeyChain') {
        proxyUtils.isCertificateAddedToKeyChain()
          .then((isAdded) => {
            windowManager.sendInternalMessage({
              event: 'certAdditionStatus',
              'object': {
                value: isAdded
              }
            });
          });
      }
      else if (arg.event === 'startProxy') {
        var port = 8080;
        if (arg.data && arg.data.port) {
          port = arg.data.port;
        }
        if (typeof port === 'string') {
          port = parseInt(port);
        }
        pm.logger.info('Main~IPC-MessageToElectron - Starting proxy on port: ' + port);
        try {
          var ret = 0;
          proxyMainManager.startProxyProcess({
            env: {
              port,
              useImprovedFTUX: arg.data.useImprovedFTUX,
              STORE_LOC: app.getPath('userData'),
              ...process.env
            },
          });

          // TODO: handle proxy close on user log-out
          // Setting up listener to listen for logout event. We need to close the proxy
          // when the current user logs out
          pm.eventBus.channel('model-events').subscribe((event) => {
            let eventName = _.get(event, 'name'),
              eventNamespace = _.get(event, 'namespace');

            if (eventNamespace === 'user' && eventName === 'logout') {
              try {
                proxyMainManager.killProxyProcess();
                windowManager.sendInternalMessage({
                  event: 'proxyNotif',
                  'object': 'stop',
                  'object2': 'success'
                });
              }
              catch (e) {
                windowManager.sendInternalMessage({
                  event: 'proxyNotif',
                  'object': 'stop',
                  'object2': 'failure'
                });
                pm.logger.error('Main~IPC-MessageToElectron - Error while stopping proxy: ', e);
              }
            }
          });

          event.sender.send('proxyStarted', ret);
        }
        catch (e) {
          // error while starting proxy
          pm.logger.error('Main~IPC-MessageToElectron - Error while starting proxy: ', e);
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'start',
            'object2': 'failure'
          });
        }
      }
      else if (arg.event === 'stopProxy') {
        pm.logger.info('Main~IPC-MessageToElectron - stopping proxy');
        try {
          proxyMainManager.killProxyProcess();
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'stop',
            'object2': 'success'
          });
        }
        catch (e) {
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'stop',
            'object2': 'failure'
          });
        }
      }
      else if (arg.event === 'postmanInitialized') {
        // sent by the primary window when indexedDB has loaded
        windowManager.newRequesterOpened();
      }
      else if (arg.event === 'installInterceptorBridge') {
        interceptorBridgeInstaller = require('./services/interceptorBridgeInstaller').installer;
        interceptorBridgeInstaller.installInterceptorBridge();
      }
      else if (arg.event === 'checkInstallationStatus') {
        interceptorBridgeInstaller = require('./services/interceptorBridgeInstaller').installer;
        interceptorBridgeInstaller.checkInstallationStatus();
      }
      else if (arg.event === 'installNode') {
        try {
          interceptorBridgeInstaller = require('./services/interceptorBridgeInstaller').installer;
          interceptorBridgeInstaller.installNode();
        }
        catch (err) {
          console.log('Error occurred while installing Node: ', err);
        }
      }
      else if (arg.event === 'resetInterceptorBridgeInstallation') {
        interceptorBridgeInstaller = require('./services/interceptorBridgeInstaller').installer;
        interceptorBridgeInstaller.resetInstallation();
      }
      else if (arg.event === 'forwardInterceptorRequest') {
        interceptorConnection.sendEncryptedMessageToInterceptor(arg.message);
      }
      else if (arg.event === 'initializeInterceptorBridge') {
        // creating IPC bridge with native server
        if (!ipcClientInitialized) {
          interceptorConnection.initializeIpcClient();
          ipcClientInitialized = true;
        }
      }
      else if (arg.event === 'initializeWebSocketServer') {
        if (!webSocketServerInitialized) {
          interceptorConnection.initializeWebSocketServer(arg.message);
          webSocketServerInitialized = true;
        }
      }
      else if (arg.event === 'disconnectInterceptorBridge') {
        interceptorConnection.disconnect();
      }
      else if (arg.event === 'changeActiveConnection') {
        interceptorConnection.changeActiveConnection(arg.message);
      }
      else if (arg.event === 'sendActiveSessionStatus') {
        interceptorConnection.sendActiveSessionStatus(arg.message);
      }
      else if (arg.event === 'setEncryptionKeyForInterceptor') {
        // setting the encryption key for App ~ Interceptor communication
        interceptorConnection.setEncryptionKeyForInterceptor(arg.message.encryptionKeyForInterceptor);

        if (ipcClientInitialized) {
          // checking for the same key at interceptor
          interceptorConnection.startKeyValidationFlow();
        }
      }
      else if (arg.event === 'getEncryptionKeyForInterceptor') {
        interceptorConnection.sendEncryptionKeyToRenderer();
      }
      else if (arg.event === 'getSyncDomainListForInterceptor') {
        interceptorConnection.sendSyncDomainListToRenderer();
      }
      else if (arg.event === 'fetchCustomEncryptionKey') {
        interceptorConnection.sendCustomEncryptionKeyToRenderer();
      }
      else if (arg.event === 'removeEncryption') {
        interceptorConnection.removeCustomEncryptionKeyFromInterceptor();
      }
    });

    ipcMain.handle('generateCert', async () => {
      ({ proxyCertificateService } = require('./services/proxyCertificateService'));
      await proxyCertificateService.generateRootCAForProxy(app.getPath('userData'))
      .then((result) => {
        if (result.certsRegenerated) {
          // sending internal message to renderer to update cert trust status as the user will have to re trust the certificates
          windowManager.sendInternalMessage({
            event: 'certsRegenerated',
            'object': {
              certTrusted: false
            }
          });
        }
      })
      .catch((e) => {
        pm.logger.error('HTTPSProxy~Unable to generate certificates', e);
      });
    });
    ipcMain.handle('getSaveTarget', function (event, arg) {
      return new Promise((resolve, reject) => {
        showSaveDialog(event.sender, arg, (retPath) => {
          if (!retPath) {
            resolve(null);
          }
          else {
            resolve(retPath);
          }
        });
      });
    });

    ipcMain.handle('checkRootCAValidity', async () => {
      ({ proxyCertificateService } = require('./services/proxyCertificateService'));
      const isRootCAValid = await proxyCertificateService.isRootCAValid(path.resolve(app.getPath('userData'), 'proxy'));
      return isRootCAValid;
    });

    ipcMain.handle('set-native-theme-source', (event, theme) => {
      nativeTheme.themeSource = theme;
    });

    ipcMain.handle('check-native-theme-source', (event, theme) => {
      return nativeTheme.themeSource !== theme;
    });

    ipcMain.subscribe('sendToAllWindows', function (event, arg) {
      try {
        const circularJSON = require('circular-json');
        let parsedArg = circularJSON.parse(arg);
        if (parsedArg.event === 'pmWindowPrimaryChanged') {
          windowManager.primaryId = arg.object;
          pm.logger.info('Main~IPC-sendToAllWindows - Primary Window set (id: ' + windowManager.primaryId + ')');
        }
        else if (parsedArg.event === 'quitApp') {
          windowManager.quitApp();
        }
        if (parsedArg.event !== 'quitApp') {
          windowManager.sendInternalMessage(parsedArg);
        }
      }
      catch (e) {
        pm.logger.warn('Main~IPC-sendToAllWindows - Malformed message, ignoring.', e);
      }
    });

    ipcMain.subscribe('newRequesterWindow', function (event, arg) {
      windowManager.newRequesterWindow({}, arg);
    });

    ipcMain.subscribe('reLaunchRequesterWindows', function () {
      windowManager.reLaunchRequesterWindows();
    });

    ipcMain.subscribe('closeRequesterWindow', function (event, arg) {
      // Since the window manager expects a window, not a WebContents instance, this call is broken.
      // The change I've made here ensures that the code is exactly as broken as it was before.
      // For all I know, this event handler can't even be reached without reaching for DevTools.
      // However, removing it is a larger change touching many other components.
      // The same goes for 'closeWindow', too, and potentially other handlers around these two.
      windowManager.notifyOfWindowClose(event.sender, event);
    });

    ipcMain.subscribe('closeWindow', (event, arg) => {
      var win = BrowserWindow.fromId(parseInt(arg));
      win && win.close();
    });

    ipcMain.subscribe('enableShortcuts', () => {
      menuManager.createMenu(false).then(() => {
        appSettings.set('shortcutsDisabled', false);
      });
    });

    ipcMain.subscribe('disableShortcuts', () => {
      menuManager.createMenu(true).then(() => {
        appSettings.set('shortcutsDisabled', true);
      });
    });

    if (process.platform === 'darwin') {
      ipcMain.subscribe('ui-zoom-change-event', (event, arg) => {
        if (!arg || !_.isNumber(arg)) {
          return;
        }

        const currentWindow = BrowserWindow.getFocusedWindow();
        const newTrafficLightPosition = {
          x: MAC_TRAFFIC_LIGHT_POSITION_DEFAULT.x * arg,
          y: MAC_TRAFFIC_LIGHT_Y_POSITION_FOR_ZOOM[arg] || MAC_TRAFFIC_LIGHT_POSITION_DEFAULT.y * arg
        };

        currentWindow.setWindowButtonPosition(newTrafficLightPosition);
      });
    }

    ipcMain.handle('getActivePartitionIdFromMain', async (event, arg) => {
      if (await isShellMigrationDone()) {
        return {
          isMigrationDone: true,
          partitionId: await authPartitionService.getActivePartition()
        };
      }
      else {
        return {
          isMigrationDone: false
        };
      }
    });

    /**
     * Send hardware metrics to renderer from main process
     * Handler invoked by getHardwareInfoMetricsToSend in renderer process to obtain hardware metrics
     * Used by sendHardwareInfo in client load analytics to send hardware metrics
     */
    ipcMain.handle('getHardwareMetrics', async () => {
      try {
        // Using native node API to fetch cpu information
        const cpuInfo = os.cpus();

        /**
         * getGPUInfo is an electron API to fetch GPU information
         * Using basic - Minimal gpu information needed
         * Use complete for more information
         */
        const gpuInfo = await app.getGPUInfo('basic');

        return {
          cpuInfo,
          gpuInfo
        };
      }
      catch (e) {
        pm.logger.error('Main~IPC-getHardwareMetrics - Failed to get hardware metrics.', e);
      }
    });

    // Updates the electron OS menu when user updates a customizable shortcut
    // arg shape: {'shortcutName1' => 'newAccelerator1', 'shortcutName2' => 'newAccelerator2'}
    ipcMain.subscribe('updateShortcut', function (event, arg) {
      menuManager.updateMenu(arg);
    });

    ipcMain.handle('bootPerformanceTestSystem', async (event, arg) => {
      return await bootPerformanceTestSystem(arg);
    });

    let hiddenWindow = null;

    ipcMain.handle('handle-export-as-PDF', async (event, arg) => {
      return new Promise((resolve, reject) => {
        hiddenWindow = new BrowserWindow({ show: false });

        hiddenWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(arg.data)}`);

        hiddenWindow.webContents.session.on('will-download', (event, item, webContents) => {
          // Set the save path, making Electron not to prompt a save dialog.
          item.setSavePath(arg.name);

          item.once('done', (event, state) => {
            if (hiddenWindow && !hiddenWindow.isDestroyed()) {
              hiddenWindow.close();
              hiddenWindow = null;
            }

            if (state !== 'completed') {
              reject(new Error(`Download failed: ${state}`));
            }

            resolve();
          });
        });
      });
    });

    // To invoke an item in a folder via electron shell using the full path
    ipcMain.handle(IPC_EVENT_NAMES.SHOW_ITEM_IN_FOLDER, (event, fullPath) => shell.showItemInFolder(fullPath));
  }

  process.on('uncaughtException', function (e) {
    handleUncaughtError(e);
  });

  /**
   * @param {*} e
   */
  function handleUncaughtError (e) {
    // Logger might not be there in this state, hence the safe check
    pm.logger && pm.logger.error('Main~handleUncaughtError - Uncaught errors', e) ||
      console.error('Main~handleUncaughtError - Uncaught errors', e); // eslint-disable-line no-console
  }

  /**
   * @param {*} action
   */
  function runPostmanShortcut (action) {
    if (action == 'newWindow') {
      windowManager.newRequesterWindow();
    }
    else {
      windowManager.sendToFirstWindow({
        name: action
      });
    }
  }

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
     // Kill proxy process when all windows are closed.
     // As renderer TCP reader will not be listening to proxied traffic anymore
     proxyMainManager.killProxyProcess();

    // If all the windows are closed, we quit the application only on linux and windows platform.
    // We don't want to quit the application when user choose to switch b/w multiple accounts
    if (process.platform != 'darwin' && windowManager.isFirstRequesterBooted) {
      app.quit();
      return;
    }
  });

  app.on('web-contents-created', (event, contents) => {
    if (contents.getType() === 'webview') {
      contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    }
  });

  app.on('before-quit', function (event) {
    pm.logger.info('Quitting app');

    app.quittingApp = true;

    if (false || process.env.PERFORMANCE_TRACING_ENABLED === 'true') {
      const isRecording = contentTracingRecorder ? contentTracingRecorder.isRecording() : false;
      pm.logger.info('Tracing recording status before on "before-quit": ', isRecording ? 'recording' : 'NOT recording');
      if (isRecording) {
        event.preventDefault();
        contentTracingRecorder.stopTracing().finally(app.quit);
        return;
      }
    }

    const { runTimeoutPromise } = require('./services/automation-testing/utils/promise');

    // Kill execution process before quitting
    executionSystemManager && typeof executionSystemManager.cleanUp === 'function' &&
      runTimeoutPromise(executionSystemManager.cleanUp()).catch(() => {
        pm.logger.error('Failed to cleanup the execution process');
      });

    // Kill proxy before quitting
    proxyMainManager.killProxyProcess();

    if (os.type() !== 'Linux') {
      app.updaterInstance = null;
    }
    else {
      const downloadedVersion = _.attempt(appSettings.getSync, 'downloadedVersion');
      const currentVersion = app.getVersion();
      const semver = require('semver');

      // Update has been downloaded if `downloadedVersion` exists
      // Update the app and quit
      if (_.isNil(downloadedVersion) === false && semver.valid(semver.coerce(downloadedVersion)) && currentVersion !== downloadedVersion) {

        // applyUpdateAndQuit() internally calls swapAndRelaunch.sh
        // Which servers the purpose of applying update & quit the app by killing the parent process
        // If called, any statement after this function call in `before-quit` event will be skipped.
        pm.logger.info('Applying update and quit the app');
        updaterHandler.applyUpdateAndQuit(app.updaterInstance);
      }
    }
  });

  /**
   * @param {*} window
   * @param {*} fileName
   */
  function showSaveDialog (window, fileName, cb) {
    dialog.showSaveDialog({
      title: 'Select path to save file',
      defaultPath: '~/' + fileName,
      properties: ['treatPackageAsDirectory']
    }).then((result) => {
      return cb(result.filePath);
    }, (err) => {
      return cb();
    });
  }
  perftraceBegin('attachIpcListeners()');
  attachIpcListeners();
  perftraceEnd('attachIpcListeners()');

  // We don't want to allow track in dev and prod environments
  if (!['dev', 'prod', 'canary'].includes(RELEASE_CHANNEL)) {
    const TrackManagementService = require('./services/TrackManagementService');
    perftraceBegin('TrackManagementService.initialize()');
    TrackManagementService.initialize();
    perftraceEnd('TrackManagementService.initialize()');
  }

  perftraceBegin('windowManager.initialize()');
  windowManager.initialize();
  perftraceEnd('windowManager.initialize()');

  perftraceBegin('Menu.buildFromTemplate()');
  var dockMenu = Menu.buildFromTemplate([
    {
      label: 'New Collection',
      click: function () { runPostmanShortcut('newCollection'); }
    },
    {
      label: 'New Window ',
      click: function () { runPostmanShortcut('newWindow'); }
    }
  ]);
  perftraceEnd('Menu.buildFromTemplate()');

  /**
   * Determines whether to show the prompt for moving the current app to applications folder
   */
  function shouldShowMovePrompt (cb) {
    if (process.env.PM_BUILD_ENV === 'development' ||
        process.env.SKIP_MOVE_PROMPT === 'true' ||
        os.type() !== 'Darwin' ||
        app.isInApplicationsFolder()) {
      return cb(false);
    }

    appSettings.get('doNotRemindMoveToApplications', (err, doNotRemind) => {
      if (err) {
        pm.logger.error('Main~shouldShowMovePrompt - Error while trying to get "mode" from appSettings', err);
        return cb(false);
      }

      doNotRemind && pm.logger.info('Main~shouldShowMovePrompt - Not showing the prompt since user has chosen not to be reminded again');
      return cb(!doNotRemind);
    });
  }

  /**
   * This will show a prompt for moving the current app to applications folder when running on a mac
   */
  function promptMoveToApplicationsFolder (cb) {
    shouldShowMovePrompt((shouldShow) => {
      if (!shouldShow) {
        return cb();
      }

      pm.logger.info('Main~promptMoveToApplicationsFolder - Postman is not in applications folder, showing a prompt to move it there');

      dialog.showMessageBox({
        type: 'question',
        buttons: [MOVE_DIALOG_ACTION_BUTTON, MOVE_DIALOG_CANCEL_BUTTON],
        defaultId: 0, // Does not change the default selected button as mentioned in docs but only specifies the primary button (changes the color to blue)
        message: MOVE_DIALOG_MESSAGE,
        detail: MOVE_DIALOG_DETAILS,
        checkboxLabel: MOVE_DIALOG_CHECKBOX_MESSAGE
      }).then((result) => {
        // If the checkbox was selected, we need to wait for persisting this setting first before performing any action
        if (result.checkboxChecked) {
          appSettings.set('doNotRemindMoveToApplications', true, (err) => {
            if (err) {
              pm.logger.error('Main~promptMoveToApplicationsFolder - Failed to write the do not show prompt setting swallowing the error and continuing');
            }

            // Performing the action now
            if (result.response !== 0) {
              return cb();
            }

            // If user asked to move the application to applications directory we are not calling the callback here since the current app will be quitting anyway
            app.moveToApplicationsFolder();
          });
        }
        else {
          // If the checkbox was not selected, we can perform the action directly

          // If user didn't selected the move to application folder button
          if (result.response !== 0) {
            return cb();
          }

          // not calling the callback here since we the current app will be quitting anyway
          app.moveToApplicationsFolder();
        }
      });
    });
  }

  // This is the first instance, and another instance tried to open, here we should
  // 1. focus the first instance (current one)
  // 2. Allow protocol handler to parse the arguments and act accordingly
  app.on('second-instance', (event, commandLine) => {
    /**
     * bringing requester window in focus when an user tries to create another instance of the app.
     */
    windowManager.focusRequesterWindow()
    .catch((error) => {
      /**
       * Fallback step, if in  windowManager.focusRequesterWindow():
       * 1. openRequesterWindows has an id which actually does not exists.
       * 2. BrowserWindow.fromId() receives an argument which is not a number.
       * 3. openRequesterWindows does not contains the id of an already opened requester window.
       * 4. there is a failure while restoring the last closed requester window, when there are no open requester windows.
       */

      let errorMessage = error ? error.message : 'windowManager~focusRequesterWindow: Something went wrong while creating/focussing requester window';
      pm.logger.error(`main~makeSingleInstance: ${errorMessage}`);

      return windowManager.newRequesterWindow()
      .then((window) => {
        if (!window) {
          pm.logger.error('main~makeSingleInstance: New Requester window instance not found');
          return;
        }
      })
      .catch((e) => {
        pm.logger.error('main~makeSingleInstance: Error while creating a new Requester window', e);
        return;
      });
    })
    .finally(() => {
      return ProtocolHandler.processArg(commandLine);
    });
  });

  /**
   * Determines whether to shortcuts should be removed from menu.
   */
  function shouldHaveShortcuts (cb) {
    appSettings.get('shortcutsDisabled', (err, shortcutsDisabled) => {
      if (err) {
        pm.logger.error('Main~shouldHaveShortcuts - Error while trying to get "shortcutsDisabled" from appSettings. Assuming shortcuts are enabled.', err);
        return cb(err, false);
      }

      return cb(null, shortcutsDisabled);
    });
  }

  /**
   * Updates the version on the app about panel
   * @param {String} productVersion
   * @param {String} UIVersion
   */
  function updateVersionOnAppAboutPanel (productVersion, UIVersion) {
    if (!productVersion || !UIVersion || process.platform !== 'darwin') {
      return;
    }

    app.setAboutPanelOptions({ applicationVersion: `${productVersion}\nUI Version: ${UIVersion}\nDesktop Platform Version: ${app.getVersion()}` });
  }


  /**
   * This will be called when app is ready
   */
  function onAppReady () {
    if (false || process.env.PERFORMANCE_TRACING_ENABLED === 'true') {
      const Tracing = require('./utils/enableTracing');
      contentTracingRecorder = new Tracing(app, contentTracing);
      contentTracingRecorder.startTracing();
    }
    performance.mark(PERF_MARKS.MAIN_PROCESS_APP_READY);

    performance.measure(PERF_MEASURES.MAIN_PROCESS_APP_READY_TIME, PERF_MARKS.MAIN_PROCESS_IMPORTS_COMPLETE);

    const initI18nServiceWithRetry = async (tries = 3) => {
      try {
        // Initialize i18n in main process
        await i18nService.init();
      } catch (err) {
        if (tries <= 0) {
          // If there are no more tries left, throw the error
          throw err;
        }

        // If there are more tries left, retry
        return initI18nServiceWithRetry(tries - 1);
      }
    };

    // Initialize i18n service with retry and, if it fails, log the error and continue with post i18n init operations
    initI18nServiceWithRetry(3).catch((err) => {
      pm.logger.error('main~onAppReady - Failed to initialize i18n service', err);
    }).finally(() => {

      promptMoveToApplicationsFolder(() => {
        // Populates the installation id
        populateInstallationId();
        populateUpdateSettings();

        // run deferred init steps
        deferredInitSteps();

        Promise.resolve()
          .then(() => {
            if (process.env.SKIP_SIGNIN !== 'true') {
              const authHandler = require('./services/AuthHandler');
              return authHandler.init();
            }
          })
          .then(() => {
            return WindowController.initialize({ eventBus });
          })
          .then(() => {
            const appEvents = eventBus.channel('app-events');
            appEvents.subscribe((event = {}) => {
              // If it is a boot process;
              if (_.get(event, 'name') === 'booted') {
                let process = event.namespace,
                    err = event.data,
                    meta = event.meta;

                if (process === 'requester' && meta && meta.isFirstRequester) {
                  if (err) {
                    pm.logger.error('Main~AppEvents - First requester window boot failed', err);

                    let errorMessageToShow = err.name + ': ' + err.message;
                    dialog.showErrorBox(COULD_NOT_OPEN_DIALOG_TITLE, errorMessageToShow + '\n\n' + COULD_NOT_OPEN_DIALOG_MESSAGE);

                    return;
                  }

                  updateVersionOnAppAboutPanel(meta.productVersion, meta.UIVersion);
                }

                perftraceBegin('WebVersionService.initialize()');
                WebVersionService.initialize(meta.UIVersion);
                perftraceEnd('WebVersionService.initialize()');

                pm.logger.info(`Main~AppEvents - Received booted event for process ${process}.Version ${meta.productVersion} UI Version: ${meta.UIVersion} Desktop Platform Version: ${app.getVersion()}`);
              }
            });

            windowManager.openRequesterWindows();
          });

        appSettings.set('downloadedVersion', null);

        shouldHaveShortcuts((err, shortcutsDisabled) => {
          app.shortcutsDisabled = shortcutsDisabled;
          menuManager.createMenu(shortcutsDisabled);
        });

        if (app.dock) { // app.dock is only available on OSX
          app.dock.setMenu(dockMenu);
        }
      });
    });
  }

  // This method will be called when Electron has done everything
  // initialization and ready for creating browser windows.
  app.isReady() ? onAppReady() : app.on('ready', onAppReady);

  app.on('activate', function () {
    // bail out if first requester window is not booted
    if (!windowManager.isFirstRequesterBooted) {
      return;
    }

    windowManager
    .getOpenWindows('requester')
    .then((openRequesterWindows) => {
      // if there are open requester windows do nothing
      if (Array.isArray(openRequesterWindows) && openRequesterWindows.length > 0) {
        return;
      }

      // if there are no open requester windows open or restore a requester window
      windowManager.createOrRestoreRequesterWindow();
    });
  });
}

async function asyncSeries (tasks, finalCallback) {
  let err;
  try {
    for (let i = 0; i < tasks.length; ++i) {
      await new Promise((resolve, reject) => {
        tasks[i]((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }
  } catch (e) {
    err = e;
  }
  finalCallback(err);
}

asyncSeries(asyncTasksSeries, onEndSeries);
