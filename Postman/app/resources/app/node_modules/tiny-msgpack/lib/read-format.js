'use strict';
var BufferUtil = require('./buffer-util');
var decodeUtf8 = require('./decode-utf8');
var decode = require('./decode');

var BUFFER = new Uint8Array(8);
var DATA_VIEW = new DataView(BUFFER.buffer, 0, 8);

var map = function (decoder, len) {
	var value = {};
	for (var i = 0; i < len; ++i) {
		value[decode(decoder)] = decode(decoder);
	}
	return value;
};

var array = function (decoder, len) {
	var value = new Array(len);
	for (var i = 0; i < len; ++i) {
		value[i] = decode(decoder);
	}
	return value;
};

var str = function (decoder, len) {
	var buffer = decoder.buffer;
	var start = decoder.offset;
	var end = decoder.offset = start + len;
	if (end > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	if (len <= 24) return decodeUtf8(buffer, start, end);
	return BufferUtil.toString(buffer, start, end);
};

var bin = function (decoder, len) {
	var buffer = decoder.buffer;
	var start = decoder.offset;
	var end = decoder.offset = start + len;
	if (end > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return BufferUtil.subarray(buffer, start, end);
};

var ext = function (decoder, len) {
	var buffer = decoder.buffer;
	var start = decoder.offset;
	var end = decoder.offset = start + len + 1;
	if (end > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	var etype = buffer[start];
	var unpacker;
	if (decoder.codec && (unpacker = decoder.codec._unpackerFor(etype))) {
		return unpacker(BufferUtil.subarray(buffer, start + 1, end));
	}
	var err = new Error('Unknown MessagePack extension type: ' + (etype ? ('0x' + etype.toString(16)) : etype));
	err.msgpackExtensionType = etype;
	throw err;
};

var uint8 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset >= buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return buffer[decoder.offset++];
};

var uint16 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset + 2 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return (buffer[decoder.offset++] << 8) | buffer[decoder.offset++];
};

var uint32 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset + 4 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return (buffer[decoder.offset++] * 0x1000000) +
		((buffer[decoder.offset++] << 16) |
		(buffer[decoder.offset++] << 8) |
		buffer[decoder.offset++]);
};

var uint64 = function (decoder) {
	var buffer = decoder.buffer;
	var offset = decoder.offset;
	if (offset + 8 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	decoder.offset += 8;
	BUFFER[0] = buffer[offset++];
	BUFFER[1] = buffer[offset++];
	BUFFER[2] = buffer[offset++];
	BUFFER[3] = buffer[offset++];
	BUFFER[4] = buffer[offset++];
	BUFFER[5] = buffer[offset++];
	BUFFER[6] = buffer[offset++];
	BUFFER[7] = buffer[offset];
	return DATA_VIEW.getBigUint64(0);
};

var int8 = function (decoder) {
	var val = uint8(decoder);
	return !(val & 0x80) ? val : (0xff - val + 1) * -1;
};

var int16 = function (decoder) {
	var val = uint16(decoder);
	return (val & 0x8000) ? val | 0xFFFF0000 : val;
};

var int32 = function (decoder) {
	var buffer = decoder.buffer;
	if (decoder.offset + 4 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	return (buffer[decoder.offset++] << 24) |
		(buffer[decoder.offset++] << 16) |
		(buffer[decoder.offset++] << 8) |
		buffer[decoder.offset++];
};

var int64 = function (decoder) {
	var buffer = decoder.buffer;
	var offset = decoder.offset;
	if (offset + 8 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	decoder.offset += 8;
	BUFFER[0] = buffer[offset++];
	BUFFER[1] = buffer[offset++];
	BUFFER[2] = buffer[offset++];
	BUFFER[3] = buffer[offset++];
	BUFFER[4] = buffer[offset++];
	BUFFER[5] = buffer[offset++];
	BUFFER[6] = buffer[offset++];
	BUFFER[7] = buffer[offset];
	return DATA_VIEW.getBigInt64(0);
};

var float32 = function (decoder) {
	var buffer = decoder.buffer;
	var offset = decoder.offset;
	if (offset + 4 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	decoder.offset += 4;
	BUFFER[0] = buffer[offset++];
	BUFFER[1] = buffer[offset++];
	BUFFER[2] = buffer[offset++];
	BUFFER[3] = buffer[offset];
	return DATA_VIEW.getFloat32(0);
};

var float64 = function (decoder) {
	var buffer = decoder.buffer;
	var offset = decoder.offset;
	if (offset + 8 > buffer.byteLength) throw new RangeError('BUFFER_SHORTAGE');
	decoder.offset += 8;
	BUFFER[0] = buffer[offset++];
	BUFFER[1] = buffer[offset++];
	BUFFER[2] = buffer[offset++];
	BUFFER[3] = buffer[offset++];
	BUFFER[4] = buffer[offset++];
	BUFFER[5] = buffer[offset++];
	BUFFER[6] = buffer[offset++];
	BUFFER[7] = buffer[offset];
	return DATA_VIEW.getFloat64(0);
};

module.exports = {
	map: map,
	array: array,
	str: str,
	bin: bin,
	ext: ext,
	uint8: uint8,
	uint16: uint16,
	uint32: uint32,
	uint64: uint64,
	int8: int8,
	int16: int16,
	int32: int32,
	int64: int64,
	float32: float32,
	float64: float64
};
