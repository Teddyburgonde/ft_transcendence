'use strict';
var writeType = {};

var encode = module.exports = function (encoder, value) {
	writeType[typeof value](encoder, value);
};

// This immediately-invoked function fills the 'writeType' hash with functions
// that each encode values of their respective types.
(function (write, fromString, normalize) {

	if (typeof BigInt === 'function') {
		var ZERO = BigInt('0');
		var MAX_U64 = BigInt('0xffffffffffffffff');
		var MIN_I64 = BigInt('0x8000000000000000') * BigInt('-1');
	}

	var FLOAT32_BUFFER = new Float32Array(1);
	var isFloat32 = function (num) {
		FLOAT32_BUFFER[0] = num;
		return FLOAT32_BUFFER[0] === num;
	};

	var throwTooBigError = function (entity) {
		throw new RangeError(entity + ' too big for MessagePack');
	};

	writeType.number = function (encoder, value) {
		var uivalue = value >>> 0;
		if (value === uivalue) {
			// positive fixint -- 0x00 - 0x7f
			// uint 8 -- 0xcc
			// uint 16 -- 0xcd
			// uint 32 -- 0xce
			uivalue <= 0x7f ? write.type(encoder, uivalue) :
			uivalue <= 0xff ? write.int8(encoder, 0xcc, uivalue) :
			uivalue <= 0xffff ? write.int16(encoder, 0xcd, uivalue) :
			write.int32(encoder, 0xce, uivalue);
		} else {
			var ivalue = value | 0;
			if (value === ivalue) {
				// negative fixint -- 0xe0 - 0xff
				// int 8 -- 0xd0
				// int 16 -- 0xd1
				// int 32 -- 0xd2
				ivalue >= -0x20 ? write.type(encoder, ivalue & 0xff) :
				ivalue >= -0x80 ? write.int8(encoder, 0xd0, ivalue) :
				ivalue >= -0x8000 ? write.int16(encoder, 0xd1, ivalue) :
				write.int32(encoder, 0xd2, ivalue);
			} else {
				isFloat32(value)
					? write.float32(encoder, value)  // float 32 -- 0xca
					: write.float64(encoder, value); // float 64 -- 0xcb
			}
		}
	};

	writeType.bigint = function (encoder, value) {
		// uint 64 -- 0xcf
		// int 64 -- 0xd3
		value >= ZERO ?
			(value <= MAX_U64 ? write.bigUint64(encoder, value) : throwTooBigError('BigInt')) :
			(value >= MIN_I64 ? write.bigInt64(encoder, value) : throwTooBigError('BigInt'));
	};

	writeType.string = function (encoder, value) {
		var utf8 = fromString(value);
		var byteLength = utf8.byteLength;

		// fixstr -- 0xa0 - 0xbf
		// str 8 -- 0xd9
		// str 16 -- 0xda
		// str 32 -- 0xdb
		byteLength < 32 ? write.type(encoder, 0xa0 + byteLength) :
		byteLength <= 0xff ? write.int8(encoder, 0xd9, byteLength) :
		byteLength <= 0xffff ? write.int16(encoder, 0xda, byteLength) :
		byteLength <= 0xffffffff ? write.int32(encoder, 0xdb, byteLength) :
		throwTooBigError('String');

		encoder.send(utf8);
	};

	writeType.boolean = function (encoder, value) {
		// false -- 0xc2
		// true -- 0xc3
		write.type(encoder, value ? 0xc3 : 0xc2);
	};

	writeType.object = function (encoder, value) {
		var packer;
		if (value === null) return nil(encoder, value);
		if (Array.isArray(value)) return array(encoder, value);
		if (value instanceof Uint8Array) return bin(encoder, normalize(value));
		if (encoder.codec && (packer = encoder.codec._packerFor(value))) {
			return ext(encoder, packer(value));
		}
		map(encoder, value);
	};

	var nil = function (encoder) {
		// nil -- 0xc0
		write.type(encoder, 0xc0);
	};

	var array = function (encoder, value) {
		var length = value.length;

		// fixarray -- 0x90 - 0x9f
		// array 16 -- 0xdc
		// array 32 -- 0xdd
		length < 16 ? write.type(encoder, 0x90 + length) :
		length <= 0xffff ? write.int16(encoder, 0xdc, length) :
		length <= 0xffffffff ? write.int32(encoder, 0xdd, length) :
		throwTooBigError('Array');

		for (var i = 0; i < length; ++i) {
			encode(encoder, value[i]);
		}
	};

	var bin = function (encoder, value) {
		var byteLength = value.byteLength;

		// bin 8 -- 0xc4
		// bin 16 -- 0xc5
		// bin 32 -- 0xc6
		byteLength <= 0xff ? write.int8(encoder, 0xc4, byteLength) :
		byteLength <= 0xffff ? write.int16(encoder, 0xc5, byteLength) :
		byteLength <= 0xffffffff ? write.int32(encoder, 0xc6, byteLength) :
		throwTooBigError('Buffer/Uint8Array');

		encoder.send(value);
	};

	var ext = function (encoder, value) {
		var byteLength = value.buffer.byteLength;

		// fixext 1 -- 0xd4
		// fixext 2 -- 0xd5
		// fixext 4 -- 0xd6
		// fixext 8 -- 0xd7
		// fixext 16 -- 0xd8
		// ext 8 -- 0xc7
		// ext 16 -- 0xc8
		// ext 32 -- 0xc9
		byteLength === 1 ? write.int8(encoder, 0xd4, value.etype) :
		byteLength === 2 ? write.int8(encoder, 0xd5, value.etype) :
		byteLength === 4 ? write.int8(encoder, 0xd6, value.etype) :
		byteLength === 8 ? write.int8(encoder, 0xd7, value.etype) :
		byteLength === 16 ? write.int8(encoder, 0xd8, value.etype) :
		byteLength <= 0xff ? (write.int8(encoder, 0xc7, byteLength), write.type(encoder, value.etype)) :
		byteLength <= 0xffff ? (write.int16(encoder, 0xc8, byteLength), write.type(encoder, value.etype)) :
		byteLength <= 0xffffffff ? (write.int32(encoder, 0xc9, byteLength), write.type(encoder, value.etype)) :
		throwTooBigError('Extension data');

		encoder.send(value.buffer);
	};

	var map = function (encoder, value) {
		var keys = Object.keys(value);
		var length = keys.length;

		// fixmap -- 0x80 - 0x8f
		// map 16 -- 0xde
		// map 32 -- 0xdf
		length < 16 ? write.type(encoder, 0x80 + length) :
		length <= 0xffff ? write.int16(encoder, 0xde, length) :
		length <= 0xffffffff ? write.int32(encoder, 0xdf, length) :
		throwTooBigError('Object map');

		for (var i = 0; i < length; ++i) {
			var key = keys[i];
			(key >>> 0) + '' === key ? encode(encoder, key >>> 0) : encode(encoder, key);
			encode(encoder, value[key]);
		}
	};

	writeType.undefined = nil;
	writeType.function = nil;
	writeType.symbol = nil;
}(
	require('./write-header'),
	require('./buffer-util').fromString,
	require('./buffer-util').normalize
));
