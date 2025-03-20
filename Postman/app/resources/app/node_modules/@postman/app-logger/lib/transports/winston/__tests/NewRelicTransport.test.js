const { expect } = require('chai'),
    sinon = require('sinon'),
    _ = require('lodash'),
    NewRelicTransport = require('../NewRelicTransport'),
    dummyNewrelic = {
        recordCustomEvent: _.noop,
        setMetadata: _.noop
    };

describe('Winston/NewRelicTransport', () => {
    let sandbox = null;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });


    it('should create NewRelic instance with the newrelic provided', () => {
        let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic });
        expect(newRelicTransport.log).to.be.a('function');
    });

    describe('NewRelicTransport.log', () => {
        it('should call newrelic.recordCustomEvent with the info.messages[0] of error type', () => {
            let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic }),
                spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent'),
                error = new Error('test'),
                info = { messages: [error, { context: { api: 'echo', domain: 'echo' } }] };

            newRelicTransport.log(info, _.noop);
            expect(spy.calledWith(error));
        });

        it('should call newrelic.recordCustomEvent with the info.messages[0] of string type by converting to error type', () => { // eslint-disable-line max-len
            let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic }),
                spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent'),
                info = { messages: ['test', { context: { api: 'echo', domain: 'foobar' } }] };

            newRelicTransport.log(info, _.noop);

            // Check event type
            expect(spy.args[0][0]).to.be.a('string').and.be.eql('postmanAppError');
            // Check event body
            expect(spy.args[0][1]).to.be.a('object');
            // Check JSON body
            expect(spy.args[0][1].api).to.be.a('string').and.be.eql('echo');
            expect(spy.args[0][1].context).to.be.a('string').and.be.eql('test');
            expect(spy.args[0][1].domain).to.be.a('string').and.be.eql('foobar');
            expect(spy.args[0][1].message).to.be.a('string').and.be.eql('test');
            expect(spy.args[0][1].stack).to.be.a('string');

        });

        it('should not call newrelic.recordCustomEvent if info.messages does not have a context object', () => { // eslint-disable-line max-len
            let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic }),
                spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent'),
                info = { messages: ['test'] };

            newRelicTransport.log(info, _.noop);

            expect(spy.args).to.be.a('array').and.be.eql([]);
        });

        it('should call newrelic.recordCustomEvent when info.messages[0] is a string but info.messages[1] is an error', () => { // eslint-disable-line max-len
            let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic }),
                spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent'),
                info = { messages: [
                    'test',
                    new Error('sample error'),
                    { context: { api: 'echo', domain: 'foobar' } }
                ] };

            newRelicTransport.log(info, _.noop);

            // Check event type
            expect(spy.args[0][0]).to.be.a('string').and.be.eql('postmanAppError');
            // Check event body
            expect(spy.args[0][1]).to.be.a('object');
            // Check JSON body
            expect(spy.args[0][1].api).to.be.a('string').and.be.eql('echo');
            expect(spy.args[0][1].context).to.be.a('string').and.be.eql('test');
            expect(spy.args[0][1].domain).to.be.a('string').and.be.eql('foobar');
            expect(spy.args[0][1].message).to.be.a('string').and.be.eql('sample error');
            expect(spy.args[0][1].stack).to.be.a('string');

        });

        it('should add the extra metadata into the newrelic event if it is passed with the context object', () => { // eslint-disable-line max-len
            let newRelicTransport = new NewRelicTransport({ newrelic: dummyNewrelic }),
                spy = sandbox.spy(dummyNewrelic, 'recordCustomEvent'),
                info = { messages: [
                    'test',
                    new Error('sample error'),
                    {
                        context: { api: 'echo', domain: 'foobar' },
                        someMeta: 'data'
                    }
                ] };

            newRelicTransport.log(info, _.noop);

            // Check event type
            expect(spy.args[0][0]).to.be.a('string').and.be.eql('postmanAppError');
            // Check event body
            expect(spy.args[0][1]).to.be.a('object');
            // Check JSON body
            expect(spy.args[0][1].api).to.be.a('string').and.be.eql('echo');
            expect(spy.args[0][1].context).to.be.a('string').and.be.eql('test');
            expect(spy.args[0][1].domain).to.be.a('string').and.be.eql('foobar');
            expect(spy.args[0][1].message).to.be.a('string').and.be.eql('sample error');
            expect(spy.args[0][1].someMeta).to.be.a('string').and.be.eql('data');
            expect(spy.args[0][1].stack).to.be.a('string');

        });
    });
});
