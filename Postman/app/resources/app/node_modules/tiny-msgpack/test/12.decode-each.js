'use strict';
var encode = require('../.').encode;
var decodeEach = require('../.').decodeEach;
var util = require('util');
var expect = require('chai').expect;

function expectToDecodeAll(value) {
	var encoded = encode(value);
	encoded = Buffer.concat([encoded, encoded, encoded]);
	expect(Array.from(decodeEach(encoded))).to.deep.equal([value, value, value]);
}

function expectToDecodeAllExactly(value, expectedResult) {
	var encoded = encode(value);
	encoded = Buffer.concat([encoded, encoded, encoded]);
	expect(Array.from(decodeEach(encoded))).to.deep.equal([expectedResult, expectedResult, expectedResult]);
}

function stringOf(length) {
	var str = '';
	while (str.length < length) str += 'x';
	return str;
}

function objectOf(keyCount) {
	var obj = {};
	for (var i = 0; i < keyCount; ++i) obj[-1000000 - i] = true;
	return obj;
}

[Array, Uint8Array].forEach(function (Class) {
	if (typeof Class.prototype.fill !== 'function') {
		Class.prototype.fill = function (value) {
			for (var i = 0; i < this.length; ++i) this[i] = value;
			return this;
		};
	}
});

if (typeof Array.from !== 'function') {
	Array.from = function (iterator) {
		var values = [];
		var entry;
		while (!(entry = iterator.next()).done) {
			values.push(entry.value);
		}
		return values;
	};
}

describe('msgpack.decodeEach()', function () {
	this.timeout(5000);
	this.slow(5000);
	specify('null', function () {
		expectToDecodeAll(null);
	});
	specify('undefined', function () {
		expectToDecodeAllExactly(undefined, null);
	});
	specify('boolean', function () {
		expectToDecodeAll(true);
		expectToDecodeAll(false);
	});
	specify('fixint', function () {
		expectToDecodeAll(0);
		expectToDecodeAll(127);
		expectToDecodeAll(-1);
		expectToDecodeAll(-32);
	});
	specify('uint', function () {
		expectToDecodeAll(128);
		expectToDecodeAll(255);
		expectToDecodeAll(256);
		expectToDecodeAll(65535);
		expectToDecodeAll(65536);
		expectToDecodeAll(4294967295);
	});
	specify('int', function () {
		expectToDecodeAll(-33);
		expectToDecodeAll(-128);
		expectToDecodeAll(-129);
		expectToDecodeAll(-32768);
		expectToDecodeAll(-32769);
		expectToDecodeAll(-2147483648);
		if (typeof BigInt === 'function') {
			expectToDecodeAll(BigInt('0xffffffffffffffff'));
			expectToDecodeAll(BigInt('0x8000000000000000') * BigInt('-1'));
			expectToDecodeAll(BigInt('0xffffffff'));
			expectToDecodeAll(BigInt('0x80000000'));
			expectToDecodeAll(BigInt('0x80000000') * BigInt('-1'));
			expectToDecodeAll(BigInt('0'));
			expectToDecodeAll(BigInt('1'));
			expectToDecodeAll(BigInt('-1'));
		}
	});
	specify('float', function () {
		expectToDecodeAll(4294967296);
		expectToDecodeAll(-2147483904);
		expectToDecodeAll(0.5);
		expectToDecodeAll(0.25);
		expectToDecodeAll(-0.5);
		expectToDecodeAll(-0.25);
		expectToDecodeAll(4e39);
		expectToDecodeAll(-4e39);
		expectToDecodeAll(0.3);
		expectToDecodeAll(-0.3);
	});
	specify('string', function () {
		expectToDecodeAll('');
		expectToDecodeAll('x');
		expectToDecodeAll(stringOf(31));
		expectToDecodeAll(stringOf(32));
		expectToDecodeAll(stringOf(255));
		expectToDecodeAll(stringOf(256));
		expectToDecodeAll(stringOf(65535));
		expectToDecodeAll(stringOf(65536));
	});
	specify('binary', function () {
		function expectToDecodeAllBinary(value) {
			var encoded = encode(value);
			encoded = Buffer.concat([encoded, encoded, encoded]);
			var decoded = Array.from(decodeEach(encoded));
			expect(decoded).to.be.an('array');
			expect(decoded).to.have.lengthOf(3);
			for (var chunk of decoded) {
				expect(chunk).to.be.an.instanceof(Uint8Array);
				expect(Buffer.from(chunk).equals(value));
			}
		}
		expectToDecodeAllBinary(new Uint8Array(0).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(1).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(31).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(32).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(255).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(256).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(65535).fill(0x77));
		expectToDecodeAllBinary(new Uint8Array(65536).fill(0x77));
	});
	specify('array', function () {
		expectToDecodeAll(new Array(0).fill(true));
		expectToDecodeAll(new Array(1).fill(true));
		expectToDecodeAll(new Array(15).fill(true));
		expectToDecodeAll(new Array(16).fill(true));
		expectToDecodeAll(new Array(255).fill(true));
		expectToDecodeAll(new Array(256).fill(true));
		expectToDecodeAll(new Array(65535).fill(true));
		expectToDecodeAll(new Array(65536).fill(true));
	});
	specify('object', function () {
		expectToDecodeAll({});
		expectToDecodeAll({ 0: true });
		expectToDecodeAll({ 127: true });
		expectToDecodeAll({ 128: true });
		expectToDecodeAll({ 255: true });
		expectToDecodeAll({ 256: true });
		expectToDecodeAll({ '-1': true });
		expectToDecodeAll({ '0.5': true });
		expectToDecodeAll({ '': true });
		expectToDecodeAll({ 'foo': true });
		expectToDecodeAll({ 'foo': true });
		expectToDecodeAll(objectOf(15));
		expectToDecodeAll(objectOf(16));
		expectToDecodeAll(objectOf(65535));
		expectToDecodeAll(objectOf(65536));
	});
	specify('symbol', function () {
		if (typeof Symbol === 'function') {
			expectToDecodeAllExactly(Symbol(), null);
		}
	});
	specify('function', function () {
		expectToDecodeAllExactly(function () {}, null);
	});
});
