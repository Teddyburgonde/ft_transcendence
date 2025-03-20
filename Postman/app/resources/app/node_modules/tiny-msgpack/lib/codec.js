'use strict';
var normalize = require('./buffer-util').normalize;

function Codec() {
	if (!(this instanceof Codec)) {
		throw new TypeError('Codecs must be constructed with the "new" keyword');
	}

	this._packerClasses = [];
	this._packers = [];
	this._unpackers = {};
}

Codec.prototype.register = function (etype, Class, packer, unpacker) {
	if (~~etype !== etype || !(etype >= 0 && etype < 128)) {
		throw new TypeError('Invalid extension type (must be between 0 and 127)');
	}
	if (typeof Class !== 'function') {
		throw new TypeError('Expected second argument to be a constructor function');
	}
	if (typeof packer !== 'function') {
		throw new TypeError('Expected third argument to be an encoding function');
	}
	if (typeof unpacker !== 'function') {
		throw new TypeError('Expected fourth argument to be a decoding function');
	}

	var codec = this;
	this._packerClasses.push(Class);
	this._packers.push(function (value) {
		var buffer = packer(value, codec);
		if (!(buffer instanceof Uint8Array)) {
			throw new TypeError('Codec must return a Buffer/Uint8Array (while encoding "' + Class.name + '")');
		}
		return new ExtensionBuffer(normalize(buffer), etype);
	});
	this._unpackers[etype] = function (value) {
		return unpacker(value, codec);
	};

	return this;
};

Codec.prototype._packerFor = function (value) {
	return getPacker(value, this._packerClasses, this._packers);
};

Codec.prototype._unpackerFor = function (etype) {
	return this._unpackers[etype];
};

module.exports = Codec;

// This is isolated for optimization purposes.
var getPacker = function (value, classes, packers) {
	for (var i = 0, len = classes.length; i < len; ++i) {
		if (value instanceof classes[i]) {
			return packers[i];
		}
	}
};

var ExtensionBuffer = function (buffer, etype) {
	this.buffer = buffer;
	this.etype = etype;
};
