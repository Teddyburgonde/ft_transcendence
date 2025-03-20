# tiny-msgpack [![Build Status](https://travis-ci.org/JoshuaWise/tiny-msgpack.svg?branch=master)](https://travis-ci.org/JoshuaWise/tiny-msgpack)

A minimalistic [MessagePack](http://msgpack.org/index.html) encoder and decoder for JavaScript.

- Tiny Size (3.95 kB minified and gzipped)
- Fast performance
- Extension support
- No other bells or whistles

By default, `msgpack` can encode numbers, bigints, strings, booleans, nulls, arrays, objects, and binary data ([Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) in browsers, [Buffer](https://nodejs.org/api/buffer.html) in Node.js). However, additional types can be registered by using [extensions](#extensions).

## Installation

```bash
npm install --save tiny-msgpack
```

## Usage

```js
const msgpack = require('tiny-msgpack');

const uint8array = msgpack.encode({ foo: 'bar', baz: 123 });
const object = msgpack.decode(uint8array);
```

#### Decoding multiple concatenated messages

```js
for (const object of msgpack.decodeEach(uint8array)) {
	console.log(object);
}
```

#### BigInts

You can encode 64-bit integers by using [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). Likewise, decoding a 64-bit integer will result in a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt). If [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) is not supported on your platform, decoding a 64-bit integer will throw an exception.

## Extensions

```js
const msgpack = require('tiny-msgpack');

function encodeDate(date) {
  return msgpack.encode(Number(date));
}

function decodeDate(uint8array) {
  return new Date(msgpack.decode(uint8array));
}

const codec = new msgpack.Codec();
codec.register(0xff, Date, encodeDate, decodeDate);

const uint8array = msgpack.encode({ timestamp: new Date() }, codec);
const object = msgpack.decode(uint8array, codec);

console.log(object.timestamp instanceof Date); // => true
```

## Browser Support

In the browser, `tiny-msgpack` requires the [Encoding API](https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API), which is only supported by modern browsers. However, if you polyfill it, this package is supported by the following browsers:

- Chrome 9+
- Firefox 15+
- Safari 5.1+
- Opera 12.1+
- Internet Explorer 10+

## Zero copy

In the [MessagePack](http://msgpack.org/index.html) format, binary data is encoded as... binary data! To maximize performance, `tiny-msgpack` does not copy binary data when encoding or decoding it. So after decoding, the contents of a returned `Uint8Array` can be affected by modifying the input `Uint8Array` (the same can happen with encoding).

## License

[MIT](https://github.com/JoshuaWise/tiny-msgpack/blob/master/LICENSE)
