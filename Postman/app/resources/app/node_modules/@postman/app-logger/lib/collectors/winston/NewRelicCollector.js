const WinstonCollector = require('./WinstonCollector'),
    WinstonNewRelicTransport = require('../../transports/winston/NewRelicTransport'),
    { ERROR } = require('../../constants/level');

/**
 * @extends WinstonCollector
 * @class WinstonNewRelicCollector
 * @description This holds the basic details winston NewRelic collector
 */
class WinstonNewRelicCollector extends WinstonCollector {
    /**
     * @method constructor
     * @description It calls the super with the winston NewRelic transport as its transport module
     * @param {[Object={}]} options
     * @param {Object} options.newrelic
     * @throws InvalidParamsException
     */
    constructor (options = {}) {
        if (typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('InvalidParamsException: options should be of type object if provided');
        }

        super(Object.assign(
            {},
            options,
            {
                level: ERROR, // Only errors are sent to NewRelic
                transports: [new WinstonNewRelicTransport({ newrelic: options.newrelic })]
            })
        );
    }

    /**
     * @description For NewRelic, switching log level should not be allowed.
     * Which would otherwise lead to info/warn messages to be sent to NewRelic
     * @param {String} level should be among the valid log levels
     * @override
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars, no-empty-function
    setLogLevel (level) { }
}

module.exports = WinstonNewRelicCollector;
