'use strict';

module.exports = function (decoder) {
	var type = readUint8(decoder);
	switch (type) {
		case 0x00: case 0x01: case 0x02: case 0x03: case 0x04: case 0x05: case 0x06: case 0x07: case 0x08: case 0x09: case 0x0a: case 0x0b: case 0x0c: case 0x0d: case 0x0e: case 0x0f:
		case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x17: case 0x18: case 0x19: case 0x1a: case 0x1b: case 0x1c: case 0x1d: case 0x1e: case 0x1f:
		case 0x20: case 0x21: case 0x22: case 0x23: case 0x24: case 0x25: case 0x26: case 0x27: case 0x28: case 0x29: case 0x2a: case 0x2b: case 0x2c: case 0x2d: case 0x2e: case 0x2f:
		case 0x30: case 0x31: case 0x32: case 0x33: case 0x34: case 0x35: case 0x36: case 0x37: case 0x38: case 0x39: case 0x3a: case 0x3b: case 0x3c: case 0x3d: case 0x3e: case 0x3f:
		case 0x40: case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47: case 0x48: case 0x49: case 0x4a: case 0x4b: case 0x4c: case 0x4d: case 0x4e: case 0x4f:
		case 0x50: case 0x51: case 0x52: case 0x53: case 0x54: case 0x55: case 0x56: case 0x57: case 0x58: case 0x59: case 0x5a: case 0x5b: case 0x5c: case 0x5d: case 0x5e: case 0x5f:
		case 0x60: case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: case 0x67: case 0x68: case 0x69: case 0x6a: case 0x6b: case 0x6c: case 0x6d: case 0x6e: case 0x6f:
		case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77: case 0x78: case 0x79: case 0x7a: case 0x7b: case 0x7c: case 0x7d: case 0x7e: case 0x7f:
			// positive fixint
			return type;
		case 0x80: case 0x81: case 0x82: case 0x83: case 0x84: case 0x85: case 0x86: case 0x87: case 0x88: case 0x89: case 0x8a: case 0x8b: case 0x8c: case 0x8d: case 0x8e: case 0x8f:
			// fixmap
			return readMap(decoder, type - 0x80);
		case 0x90: case 0x91: case 0x92: case 0x93: case 0x94: case 0x95: case 0x96: case 0x97: case 0x98: case 0x99: case 0x9a: case 0x9b: case 0x9c: case 0x9d: case 0x9e: case 0x9f:
			// fixarray
			return readArray(decoder, type - 0x90);
		case 0xa0: case 0xa1: case 0xa2: case 0xa3: case 0xa4: case 0xa5: case 0xa6: case 0xa7: case 0xa8: case 0xa9: case 0xaa: case 0xab: case 0xac: case 0xad: case 0xae: case 0xaf:
		case 0xb0: case 0xb1: case 0xb2: case 0xb3: case 0xb4: case 0xb5: case 0xb6: case 0xb7: case 0xb8: case 0xb9: case 0xba: case 0xbb: case 0xbc: case 0xbd: case 0xbe: case 0xbf:
			// fixstr
			return readStr(decoder, type - 0xa0);
		case 0xc0:
			// nil
			return null;
		case 0xc1:
			// (never used)
			throw invalidFormat(type);
		case 0xc2:
			// false
			return false;
		case 0xc3:
			// true
			return true;
		case 0xc4:
			// bin 8
			return readBin(decoder, readUint8(decoder));
		case 0xc5:
			// bin 16
			return readBin(decoder, readUint16(decoder));
		case 0xc6:
			// bin 32
			return readBin(decoder, readUint32(decoder));
		case 0xc7:
			// ext 8
			return readExt(decoder, readUint8(decoder));
		case 0xc8:
			// ext 16
			return readExt(decoder, readUint16(decoder));
		case 0xc9:
			// ext 32
			return readExt(decoder, readUint32(decoder));
		case 0xca:
			// float 32
			return readFloat32(decoder);
		case 0xcb:
			// float 64
			return readFloat64(decoder);
		case 0xcc:
			// uint 8
			return readUint8(decoder);
		case 0xcd:
			// uint 16
			return readUint16(decoder);
		case 0xce:
			// uint 32
			return readUint32(decoder);
		case 0xcf:
			// uint 64
			if (typeof BigInt !== 'function') {
				throw invalidFormat(type);
			}
			return readUint64(decoder);
		case 0xd0:
			// int 8
			return readInt8(decoder);
		case 0xd1:
			// int 16
			return readInt16(decoder);
		case 0xd2:
			// int 32
			return readInt32(decoder);
		case 0xd3:
			// int 64
			if (typeof BigInt !== 'function') {
				throw invalidFormat(type);
			}
			return readInt64(decoder);
		case 0xd4:
			// fixext 1
			return readExt(decoder, 1);
		case 0xd5:
			// fixext 2
			return readExt(decoder, 2);
		case 0xd6:
			// fixext 4
			return readExt(decoder, 4);
		case 0xd7:
			// fixext 8
			return readExt(decoder, 8);
		case 0xd8:
			// fixext 16
			return readExt(decoder, 16);
		case 0xd9:
			// str 8
			return readStr(decoder, readUint8(decoder));
		case 0xda:
			// str 16
			return readStr(decoder, readUint16(decoder));
		case 0xdb:
			// str 32
			return readStr(decoder, readUint32(decoder));
		case 0xdc:
			// array 16
			return readArray(decoder, readUint16(decoder));
		case 0xdd:
			// array 32
			return readArray(decoder, readUint32(decoder));
		case 0xde:
			// map 16
			return readMap(decoder, readUint16(decoder));
		case 0xdf:
			// map 32
			return readMap(decoder, readUint32(decoder));
		case 0xe0: case 0xe1: case 0xe2: case 0xe3: case 0xe4: case 0xe5: case 0xe6: case 0xe7: case 0xe8: case 0xe9: case 0xea: case 0xeb: case 0xec: case 0xed: case 0xee: case 0xef:
		case 0xf0: case 0xf1: case 0xf2: case 0xf3: case 0xf4: case 0xf5: case 0xf6: case 0xf7: case 0xf8: case 0xf9: case 0xfa: case 0xfb: case 0xfc: case 0xfd: case 0xfe: case 0xff:
			// negative fixint
			return type - 0x100;
	}
	throw invalidFormat(undefined);
};

// Dependencies are loaded after exporting, to satisfy the required load order.
var read = require('./read-format');
var readUint8 = read.uint8;
var readUint16 = read.uint16;
var readUint32 = read.uint32;
var readUint64 = read.uint64;
var readInt8 = read.int8;
var readInt16 = read.int16;
var readInt32 = read.int32;
var readInt64 = read.int64;
var readFloat32 = read.float32;
var readFloat64 = read.float64;
var readMap = read.map;
var readArray = read.array;
var readStr = read.str;
var readBin = read.bin;
var readExt = read.ext;

var invalidFormat = function (type) {
	var display = typeof type === 'number' ? '0x' + type.toString(16) : String(type);
	return new Error('Invalid MessagePack format: ' + display);
};
