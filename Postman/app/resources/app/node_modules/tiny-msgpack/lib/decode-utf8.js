'use strict';

// This decodes UTF-8 (given as part of a Uint8Array) to a string. Compared to
// native implementations such as TextDecoder and Buffer, this performs faster
// for small strings and worse for large strings.
module.exports = function (buffer, offset, offsetEnd) {
	var output = [];

	while (offset < offsetEnd) {
		var byte1 = buffer[offset++];
		if ((byte1 & 0x80) === 0) {
			// 1 byte
			output.push(byte1);
		} else if ((byte1 & 0xe0) === 0xc0) {
			// 2 bytes
			var byte2 = buffer[offset++] & 0x3f;
			output.push(((byte1 & 0x1f) << 6) | byte2);
		} else if ((byte1 & 0xf0) === 0xe0) {
			// 3 bytes
			var byte2 = buffer[offset++] & 0x3f;
			var byte3 = buffer[offset++] & 0x3f;
			output.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
		} else if ((byte1 & 0xf8) === 0xf0) {
			// 4 bytes
			var byte2 = buffer[offset++] & 0x3f;
			var byte3 = buffer[offset++] & 0x3f;
			var byte4 = buffer[offset++] & 0x3f;
			var unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
			if (unit > 0xffff) {
				unit -= 0x10000;
				output.push(((unit >>> 10) & 0x3ff) | 0xd800);
				unit = 0xdc00 | (unit & 0x3ff);
			}
			output.push(unit);
		} else {
			output.push(byte1);
		}
	}

	return String.fromCharCode.apply(String, output);
};
