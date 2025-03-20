'use strict';
var BufferUtil = require('./buffer-util');
var decoder = new TextDecoder;
var encoder = new TextEncoder;

BufferUtil.alloc = function (size) {
	return new Uint8Array(size);
};
BufferUtil.normalize = function (buffer) {
	return buffer;
};
BufferUtil.toString = function (buffer, start, end) {
	return decoder.decode(BufferUtil.subarray(buffer, start, end));
};
BufferUtil.fromString = function (string) {
	return encoder.encode(string);
};
BufferUtil.fromArrayBuffer = function (buffer, start, end) {
	return new Uint8Array(buffer, start, end);
};

module.exports = require('./msgpack');
