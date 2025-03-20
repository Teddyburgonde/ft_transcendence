'use strict';
const fs = require('fs');
const { Readable } = require('stream');
const tinyMsgpack = require('..');
const msgpackLite = require('msgpack-lite');
const msgpackLiteDecodeBuffer = require('msgpack-lite/lib/decode-buffer').DecodeBuffer;
const msgpackMsgpack = require('@msgpack/msgpack');
const msgpack = require('msgpack');

const DATA = fs.readFileSync('../super-server-logs/.local/msgpack.log');

(function main() {
	const hrtimeBefore = process.hrtime.bigint();
	let count = 0;
	for (const value of parseTinyMsgpack(DATA)) {
		count += 1;
	}
	const hrtimeAfter = process.hrtime.bigint();
	console.log('parse time: %s ms', (Number(hrtimeAfter - hrtimeBefore) / 1e6).toFixed(1));
	console.log('message count: %s', count);
})();

function parseTinyMsgpack(data) {
	return tinyMsgpack.decodeEach(data);
}

function parseMsgpackLite(data) {
	const decoder = new msgpackLiteDecodeBuffer();
	const values = [];
	decoder.push = (value) => {
		values.push(value);
	};
	decoder.write(data);
	decoder.flush();
	return values;
}

function parseMsgpackMsgpack(data) {
	return msgpackMsgpack.decodeMulti(data);
}

function* parseMsgpack(data) {
	const unpack = msgpack.unpack;
	for (;;) {
		yield unpack(data);
		if (unpack.bytes_remaining > 0) {
			data = data.subarray(data.byteLength - unpack.bytes_remaining);
		} else {
			break;
		}
	}
}
