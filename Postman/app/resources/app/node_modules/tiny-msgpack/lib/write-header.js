'use strict';

exports.type = function (encoder, type) {
	encoder.reserve(1);
	encoder.buffer[encoder.offset++] = type;
};

exports.int8 = function (encoder, type, value) {
	encoder.reserve(2);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = type;
	buffer[encoder.offset++] = value;
};

exports.int16 = function (encoder, type, value) {
	encoder.reserve(3);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = type;
	buffer[encoder.offset++] = value >>> 8;
	buffer[encoder.offset++] = value;
};

exports.int32 = function (encoder, type, value) {
	encoder.reserve(5);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = type;
	buffer[encoder.offset++] = value >>> 24;
	buffer[encoder.offset++] = value >>> 16;
	buffer[encoder.offset++] = value >>> 8;
	buffer[encoder.offset++] = value;
};

exports.bigUint64 = function (encoder, value) {
	encoder.reserve(9);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = 0xcf;
	encoder.getView().setBigUint64(buffer.byteOffset + encoder.offset, value);
	encoder.offset += 8;
};

exports.bigInt64 = function (encoder, value) {
	encoder.reserve(9);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = 0xd3;
	encoder.getView().setBigInt64(buffer.byteOffset + encoder.offset, value);
	encoder.offset += 8;
};

exports.float32 = function (encoder, value) {
	encoder.reserve(5);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = 0xca;
	encoder.getView().setFloat32(buffer.byteOffset + encoder.offset, value);
	encoder.offset += 4;
};

exports.float64 = function (encoder, value) {
	encoder.reserve(9);
	var buffer = encoder.buffer;
	buffer[encoder.offset++] = 0xcb;
	encoder.getView().setFloat64(buffer.byteOffset + encoder.offset, value);
	encoder.offset += 8;
};
