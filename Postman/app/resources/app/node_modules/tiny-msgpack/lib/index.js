'use strict';
var BufferUtil = require('./buffer-util');

BufferUtil.alloc = function (size) {
	return Buffer.alloc(size);
};
BufferUtil.normalize = function (buffer) {
	if (Buffer.isBuffer(buffer)) return buffer;
	return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};
BufferUtil.toString = function (buffer, start, end) {
	return buffer.toString('utf8', start, end);
};
BufferUtil.fromString = function (string) {
	return Buffer.from(string);
};
BufferUtil.fromArrayBuffer = function (buffer, start, end) {
	return Buffer.from(buffer, start, end);
};

module.exports = require('./msgpack');
