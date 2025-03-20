const ResponseBodyMap = require('../ResponseBodyMap');
const MetricProcessor = require('./metric-processor');
const { log } = require('../lib/logging');

/**
 * This class provides the interface to the custom metrics storage system for performance runs.
 * A unique instance of this is to be initialized for each performance run.
 */
class RunnerMetricStore {
  constructor () {
    this.emit = this.emit.bind(this);
    this.getMetrics = this.getMetrics.bind(this);
    this.updateWindowSize = this.updateWindowSize.bind(this);
    this.responseBodyMap = new ResponseBodyMap();

    // Default window size is 1 second
    this.metricProcessor = new MetricProcessor(1);
  }

  /**
   * Records the metric measurement in the store, along with the dimensions
   *
   * @param {Object} obj
   * @param {String} obj.metricName - Name of the metric
   * @param {String} obj.requestId - The ID of request for which this metric is recorded.
   * @param {Number} obj.value - Value of the metric
   * @param {Number} obj.timestamp - The ISO timestamp when request was sent
   * @param {Boolean} obj.isError - is the metric an error metric
   */
  emit (obj) {
    this.metricProcessor.add(obj);
  }

  /**
   * Returns all the metrics required by the view.
   * This includes the summary metrics, time-series and metrics grouped by request IDs.
   *
   * @returns {Object}
   * Example:
   *  {
   *    summary: {
   *      aggregatedMetrics: {
   *      },
   *      groupedByRequest: {
   *      }
   *    },
   *    timeSeries: {
   *
   *    }
   *  }
   */
  getMetrics () {
    return this.metricProcessor.getMetrics();
  }

  /**
   * Updates the window size used by aggregation logic to return time series data.
   *
   * @param {Number} windowSize
   */
  updateWindowSize (windowSize) {
    this.metricProcessor.updateWindowSize(windowSize);
  }

  /**
   * Adds the response body to the store and returns the hash of the response body.
   * If the response body is not added, it returns a default hash.
   *
   * @param {Object} params
   * @param {Object} params.request - The request object
   * @param {String} params.errorMetricName - The error metric name
   * @param {Object} params.response - The response object
   * @param {Object} params.item - The item object
   * @param {Object} params.virtualUser - The virtual user object
   *
   * @returns {string} - The hash of the response body
   */
  addResponse ({ request, errorMetricName, response, item, virtualUser }) {
    let hash;

    try {
      hash = this.responseBodyMap.addResponse({ request, errorMetricName, response, item, virtualUser });
    }
    catch (error) {
      if (ResponseBodyMap.ERROR_TYPES.hasOwnProperty(error.code)) {
        log.debug('runnerMetricStore.js: Could not store responseBody', error);
        hash = 'OTHER_RESPONSE';
      }
      else {
        throw error;
      }
    }

    return hash;
  }

  /**
   * Returns the response body for the given request ID, error metric name and hash. If the response body is not found,
   * it returns undefined.
   *
   * @param {String} requestId - The ID of the request
   * @param {String} errorMetricName - The error metric name
   * @param {String} hash - The hash of the response body
   *
   * @returns {undefined|object} - The response body
   */
  getResponseDetails (requestId, errorMetricName, hash) {
    const metrics = this.responseBodyMap.getResponseMap(),
      responseBody = metrics.responseMapBySegregation?.[requestId]?.[errorMetricName]?.[hash];

    if (responseBody) {
      if (responseBody.response) {
        responseBody.response.body = metrics.responseMap[hash];
      }
      return responseBody;
    }
    else {
      return undefined;
    }
  }
}

module.exports = RunnerMetricStore;
