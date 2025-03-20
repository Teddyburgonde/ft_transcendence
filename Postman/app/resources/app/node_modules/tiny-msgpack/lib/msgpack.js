'use strict';
var Codec = require('./codec');
var Paper = require('./paper');
var encode = require('./encode');
var decode = require('./decode');
var normalize = require('./buffer-util').normalize;

exports.encode = function (input, codec) {
	if (codec != null && !(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec, if provided');
	}

	var encoder = new Paper(codec);
	encode(encoder, input);
	return encoder.read();
};

exports.decode = function (input, codec) {
	if (codec != null && !(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec, if provided');
	}
	if (!(input instanceof Uint8Array)) {
		throw new TypeError('Expected first argument to be a Buffer/Uint8Array');
	}

	var decoder = new Paper(codec);
	decoder.setBuffer(normalize(input));
	return decode(decoder);
};

exports.decodeEach = function (input, codec) {
	if (codec != null && !(codec instanceof Codec)) {
		throw new TypeError('Expected second argument to be a Codec, if provided');
	}
	if (!(input instanceof Uint8Array)) {
		throw new TypeError('Expected first argument to be a Buffer/Uint8Array');
	}

	var decoder = new Paper(codec);
	decoder.setBuffer(normalize(input));

	var length = decoder.buffer.byteLength;
	var iterator = {
		next: function () {
			if (decoder.offset < length) {
				return { value: decode(decoder), done: false };
			} else {
				return { value: undefined, done: true };
			}
		},
		return: function (value) {
			decoder.offset = length;
			return { value: value, done: true };
		},
		throw: function (reason) {
			decoder.offset = length;
			throw reason;
		}
	};

	if (typeof Symbol === 'function' && Symbol.iterator != null) {
		iterator[Symbol.iterator] = function () { return this; };
	}

	return iterator;
};

exports.Codec = Codec;
