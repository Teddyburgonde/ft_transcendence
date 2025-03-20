const path = require('path');

/**
 * function to calculate the performance tracing timeout
 * @returns number
 */
function getTracingTimeout () {
  const defaultTimeout = 10000;
  if (process.env.PERFORMANCE_TRACING_TIMEOUT) {
    const timeout = Number(process.env.PERFORMANCE_TRACING_TIMEOUT);
    return Number.isInteger(timeout) && timeout > 0 ? timeout : defaultTimeout;
  }
  return defaultTimeout;
}

/**
 * function to calculate the performance tracing output path
 * @returns string | undefined
 */
function getTracingPath (file) {
  if (!file) return;
  const parse = path.parse(file);

  // if path does not have extension it is probably a directory. In this case it will save recording to the "tracing-<timestamp>.json" file inside the directory
  if (!parse.ext) {
    return path.join(file, `tracing-${Date.now()}.json`);
  }

  // otherwise return file
  return file;
}

class Tracing {
  constructor (app, contentTracing) {
    if (!app || !contentTracing) {
      throw new Error(`
          Please provide electron dependencies while initializing Tracing
          const { app, contentTracing } = require('electron')
          new Tracing(app, contentTracing)
      `);
    }
    this.recording = false;
    this.contentTracing = contentTracing;
    this.app = app;
  }

  /**
   * start app tracing recording
   */
  startTracing () {
    pm.logger.info('~Tracing~start: enabled');
    this.recording = true;
    return this.contentTracing.startRecording({
      included_categories: ['*']
    })
      .then(async () => {
        const tracingTimeout = getTracingTimeout();
        pm.logger.info('~Tracing~start: started. The performance tracing timeout is:', tracingTimeout);
        await new Promise((resolve) => setTimeout(resolve, tracingTimeout));

        // if the app was closed the content tracing recording will be hadled on 'before-quit' event
        if (this.app.quittingApp) return;
        await this.stopTracing();
      });
  }

  /**
   * function to check the app tracing recording status
   */
  isRecording () {
    return this.recording;
  }

  /**
   * stop app tracing recording
   */
  async stopTracing () {
    if (!this.recording) return;
    const tracingPath = getTracingPath(process.env.PERFORMANCE_TRACING_OUTPUT_PATH);
    pm.logger.info('Tracing data will be recorded to ' + tracingPath);
    try {
      const tracePath = await this.contentTracing.stopRecording(tracingPath);
      pm.logger.info('Tracing data recorded to ' + tracePath);
    } catch (err) {
      pm.logger.info('Error while writing tracing data', err);
    }
    this.recording = false;
  }
}

module.exports = Tracing;
