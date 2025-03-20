module.exports = {
    Console: require('./winston/WinstonCollector'),
    File: require('./winston/FileCollector'),
    NewRelic: require('./winston/NewRelicCollector'),
    Sentry: require('./winston/SentryCollector')
};
