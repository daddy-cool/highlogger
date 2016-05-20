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
  * S3 bucket
* debug environment variable
  * white- and blacklisting for debug messages based on their debug key
* can be used as singleton
* configurable maximum message length per transporter
* support for a fallback transporter in case maximum message length was exceeded
* supports loading config via [config](https://www.npmjs.com/package/config) module if present
* adds a context to each message
  * default context is the filename of the log-method caller
  * custom context can also be set

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

If you have the [config](https://www.npmjs.com/package/config) module installed your config will also be attempted to be read from the key `highlogger`

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
__type:__ array

The configuration array has to be an array (or collection) of transporter configurations.<br/>
Configuration is always on a per-transporter basis.

__Example__
```node
[
  {type: 'console'},
  {type: 'syslog'}
]
```

### Common Transporter Configuration

__Config fields supported by every transporter:__

field       | type
----------- | ---------
type        | string
sizeLimit   | number
severityMin | string
severityMax | string
json        | boolean
fallback    | object

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

#### type
__type:__ string<br />
__required__<br />
__Available types:__ `console` • `socket` • `syslog`

Defines the type of a transporter.

#### sizeLimit
__type:__ number<br />
__default:__ `Infinity`

This determines the maximum amount of characters a transporter should allow for a message.<br />
If the maximum is exceeded the transporter will log a corresponding error message.<br />
In case of an exceeded maximum a fallback transporter, if available, will log the full message.

#### severityMin
__type:__ string<br />
__default:__ `emerg`<br />
__Available severities:__ `emerg` • `alert` • `crit` • `error` • `warn` • `notice` • `info` • `debug`

Defines the minimum severity a transporter will log.<br />
`emerg` is the lowest severity while `debug` is the highest.

#### severityMax
__type:__ string<br />
__default:__ `debug`<br />
__Available severities:__ `emerg` • `alert` • `crit` • `error` • `warn` • `notice` • `info` • `debug`

Defines the maximum severity a transporter will log.<br />
`emerg` is the lowest severity while `debug` is the highest.

#### json
__type:__ boolean<br />
__default:__ `false`

If enabled will wrap every message as a stringified JSON object.<br />

Non-objects will be wrapped under a `message`-key:<br />
`"foobar"` would become `{"message":"foobar"}`.<br />

Objects (or errors & arrays) will be stringified:<br />
`{err: 'or', foo: 'bar'}` would become `{"err":"or","foo":"bar"}`

#### fallback
__type:__ object<br />

This is an optional field that, if set, expects another transporter configuration.<br >
The configured "fallback transporter" will be used when the original transporter can not log a message.<br />
Currently the fallback would only be used when a message exceeds the  original transporters sizeLimit.

__Example__
```node
[
  {
    type: 'syslog',
    sizeLimit: 100,
    fallback: {
      type: 'console'
    }
  }
]
```

### Console Transporter Configuration

#### colors
__type:__ boolean<br />
__default:__ tries to determine if the console supports colors

Decides whether or not messages for this transporter will be colored.

### Socket Transporter Configuration

#### method
__type:__ string<br />
__required__

Currently only supports `udp4`

#### address
__type:__ string<br />
__required__

The target IP (like `127.0.0.1` or `localhost`).

#### port
__type:__ number
__required__

The target port.

#### sizeLimit
__type:__ number<br />
__default:__ `512`

Default of `512` for socket transporters to avoid problems with udp.

### Syslog Transporter Configuration

#### facility
__type:__ string<br />
__default:__ `user`<br />
__Available facilities:__<br />
`kern` • `user` • `mail` • `daemon` • `auth` • `syslog` • `lpr` • `news` • `uucp` • `clock` • `sec` • `ftp` • `ntp` • `audit` • `alert` • `clock2` • `local0` • `local1` • `local2` • `local3` • `local4` • `local5` • `local6` • `local7`

#### hostname
__type:__ string<br />
__default:__ tries to determine local hostname

Will be filtered to PRINTUSASCII and a maximum of 255 characters.

#### appName
__type:__ string<br/>
__default:__ value of `name` set in your `package.json`

Will be filtered to PRINTUSASCII and a maximum of 48 characters.

#### processId
__type:__ string<br />
__default:__ `process.pid`

Will be filtered to PRINTUSASCII and a maximum of 128 characters.

#### timezoneOffset
__type:__ number<br />
__default:__ attempts to determine your systems offset from UTC time

Allows you to set a custom timezone offset from UTC time in hours.<br />
Value must be between -16 to 16 hours.

#### method
__type:__ string<br />
__default:__ `udp4`

Currently only supports `udp4`

#### address
__type:__ string<br />
__default:__ `127.0.0.1`

The target IP (like `127.0.0.1` or `localhost`).

#### port
__type:__ number<br />
__default:__ `514`

The target port.

#### sizeLimit
__type:__ number<br />
__default:__ `512`

Default of `512` for syslog transporters to avoid problems with udp.<br />
Keep in mind that the syslog message prefix will also count into this size limit.

### S3 Transporter Configuration

#### accessKeyId
__type:__ string<br />
__required__

#### secretAccessKey
__type:__ string<br />
__required__

#### bucket
__type:__ string<br />
__required__

#### region
__type:__ string<br />
__required__

#### sessionToken
__type:__ string

#### acl
__type:__ string<br />
__default:__ set by the AWS-SDK

Determines what priviliges are required to read the uploaded files.

#### maxRetries
__type:__ number<br />
__default:__ set by the AWS-SDK

#### ssl
__type:__ boolean<br />
__default:__ set by the AWS-SDK

#### fallbackPrefix
__type:__ string

## Singleton
Highlogger needs to be instanced at least once with your desired configuration.<br />
You can then access the same instance with Highlogger's singleton functionality.

__Example__
```node
let Highlogger = require('highlogger');
new Highlogger();
let log = Highlogger.getInstance();

log.notice('this is a error message');
```

## Usage
Highlogger instances offer logging methods for each supported severity,<br />
as well as 'getter' methods that allows you to overwrite the message context.

__Example__
```node
let logger = new Highlogger();

logger.warn(message0, message1, messageN);
```
At least one `message` parameter is required.

## Debug
You can set debug contexts per environment variable `DEBUG` by passing a comma-separated list of contexts.<br />
`*` as wildcard is supported

Messages with debug severity will be omitted unless a matching context environment was set.<br />
To see all debug messages you can set `DEBUG=*`

You can also exclude specific contexts by prefixing them with a `-`.<br />
`DEBUG=*,-foo*` would include all contexts except those starting with 'foo'.

## Available methods

Highlogger instances expose several methods.

Direct logging methods are:<br />
`emerg()` • `alert()` • `crit()` • `error()` • `warn()` • `notice()` • `info()` • `debug()`

Each of those methods accepts one parameter of any type.<br />
This parameter will be sent to all transporters with a matching severity range.

The filename of the caller of any of these methods will be added as context.<br />
This means if you try to log 'foobar' like `log.notice('foobar');` from a file "filename.js":
  * `json` disabled, context will just be prepended: `filename.js foobar`
  * `json` enabled, context will be added as a key: `{"message":"foobar","context":"filename.js"}`


`debug()` logs will be omitted unless their context matches the `DEBUG` environment.

__Example__
```node
let Highlogger = require('highlogger');
let log = new Highlogger();

log.emerg("emergency message");
log.alert("alert message");
log.crit("critical message");
log.error("error message");
log.warn("warning message");
log.notice("notice message");
log.info("information message");
log.debug("debug message");
```

Sometimes it might be useful to set a custom context.<br />
You can use these methods to get log methods with your custom context:<br />
`getEmerg()` • `getAlert()` • `getCrit()` • `getError()` • `getWarn()` • `getNotice()` • `getInfo()` • `getDebug()`

__Example__
```node
let Highlogger = require('highlogger');
let log = new Highlogger();
let myAlert = log.getEmerg('customContext');

myAlert("foobar");
```

Depending on the transporters `json` setting, this would either log<br />
`customContext foobar` or `{"message":"foobar","context":"customContext"}`

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
  * add file transporter
  * support for external transporter plugins
  * unix-domain support for socket transporter
  * tcp4/6 support for socket transporter
  * udp6 support for socket transporter

## People
The original author of Highlogger is [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License
[MIT](LICENSE)
