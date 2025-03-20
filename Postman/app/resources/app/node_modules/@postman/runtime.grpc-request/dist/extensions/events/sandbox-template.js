"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
const template = `
	const Ajv = require('ajv');
	const chai = require('chai');
	const _ = require('lodash');
	const { Property, PropertyList, RequestAuth, Url } = require('postman-collection');

	class Metadata extends Property {
		constructor (options = {}) {
			super(options);

			this.key = options.key;
			this.value = options.value;
			this.disabled = options.disabled;
		}

		toString () {
			return this.key + ': ' + this.value;
		}

		valueOf () {
			return this.value;
		}

		static _postman_propertyIndexKey = 'key';
		static _postman_propertyIndexCaseInsensitive = true;
		static _postman_propertyAllowsMultipleValues = true;

		static parse (metadataString) {
			const metadata = [],
				regexes = {
					metadata: /^(\\S+):(.*)$/gm,
					fold: /\\r\\n([ \\t])/g,
					trim: /^\\s*(.*\\S)?\\s*$/
				};
			let match = regexes.metadata.exec(metadataString);

			metadataString = metadataString.toString().replace(regexes.fold, '$1');

			while (match) {
				metadata.push({
					key: match[1],
					value: match[2].replace(regexes.trim, '$1')
				});
				match = regexes.metadata.exec(metadataString);
			}

			return metadata;
		}

		static parseSingle (metadata) {
			if (!_.isString(metadata)) { return { key: '', value: '' }; }

			let index = metadata.indexOf(':');
			(index < 0) && (index = metadata.length);

			const key = metadata.substr(0, index),
				value = metadata.substr(index + 1);

			return {
				key: _.trim(key),
				value: _.trim(value)
			};
		}

		static unparse (metadata, separator = '\\r\\n') {
			if (!_.isArray(metadata) && !PropertyList.isPropertyList(metadata)) {
				return '';
			}

			return metadata.reduce((acc, m) => {
				if (m && !m.disabled) {
					acc += Metadata.unparseSingle(m) + separator;
				}

				return acc;
			}, '');
		}

		static unparseSingle (metadata) {
			if (!_.isObject(metadata)) { return ''; }

			return metadata.key + ': ' + metadata.value;
		}
	}

	class Message extends Property {
		constructor(options = {}) {
			super(options);

			this.data = options.data;

			if (!_.isNil(options.timestamp)) {
				this.timestamp = new Date(options.timestamp);
			}
		}

		toString () {
			return JSON.stringify(this.data);
		}

		valueOf () {
			return this.data;
		}
	}

	const messageTo = {
		get () {
			const assertion = chai.expect(this.members.map(m => m.data));

			chai.util.flag(assertion, 'messageList', true);

			return assertion.to;
		}
	};

	function prepareMessages (messages) {
		return messages ? messages.map((message) => new Message(message)) : [];
	}

	class Request extends Property {
		constructor(options = {}) {
			super(options);

			this.url = new Url(options.url);
			this.methodPath = options.methodPath;
			this.auth = new RequestAuth(options.auth);
			this.metadata = new PropertyList(Metadata, this, options.metadata);
			this.messages = new PropertyList(Message, this, prepareMessages(options.messages));

			this.messages._postman_proprtyIsSerialisedAsPlural = true;

			Object.defineProperty(this.messages, 'to', messageTo);
		}

		static isRequest (obj) {
			return (obj instanceof Request);
		}
	}

	class Response extends Property {
		constructor(options = {}) {
			super(options);

			this.statusCode = options.statusCode;
			this.responseTime = options.responseTime;
			this.metadata = new PropertyList(Metadata, this, options.metadata);
			this.trailers = new PropertyList(Metadata, this, options.trailers);
			this.messages = new PropertyList(Message, this, prepareMessages(options.messages));

			this.messages._postman_proprtyIsSerialisedAsPlural = true;

			Object.defineProperty(this.messages, 'to', messageTo);
		}

		static isResponse (obj) {
			return (obj instanceof Response);
		}
	}

	function initializeExecution (target, context) {
		switch (target) {
			case 'beforeInvoke':
				return {
					request: new Request(context.request)
				};

			case 'afterResponse':
				return {
					request: new Request(context.request),
					response: new Response(context.response)
				};
		}
	}

	function chaiPlugin (chai) {
		const Assertion = chai.Assertion;

		Assertion.addProperty('postmanRequest', function () {
			this.assert(Request.isRequest(this._obj),
				'expecting a postman request object but got #{this}',
				'not expecting a postman request object');
		});

		Assertion.addProperty('postmanResponse', function () {
			this.assert(Response.isResponse(this._obj),
				'expecting a postman response object but got #{this}',
				'not expecting a postman response object');
		});

		Assertion.addProperty('postmanRequestOrResponse', function () {
			this.assert(Response.isResponse(this._obj) || Request.isRequest(this._obj),
				'expecting a postman request or response object but got #{this}',
				'not expecting a postman request or response object');
		});

		Assertion.addProperty('ok', function () {
			// If asserted object is not response, use underlying 'ok'
			if (!Response.isResponse(this._obj)) {
				this.assert(chai.util.flag(this, 'object'),
					'expected #{this} to be truthy',
					'expected #{this} to be falsy');

				return;
			}

			const expectedStatusCode = 0;
			const actualStatusCode = this._obj.statusCode;

			this.assert(actualStatusCode === expectedStatusCode,
				'expected response to have status code #{exp} but got #{act}',
				'expected response to not have status code #{act}',
				expectedStatusCode, actualStatusCode);
		});

		Assertion.addMethod('statusCode', function (statusCode) {
			new Assertion(this._obj).to.be.postmanResponse;

			this.assert(this._obj.statusCode === statusCode,
				'expected response to have status code #{exp} but got #{act}',
				'expected response to not have status code #{act}',
				statusCode, this._obj.statusCode);
		});

		Assertion.addMethod('metadata', function (mKey, mValue) {
			new Assertion(this._obj).to.be.postmanRequestOrResponse;
			new Assertion(this._obj).to.have.property('metadata');

			const ror = Request.isRequest(this._obj) ? 'request' : 'response';

			this.assert(this._obj.metadata.has(mKey),
				"expected " + ror + " to have metadata with key '" + mKey + "'",
				"expected " + ror + " to not have metadata with key '" + mKey + "'",
				true, this._obj.metadata.has(mKey));

			// In case no check is done on value
			if (arguments.length < 2) { return; }

			this.assert(this._obj.metadata.one(mKey).value === mValue,
				"expected '" + mKey + "' " + ror + " metadata to be #{exp} but got #{act}",
				"expected '" + mKey + "' " + ror + " metadata to not be #{act}",
				mValue, this._obj.metadata.one(mKey).value);
		});

		Assertion.addMethod('trailer', function (tKey, tValue) {
			new Assertion(this._obj).to.be.postmanResponse;
			new Assertion(this._obj).to.have.property('trailers');

			this.assert(this._obj.trailers.has(tKey),
				"expected response to have trailer with key '" + tKey + "'",
				"expected response to not have trailer with key '" + tKey + "'",
				true, this._obj.trailers.has(tKey));

			// In case no check is done on value
			if (arguments.length < 2) { return; }

			this.assert(this._obj.trailers.one(tKey).value === tValue,
				"expected '" + tKey + "' response trailer to be #{exp} but got #{act}",
				"expected '" + tKey + "' response trailer to not be #{act}",
				tValue, this._obj.trailers.one(tKey).value);
		});

		Assertion.addChainableMethod('responseTime', function (value) {
			const actualTime = chai.util.flag(this, 'number');

			new Assertion(actualTime).to.be.a('number');

			arguments.length && this.assert(actualTime === value,
				'expected response time to be #{exp} but got #{act}',
				'expected response time to not be #{act}', value, actualTime);
		}, function () {
			new Assertion(this._obj).to.be.postmanResponse;
			new Assertion(this._obj).to.have.property('responseTime').a('number');

			chai.util.flag(this, 'number', this._obj.responseTime);
			this._obj = this._obj.responseTime;
		});

		Assertion.addMethod('jsonSchema', function (schema, options) {
			new Assertion(schema).to.be.an('object');

			const ajvOptions = {
				allErrors: true,
				logger: false,
				...options
			};
			const isMessageList = chai.util.flag(this, 'messageList');

			if (isMessageList) {
				this._obj.forEach((msg) => {
					const ajv = new Ajv(ajvOptions);
					const valid = ajv.validate(schema, msg);

					this.assert(
						valid && !ajv.errors,
						"expected message(s) to satisfy schema but found following errors: \\n" + ajv.errorsText(),
						"expected message(s) to not satisfy schema",
						true,
						valid
					);
				});
			} else {
				const ajv = new Ajv(ajvOptions);
				const valid = ajv.validate(schema, this._obj);

				this.assert(
					valid && !ajv.errors,
					"expected object to satisfy the schema but found following errors: \\n" + ajv.errorsText(),
					"expected object to not satisfy the schema",
					true,
					valid
				);
			}
		});

		Assertion.addMethod('message', function (value) {
			new Assertion(this._obj).to.be.postmanRequestOrResponse;
			new Assertion(this._obj).to.have.property('messages');
			new Assertion(value).to.be.a('object');

			this.assert(
				_.some(this._obj.messages.members, (msg) => _.isEqual(msg.data, value)),
				'expected message(s) to have #{exp}',
				'expected message(s) to not have #{exp}',
				value,
				null
			);
		});

		Assertion.overwriteMethod('property', function (_super) {
			return function (key, value) {
				const isMessageList = chai.util.flag(this, 'messageList');

				if (isMessageList) {
					new Assertion(key).to.be.a('string');

					const args = [key];

					arguments.length === 2 && args.push(value);

					this._obj.forEach((msg) => new Assertion(msg).to.have.deep.nested.property(...args));
				} else {
					_super.apply(this, arguments);
				}
			};
		});

		Assertion.overwriteChainableMethod('include', function (_super) {
			return function (value) {
				const isMessageList = chai.util.flag(this, 'messageList');

				if (isMessageList) {
					new Assertion(value).to.be.a('object');

					this.assert(
						_.some(this._obj, value),
						'expected some messages to include #{exp}',
						'expected some messages to not include #{exp}',
						value,
						null
					);
				} else {
					_super.apply(this, arguments);
				}
			};
		}, function (_super) {
			return function () {
				_super.apply(this, arguments);
			};
		});
	}

	module.exports = {
		initializeExecution,
		chaiPlugin
	};
`;
exports.default = template;
//# sourceMappingURL=sandbox-template.js.map