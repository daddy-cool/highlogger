# highlogger
[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Build Status](https://travis-ci.org/daddy-cool/highlogger.svg?branch=master)](https://travis-ci.org/daddy-cool/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)


## Installation
```bash
$ npm install highlogger
```


## Features

* logging to multiple transporters at once
* multiple transporters
    * console (accepts any writable stream but will default to `process.stdout`)
    * dgram socket (supporting only udp4 for now)
    * syslog, supporting [RFC5424](https://tools.ietf.org/html/rfc5424) (only udp4, structuredData not supported, messageId only used for debug)
* set different severity ranges per transporter, transporter will only log messages within their severity range
* debug prefixes/keys
    * white- and blacklisting for debug messages based on their prefix/key
* colors for console/streams
* optional singleton use to retain configuration across a whole project
* max message length per transporter


## Quick Start
```node
let Highlogger = require('highlogger');
let logger = new Highlogger();

logger.error('this is a error message');
logger.notice('this is a notice message');
```

Highlogger should be configured according to your setup.
It will work without any configuration but won't offer much besides the default node.js console then.


## Setup
Highlogger needs to be instanced at least once before you can use it.
It will accept an array as parameter for configuration.

```node
let logger = new Highlogger(config);
```

__Default Configuration__
```node
let config = [{
  type: 'console'
}];
```

Per default Highlogger will just log to console (`process.stdout`) and won't show any debug messages.


## Configuration
__type:__ `array`

The configuration array is expected to be an array of transporter configurations.
The default is a single console transporter.

__Example__
```node
let config = [
  {type: 'console'},
  {type: 'socket'}
];
```


#### transporter configuration
__type:__ `object`

The transporter config is different for each transporter type.
These attributes are supported by every transporter:

attribute    | type
------------ | ---------
severity     | `object`
type         | `string`

Other attributes are supported depending on the transporter type.

### transporter.maxMessageSize
__type:__ `number`
__default:__ `Infinity` for Console and `512` for Socket & Syslog

The value is in bytes or characters and if a message exceeds the maxMessageSize the message will be replaced by a message like "message size exceeded".

__Example__
```node
let config = [
  {
    type: 'console',
    maxMessageSize: 1024
  }
];
```

In this example any message longer than 1024 bytes would be replaced.


### transporter.severity
__type:__ `object`
__default:__
```node
  {
    minimum: 'emerg',
    maximum: 'debug'
  }
```

`severity` is expected to be an object that can two fields: `minimum` and `maximum`.
These set the severity range this transporter should react on.

Both fields are optional and if one is passed it must be a `string`.
Per default transporters react to any severity.

Available values are:

* `emerg`
* `alert`
* `crit`
* `error`
* `warn`
* `notice`
* `info`
* `debug`

A lower severity means a higher priority, so `emerg` is the lowest severity while `debug` is the highest.

__Example__
```node
let config = [
  {
    type: 'console',
    severity: {
      minimum: 'error',
      maximum: 'debug'
    }
  }
];
```

In this example any message lower than `error` wouldn't be sent to this transporter, which means `emerg`, `alert` and `crit` would be ignored.


### transporter.type
__type:__ `string`
__required__

With `type` you can decide what kind of transporter you are setting up.

Available values are:

* `console`
* `socket`
* `syslog`

__Example__
```node
let config = [
  {type: 'console'}
];
```


#### transporter.type 'console'
The following attributes are only available when transporter `type` is set to `console`


##### transporter.stream
__type:__ `object`
__default:__ `process.stdout`

Here you can set in which stream to write all messages for this transporter.
Defaults to your node.js console (`process.stdout`) but should support any writable stream, including e.g. filestreams (to log in a file).

__Example__
```node
let config = [
 {
   type: 'console',
   stream: process.stdout
 }
];
```


##### transporter.colors
__type:__ `boolean`
__default:__ `true`

This flag decides whether or not messages for this transporter will be colored.
Disable this if your `stream` doesn't support colors.

__Example__
```node
let config = [
 {
   type: 'console',
   colors: false
 }
];
```


#### transporter.type 'socket'
The following attributes are only available when transporter `type` is set to `socket`


##### transporter.method
__type:__ `string`
__required__

Currently only supports `udp4`

__Example__
```node
let config = [
 {
   type: 'socket',
   method: 'udp4'
 }
];
```


##### transporter.address
__type:__ `string`
__required__

Expects the target IP/URL for sending messages.

__Example__
```node
let config = [
 {
   type: 'socket',
   address: '127.0.0.1'
 }
];
```


##### transporter.port
__type:__ `number`
__required__

Expects the target port for sending messages.

__Example__
```node
let config = [
 {
   type: 'socket',
   port: 43002
 }
];
```


#### transporter.type 'syslog'
The following attributes are only available when transporter `type` is set to `syslog`


##### transporter.facility
__type:__ `string`
__default:__ `user`

This can be used to set your desired facility.

Available values

* `kern`
* `user`
* `mail`
* `daemon`
* `auth`
* `syslog`
* `lpr`
* `news`
* `uucp`
* `clock`
* `sec`
* `ftp`
* `ntp`
* `audit`
* `alert`
* `clock2`
* `local0`
* `local1`
* `local2`
* `local3`
* `local4`
* `local5`
* `local6`
* `local7`

__Example__
```node
let config = [
 {
   type: 'syslog',
   facility: 'local0'
 }
];
```


##### transporter.hostname
__type:__ `string`
__default:__ `require('os').hostname()`

This allows you to set an hostname for your messages.
This string will be filtered according to PRINTUSASCII and can only be a maximum of 255 characters (as defined in [RFC5424](https://tools.ietf.org/html/rfc5424#section-6))

__Example__
```node
let config = [
 {
   type: 'syslog',
   hostname: 'PC-10-10-10-10'
 }
];
```


##### transporter.appName
__type:__ `string`
__default:__ `'-'`

This allows you to set an appName for your messages.
This string will be filtered according to PRINTUSASCII and can only be a maximum of 48 characters (as defined in [RFC5424](https://tools.ietf.org/html/rfc5424#section-6))

__Example__
```node
let config = [
 {
   type: 'syslog',
   appName: 'myNodeApplication'
 }
];
```


##### transporter.processId
__type:__ `string`
__default:__ `process.pid`

This allows you to set a processId for your messages.
This string will be filtered according to PRINTUSASCII and can only be a maximum of 128 characters (as defined in [RFC5424](https://tools.ietf.org/html/rfc5424#section-6))

__Example__
```node
let config = [
 {
   type: 'syslog',
   processId: '83123'
 }
];
```


##### transporter.timezoneOffset
__type:__ `number`
__default:__ attempts to read your systems offset from UTC time

This allows you to set a custom timezone offset for your messages.
The offset must be from UTC time and in hours, only -16 to 16 are allowed.

__Example__
```node
let config = [
 {
   type: 'syslog',
   timezoneOffset: 2
 }
];
```


##### transporter.method
__type:__ `string`
__default:__ `'udp4'`

Currently only supports `'udp4'`

__Example__
```node
let config = [
 {
   type: 'syslog',
   method: 'udp4'
 }
];
```


##### transporter.address
__type:__ `string`
__default:__ `'127.0.0.1'`

Expects the target IP/URL for sending messages.

__Example__
```node
let config = [
 {
   type: 'syslog',
   address: '127.0.0.1'
 }
];
```


##### transporter.port
__type:__ `number`
__default:__ `514`

Expects the target port for sending messages.

__Example__
```node
let config = [
 {
   type: 'syslog',
   port: 514
 }
];
```

### transporter.json
__type:__ `boolean`
__default:__ `false`

This flag determines whether or not the transporter should always log messages as stringified JSON objects.
This doesn't change the behavior when logging objects, those become stringified JSON objects anyway.

What this does is, it will wrap any non-object as a value in a simple object and if it's an array convert it to an object.

__Example transporter.json=true__
`"foobar"` would become `{"0": "foobar"}`

This should only be enabled for transporters if you specifically need stringified JSON _objects_.
(e.g. Kibana pattern)

__Example__
```node
let config = [
 {
   type: 'syslog',
   json: true
 }
];
```

## Singleton

Highlogger needs to be instanced at least once with your desired configuration.
You should always access the same instance of Highlogger you previously created, unless you specifically want to create a new instance of Highlogger with a different configuration.
In most cases it should be enough to access Highlogger's built-in singleton functionality

```node
let logger = require('highlogger').getInstance();

logger.notice('this is a error message');
```

But keep in mind that this will work only if you previously instanced Highlogger at least once.
In rare cases you might not be able to rely on node.js's built-in module caching, then you either need to inject/pass your instance of Highlogger to any place you're going to use it or use a service locator.


## Usage
An instance of Highlogger offers logging methods for each possible severity, the only exception being `DEBUG` (see below).

They can all be used with the same syntax:
```node
let logger = new Highlogger();

logger.warn(message0, message1, messageN);
```
At least one `message` param is required (obviously) but you can log with as many message params as you want

### Debug
You can set debug keys per environment variable `DEBUG`.
Debug keys are set by passing a comma-separated list of keys.

Only keys that are included will show and as a wildcard you can use `*`, which will match anything.
This means `DEBUG=*` would include any key while `DEBUG=foo,bar*` would only include the key `foo` and any key starting with `bar`.

You can also exclude specific keys by prefixing them with a `-` character.
`DEBUG=*,-foobar:*` would include all debug keys except those starting with `foobar:`.

On Windows the environment variable is set using the set command:
```bash
set DEBUG=*,-not_this
```

### Available methods


### emerg(message...)
Will pass on message and options with `emerg` severity to transporters.


### crit(message...)
Will pass on message and options with `crit` severity to transporters.


### error(message...)
Will pass on message and options with `error` severity to transporters.


### warn(message...)
Will pass on message and options with `warn` severity to transporters.


### info(message...)
Will pass on message and options with `info` severity to transporters.


### getDebug(prefix)
Debug gets special treatment.
In order to use the debug-function you must first call `getDebug(prefix)` which will return a function.
Depending on whether or not your passed `prefix` is currently included in the `DEBUG` environment variable this will either return the `debug`- or a dummy-function.
`debug` will work the same as the above functions, while a dummy function will do nothing.
This allows you to leave all your debug logs in your project without any harm and you can just enable/disable them on a whim.

__Example__
```node
let logger = new Highlogger();
let debug = logger.getDebug('foobar');

debug('this is a debug message');
```
In the example this message would be logged if "foobar" is a whitelisted debug prefix/key. Otherwise it would not do anything.


#### debug(message...)
Will pass on message and options with `debug` severity to transporters.


## Tests

To run the test suite, install the dependencies first, then run `npm test`:

```bash
$ npm install
$ npm test
```

To check test coverage run `npm run cover`, after installing the dependencies:

```bash
$ npm install
$ npm run cover
```


## Todo

  * remove moment dependency
  * support for external transporter plugins
  * direct file logging transporter (already working by passing a filestream to console transporter)
  * unix-domain support for socket transporter
  * tcp4/6 support for socket transporter
  * udp6 support for socket transporter


## People

The original author of Highlogger is me, [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)


## License

[MIT](LICENSE)
