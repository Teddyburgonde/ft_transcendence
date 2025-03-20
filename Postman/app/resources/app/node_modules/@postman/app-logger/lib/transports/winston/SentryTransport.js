const Transport = require('winston-transport');

/**
 * Inherit from `winston-transport` so you can take advantage
 * of the base functionality and `.exceptions.handle()`.
 */
module.exports = class SentryTransport extends Transport {
    constructor (opts) {
        super(opts);
        this.sentry = opts.sentry;
    }

    /**
     * @description It sends messages to sentry.
     * @param {Object} info
     * @param {Function} callback
     */
    log (info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        let errorMessage = info.messages[0],
            extraData = info.messages[info.messages.length - 1];

        if (!extraData || !extraData.crash) {
            return callback();
        }

        if (!(errorMessage instanceof Error)) {
            errorMessage = new Error(errorMessage);
        }

        this.sentry.withScope((scope) => {
            // This is the original error that caused the crash to occur
            let originalErr = info.messages[2],
                crashRegex = /CrashHandler/,
                fromCrashHandler = crashRegex.test(errorMessage.message);

            if (fromCrashHandler) {
                // We can not use 'scope' here to set the tags.
                // scope is bound to the error that invoked this function - logger.error invoked from CrashHandler
                // To set the tags on the out-of-scope error, directly use this.sentry.setTag
                this.sentry.setTag('fromCrashHandler', 'true');

                // Sentry doesn't reflect modifications on error it captures.
                // Thus, to add our desired improvements, creating a new error object and populating it.
                let errToReport = new Error();

                errToReport.name = `[From CrashHandler] ${originalErr.name}`;
                errToReport.message = originalErr.message;
                errToReport.stack = originalErr.stack;

                this.sentry.captureException(errToReport);
            }
            else if (extraData.meta && extraData.meta.domain && extraData.meta.category) {
                // For recording searchable custom errors for a particular category, domain.
                scope.setTag('category', extraData.meta.category);
                scope.setTag('domain', extraData.meta.domain);

                this.sentry.captureException(originalErr);
            }
            else {
                // Add additional params to extra context
                scope.setExtra('extra', info.messages.slice(1));
                // Sending to sentry as exception
                this.sentry.captureException(errorMessage);
            }

        });

        callback();
    }
};
