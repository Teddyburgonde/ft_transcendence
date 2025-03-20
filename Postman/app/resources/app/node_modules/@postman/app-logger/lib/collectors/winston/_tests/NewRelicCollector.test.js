const { expect } = require('chai'),
    sinon = require('sinon'),
    _ = require('lodash'),
    AbstractCollector = require('../../AbstractCollector'),
    NewRelicCollector = require('../NewRelicCollector'),
    { ERROR, INFO } = require('../../../constants/level'),
    dummyNewrelic = {
        recordCustomEvent: _.noop,
        setMetadata: _.noop
    };

describe('Winston/NewRelicCollector', () => {
    let sandbox = null;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create Collector instance with level as error', () => {
        let newrelicCollector = new NewRelicCollector({ newrelic: dummyNewrelic });
        expect(newrelicCollector.transports).to.be.an('array');
        expect(newrelicCollector.transports).to.not.be.empty;
        expect(newrelicCollector.transports[0].level).to.be.eql(ERROR);
    });

    it('should create Collector instance of type Abstract Collector', () => {
        let newrelicCollector = new NewRelicCollector({ newrelic: dummyNewrelic });
        expect(newrelicCollector instanceof AbstractCollector).to.be.true;
    });

    it('should call the newrelic.recordCustomEvent', () => {
        let NewRelicCollectorInstance = new NewRelicCollector({ newrelic: dummyNewrelic }),
            spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent');
        NewRelicCollectorInstance.log(ERROR, {
            messages: ['error', { context: { api: 'echo', domain: 'echo' } }]
        });
        expect(spy.callCount).to.equal(1);
    });

    it('should not call the newrelic.recordCustomEvent when it is not error level', () => {
        let NewRelicCollectorInstance = new NewRelicCollector({ newrelic: dummyNewrelic }),
            spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent');
        NewRelicCollectorInstance.log(INFO, {
            messages: ['info', { context: { api: 'echo', domain: 'echo' } }]
        });
        expect(spy.callCount).to.equal(0);
    });

    it('should not call the newrelic.recordCustomEvent when context data is not passed', () => {
        let NewRelicCollectorInstance = new NewRelicCollector({ newrelic: dummyNewrelic }),
            spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent');
        NewRelicCollectorInstance.log(ERROR, {
            messages: ['error']
        });
        expect(spy.callCount).to.equal(0);
    });
});
