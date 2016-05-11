# highlogger
[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Build Status](https://travis-ci.org/daddy-cool/highlogger.svg?branch=master)](https://travis-ci.org/daddy-cool/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)

## Installation
```bash
$ npm install highlogger
```

## Features
* log to multiple transporters at once, depending on message severity
* set severity range per transporter, each transporter will only log messages within its severity range
* available transporters:
  * console
  * socket (only udp4 right now)
  * syslog (implemented after [RFC5424](https://tools.ietf.org/html/rfc5424), only udp4 right now, structuredData  & messageId not supported)
* debug environment variable
  * white- and blacklisting for debug messages based on their debug key
* can be used as singleton
* configurable maximum message length per transporter
* support for a fallback transporter in case maximum message length was exceeded
* supports loading config via [config](https://www.npmjs.com/package/config) module if present

## Quick Start
```node
let Highlogger = require('highlogger');
let log = new Highlogger();

log.error('this is a error message');
log.notice('this is a notice message');
```

Highlogger has to be configured according to your demands.<br />
Per default Highlogger will log to console (`process.stdout` & `process.stderr`).<br />
Debug messages will only be shown if the environment is set.

## Setup
Highlogger has to be instanced at least once before you can use it.<br />
It will accept an array (also a collection) of transporter configs as a parameter for configuration.

__Example with parameter__
```node
let Highlogger = require('highlogger');
let config = [
  {type: 'console'}
];

let log = new Highlogger(config);
```

If you have the [config](https://www.npmjs.com/package/config) module installed you can also put your config in your `yml`-file under the key `highlogger`

__Example default.yml__
```yml
highlogger:
  -
    type: console
```

__Example setup__
```node
let Highlogger = require('highlogger');
let log = new Highlogger();
```

## Configuration
__type:__ `array`

The configuration array has to be an array (or collection) of transporter configurations.

__Example__
```node
[
  {type: 'console'},
  {type: 'syslog'}
]
```

__Config fields supported by every transporter:__

field       | type
----------- | ---------
type        | `string`
sizeLimit   | `number`
severityMin | `string`
severityMax | `string`
json        | `boolean`
fallback    | `object`

__Example (collection)__
```node
{
  0: {
    type: 'console',
    json: false,
    sizeLimit: 512
  },
  1: {
    severityMin: 'crit',
    type: 'syslog'
  }
}
```

### sizeLimit
__type:__ `number`<br />
__default:__ `Infinity` (`512` for Socket & Syslog)

This determines the maximum amount of characters a transporter should allow for a message.<br />
If the maximum is exceeded the transporter will log a corresponding error message.<br />
In case of an exceeded maximum a fallback transporter, if available, will log the full message.

### severityMin
__type:__ `string`<br />
__default:__ `emerg`<br />
__Available severities:__ `emerg` • `alert` • `crit` • `error` • `warn` • `notice` • `info` • `debug`

Defines the minimum severity a transporter will log. `emerg` is the lowest severity while `debug` is the highest.

### severityMax
__type:__ `string`<br />
__default:__ `debug`<br />
__Available severities:__ `emerg` • `alert` • `crit` • `error` • `warn` • `notice` • `info` • `debug`

Defines the maximum severity a transporter will log. `emerg` is the lowest severity while `debug` is the highest.

##### json
__type:__ `boolean`
__default:__ `false`

If enabled will wrap every message as a stringified JSON object.<br />
If you log a non-object it will be wrapped under the key `message`, so "foobar" would become `{"message": "foobar"}`.<br />
Objects (or errors & arrays) will be stringified, so `{err: 'abc', foo: true}` would become `{"err":"abc","foo":true}`

Should only be enabled if you specifically need your messages to be wrapped (e.g. for Kibana)

__Example__
```node
let config = [
 {
   type: 'syslog',
   json: true
 }
];
```

### transporter.jsonTimeout
__type:__ `number`
__default:__ `100`

The maximum amount if time in milliseconds that is allowed to shrink a message into a wrapped json.
Works only if transporter.json is enabled.

__Example__
```node
let config = [
  {
    type: 'console',
    jsonTimeout: 200
  }
];
```

### transporter.jsonDefaultField
__type:__ `String`
__default:__ `message`

The default key any message will be wrapped in if transporter.json is enabled.

__Example__
```node
let config = [
  {
    type: 'console',
    jsonDefaultField: 'msg'
  }
];
```

### transporter.type
__type:__ `string`
__required__

__Available types:__
`console` • `socket` • `syslog`

__Example__
```node
let config = [
  {type: 'socket'}
];
```

#### Console transporter

##### transporter.stream
__type:__ `object`
__default:__ `process.stdout`

Here you can set the stream to write all messages for this transporter to.
Defaults to your node.js console (`process.stdout`) but should support any writable stream (including filestreams to log into a file).

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
Disable this if your stream doesn't support colors.

__Example__
```node
let config = [
 {
   type: 'console',
   colors: false
 }
];
```

#### Socket transporter

##### transporter.method
__type:__ `string`
__required__

Currently only supports `'udp4'`

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

#### Syslog transporter

##### transporter.facility
__type:__ `string`
__default:__ `'user'`

__Available facilities:__
`kern` • `user` • `mail` • `daemon` • `auth` • `syslog` • `lpr` • `news` • `uucp` • `clock` • `sec` • `ftp` • `ntp` • `audit` • `alert` • `clock2` • `local0` • `local1` • `local2` • `local3` • `local4` • `local5` • `local6` • `local7`

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

Will be filtered according to PRINTUSASCII and can only be a maximum of 255 characters.

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
__default:__ `"name"` defined in your `package.json` or `'-'`

Will be filtered according to PRINTUSASCII and can only be a maximum of 48 characters.

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

Will be filtered according to PRINTUSASCII and can only be a maximum of 128 characters.

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

This allows you to set a custom timezone offset from UTC time in hours.
Value must be between -16 to 16 hours.

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

## Singleton
Highlogger needs to be instanced at least once with your desired configuration.
You can access the same instance with Highlogger's singleton functionality.

__Example__
```node
let log = require('highlogger').getInstance();

log.notice('this is a error message');
```

Keep in mind that this will work only if you previously instanced Highlogger at least once.
In rare cases you might not be able to rely on node.js's built-in module caching.
In those cases you either need to inject/pass your instance of Highlogger, use a service locator or create a new instance of Highlogger each time.

## Usage
Highlogger's instances offer logging methods for each supported severity.

__Example__
```node
let logger = new Highlogger();

logger.warn(message0, message1, messageN);
```
At least one `message` parameter is required.

### Debug
You can set debug keys per environment variable `DEBUG`.
Debug keys are set by passing a comma-separated list of keys.

Only keys that are included will show and as a wildcard you can use `*`, which will match anything.
This means `DEBUG=*` would include any key while `DEBUG=foo,bar*` would only include the key `foo` and any key starting with `bar`.

You can also exclude specific keys by prefixing them with a `-` character.
`DEBUG=*,-foobar:*` would include all debug keys except those starting with `foobar:`.

On Windows the environment variable is set using the `set` command:
```bash
set DEBUG=*,-not_this
```

### Available methods

##### emerg(message...)
Accepts multiple parameters of any type and will pass them on with `emerg` severity to transporters.

##### crit(message...)
Accepts multiple parameters of any type and will pass them on with `crit` severity to transporters.

##### error(message...)
Accepts multiple parameters of any type and will pass them on with `error` severity to transporters.

##### warn(message...)
Accepts multiple parameters of any type and will pass them on with `warn` severity to transporters.

##### info(message...)
Accepts multiple parameters of any type and will pass them on with `info` severity to transporters.

##### debug(message...)
Accepts multiple parameters of any type and will pass them on with `debug` severity to transporters.

##### getDebug(debugKey)
Accepts a single parameter `debugKey` which must be a string.
Will return a function and depending on whether or not the passed `debugKey` is currently included in the `DEBUG` environment variable this will either return a `debug`-function or an empty function.
`getDebug(debugKey)()` will work the same as the regular `debug`-function except add the debugKey as e.g. a message prefix (works different depending on the transporter).

__Example__
```node
let logger = new Highlogger();
let debug = logger.getDebug('foobar');

debug('this is a debug message');
```
In the example this message would only be logged if "foobar" is a included debug key.

###### debug(message...)
Accepts multiple parameters of any type and will pass them on with `debug` severity to transporters.

## Tests
Run unit tests:
```bash
$ npm test
```

Check test coverage:
```bash
$ npm run cover
```

## Todo
  * support for external transporter plugins
  * easier file logging transporter (already working by passing a filestream to console transporter)
  * unix-domain support for socket transporter
  * tcp4/6 support for socket transporter
  * udp6 support for socket transporter

## People
The original author of Highlogger is [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License
[MIT](LICENSE)
