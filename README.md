ProtocolJS
==========

A JavaScript port of Clojure's protocol polymorphism.

## Inspiration and Attribution

ProtocolJS is an informal fork of [Gozala's protocol module](https://github.com/Gozala/protocol)
with some variation in implementation to

- Make it compatible across more browsers.
- Make it more robust to using serialized objects with the library between runtime restarts.
- Reflect other stylistic opinions.

## Installation

```
$ npm install protocoljs
```

## Documentation

A protocol is a set of function interfaces.

```javascript
var protocol = require('protocoljs');

var Enumerable = protocol({
  first: [protocol] // Here protocol is a placeholder for the typed argument
, rest: [protocol]
, repeat: [Number, protocol] // The typed argument does not need to be first
});
```

Protocols enable polymorphism in a flexible way where the interface definition
is decoupled from the implementations for any number of types.

```javascript
Enumerable(Array, {
  first: function (array) {
    return array[0];
  }
, rest: function (array) {
    return array.slice(1);
  }
, repeat: function (times, array) {
    var result = [];
    while (times--) {
      result = result.concat(array);
    }
    return result;
  }
});

Enumerable.first([1, 2, 3]); // => 1
Enumerable.rest([1, 2, 3]); // => [2, 3]
Enumerable.repeat(2, [1, 2, 3]); // => [1, 2, 3, 1, 2, 3]
```

You can tie any number of types to a protocol.

```javascript
Enumerable(String, {
  first: function (string) {
    return string.charAt(0);
  }
, rest: function (string) {
    return string.substring(1);
  }
, repeat: function (times, string) {
    var result = '';
    while (times--) {
      result += string;
    }
    return result;
  }
});

Enumerable.first('abc'); => 'a'
Enumerable.rest('abc'); => 'bc'
Enumerable.repeat(2, 'abc'); => 'abcabc'
```

You can also tie any number of protocols to a type.

```javascript
var RightEnumerable = protocol({
  first: [protocol]
, rest: [protocol]
});

RightEnumerable(String, {
  first: function (string) {
    return string.charAt(string.length-1);
  }
, rest: function (string) {
    return string.substring(0, string.length-1);
  }
});

RightEnumerable.first('abc'); // => 'c'
RightEnumerable.rest('abc'); // => 'ab'
```

Finally, you can re-open protocols and extend their interfaces.

```javascript
protocol(Enumerable, {
  slice: [protocol, Number, Number]
});

Enumerable(Array, {
  slice: function (array, start, end) {
    return array.slice(start, end);
  }
});

Enumerable(String, {
  slice: function (string, start, end) {
    return string.substring(start, end);
  }
});

Enumerable.slice([1, 2, 3], 0, 2); => [1, 2]
Enumerable.slice('abc', 0, 2); => 'ab'
```

### MIT License
Copyright (c) 2011 by Brian Noguchi and Nate Smith

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
