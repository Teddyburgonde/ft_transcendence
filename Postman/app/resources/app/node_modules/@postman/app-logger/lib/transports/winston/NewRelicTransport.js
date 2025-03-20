const _ = require('lodash'),
    Transport = require('winston-transport');

/**
 * Inherit from `winston-transport` so you can take advantage
 * of the base functionality and `.exceptions.handle()`.
 */
module.exports = class NewRelicTransport extends Transport {
    constructor (opts) {
        super(opts);
        this.newrelic = opts.newrelic;
    }

    /**
     * @description It sends event to NewRelic.
     * @param {Object} info
     * @param {Function} callback
     */
    log (info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        let errorMessage = info.messages[0],
            // We'll pass metadata as the last object
            metadata = info.messages[info.messages.length - 1],
            event = {
                sessionId: info.sessionId,
                origin: info.origin
            };

        // Don't push error to NewRelic if context data about the module is not passed
        // @TODO remove this condition when NewRelic is no longer Opt-in
        if (!metadata.context || !metadata.context.api || !metadata.context.domain) {
            return callback();
        }

        // If the event has a timestamp, send that to NewRelic (NewRelic attaches current time is there's no timestamp)
        if (info.timestamp) {
            event.timestamp = info.timestamp;
        }

        // If the none of the first 2 elements were Errors, then create a new Error instance
        if (!(errorMessage instanceof Error) && !(info.messages[1] instanceof Error)) {
            errorMessage = new Error(errorMessage);
        }

        // Context contain a name for the error, errorMessage is either a user defined string or an instance of Error
        event.context = errorMessage.message || errorMessage;

        // Log the error message (this will contain extra data when multiple error instances are passed)
        event.message = errorMessage.message || info.messages[1].message;

        // Populate the error stack trace
        event.stack = errorMessage.stack || info.messages[1].stack;

        // Merge the context data and the event object
        event = _.merge(metadata.context, event);

        // Remove the context data before merging the data into the event
        // Since this is already added, extra data would become redundant
        delete metadata.context;

        // Merge the data in metadata into the event data
        _.forEach(metadata, (val, key) => {
            // Stringify if some value is of object type (NewRelic doesn't accept objects in event)
            if (typeof val === 'object') {
                event[key] = JSON.stringify(val);
            }
            else {
                event[key] = val;
            }
        });

        this.newrelic.recordCustomEvent('postmanAppError', event);

        return callback();
    }
};
