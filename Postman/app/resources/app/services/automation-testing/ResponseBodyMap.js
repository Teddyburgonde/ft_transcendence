'use string';
const crypto = require('crypto');
const RESPONSE_LIMIT_PER_ERROR = 10;
const TOTAL_RESPONSE_LIMIT = 100;

module.exports = class ResponseBodyMap {
  responseMap = {};
  responseMapBySegregation = {};

  static ERROR_TYPES = {
    TOTAL_LIMIT_EXCEEDED: {
      code: 'TOTAL_LIMIT_EXCEEDED',
      message: 'Limit for unique responses exceeded'
    },
    RESPONSE_LIMIT_PER_ERROR_EXCEEDED: {
      code: 'RESPONSE_LIMIT_PER_ERROR_EXCEEDED',
      message: 'Limit for unique responses for request and error combination exceeded'
    },
    HASH_COLLISION_DETECTED: {
      code: 'HASH_COLLISION_DETECTED',
      message: 'Hash collision occurred for different response bodies'
    }
  };

  addResponse ({
    request,
    errorMetricName,
    response,
    item,
    virtualUser
  }) {
    if (!this.responseMapBySegregation[request.id]) {
      this.responseMapBySegregation[request.id] = {};
    }

    if (!this.responseMapBySegregation[request.id][errorMetricName]) {
      this.responseMapBySegregation[request.id][errorMetricName] = {};
    }

    let hash, errorType;

    // Since we compute the hash of the response body below, an empty body will lead us to attempt
    // to compute the hash of an undefined value leading to an error. Hence using an empty string as
    // a substitute for a non-existent response body.
    const responseBody = (response && response.body) || '';

    if (response && response.hash) {
      hash = response.hash;
    } else {
      const responseBodyShasum = crypto.createHash('sha1');
      responseBodyShasum.update(responseBody);
      hash = responseBodyShasum.digest('hex');
    }

    if (!this.responseMap[hash]) {
      // Detect if the total map has already touched its limit
      if (Object.keys(this.responseMap).length >= TOTAL_RESPONSE_LIMIT) {
        errorType = ResponseBodyMap.ERROR_TYPES.TOTAL_LIMIT_EXCEEDED;
      }
    } else if (this.responseMap[hash] !== responseBody) {
      // Since the hash key already exists, detect if the value is same
      errorType = ResponseBodyMap.ERROR_TYPES.HASH_COLLISION_DETECTED;
    }

    const responsesForError = this.responseMapBySegregation[request.id][errorMetricName];

    if (!responsesForError[hash]) {
      // Detect if the request+error combination map has already touched its limit
      if (Object.keys(responsesForError).length >= RESPONSE_LIMIT_PER_ERROR) {
        errorType = ResponseBodyMap.ERROR_TYPES.RESPONSE_LIMIT_PER_ERROR_EXCEEDED;
      }
    }

    if (errorType) {
      let error = new Error(errorType.message);
      error.code = errorType.code;

      throw error;
    }

    this.responseMap[hash] = responseBody;

    if (!this.responseMapBySegregation[request.id][errorMetricName][hash]) {
      this.responseMapBySegregation[request.id][errorMetricName][hash] = { request, response, item, virtualUser };
    }

    return hash;
  }

  getResponseMap () {
    return {
      responseMap: this.responseMap,
      responseMapBySegregation: this.responseMapBySegregation
    };
  }
};
