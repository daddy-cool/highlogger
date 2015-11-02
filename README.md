# HighLogger
[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)

## Installation
```bash
$ npm install highlogger
```


## Features

  * logging to multiple transporters at once
  * available transporters
    * default console (`process.stdout`)
    * any writable stream
    * udp4 socket
    * syslog via udp4 socket according to [RFC5424](https://tools.ietf.org/html/rfc5424)
  * set different severities per transporter, transporter will only log messages within their severity range
  * debug prefixes/key, as well as white- and blacklisting depending on the debug prefix/key
  * colors for console/streams
  * optional singleton use to retain configuration across files


## Quick Start
```node
let HighLogger = require('highlogger');
let logger = new HighLogger();

logger.error('this is a error message');
logger.notice('this is a notice message');
```

HighLogger can be used without any configuration but won't offer much besides the node.js console.
In order to use most features - like other transporters - you will have to configure it.


## Setup
As mentioned above, HighLogger needs to be instanced at least once, before you can use it. It will accept an object as parameter.

```node
let logger = new HighLogger(config);
```

__Default Configuration__
```node
let config = {
  transporters: [{
    type: HighLogger.TRANSPORTER.CONSOLE
  }],
  errorHandler: function (err) {
    if (err) {
      console.error(err);
    }
  },
  debugKeys: {
    include: [],
    exclude: []
  }
};
```

Per default HighLogger will just log to node.js console (`process.stdout`) and won't showing any debug messages, you can overwrite any of these fields simply by passing the matching attribute in the constructor.


### Constants
HighLogger exposes several constants for configuration purposes

__Example__
```node
let config = {
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE
    }
  ]
};
```


## Configuration
__type:__ `object`


### errorHandler
__type:__ `function`

For `errorHandler` you can pass any function that should be called in case a transporter throws an error.
The default will just log to node.js console (`process.stdout`).


### debugKeys
__type:__ `object`

`debugKeys` should be an object containing two fields: `include` and `exclude`.
Both must be an `array` of strings.

Strings in `include` will set the whitelist for debug messages that should be logged.
Strings in `exclude` will set the blacklist for debug messages that won't be logged.

`*` on it's own will match any string but can also be used as a wildcard at the beginning, in the middle and/or at the end of a string.
So `foo*bar` would match any string that starts with `foo` and ends with `bar`.

An `exclude` will overwrite an `include`.

__Example__
```node
let config = {
  debugKeys: {
    include: ['foo*'],
    exclude: ['foobar']
  }
};
```

In this example, any debug message, whose debugKey starts with `foo`, will be logged, except `foobar`.


### transporters
__type:__ `array`

`transporters` is an array of transporter configs.
The default is a single console transporter.

__Example__
```node
let config = {
  transporters: [
    {type: HighLogger.TRANSPORTER.CONSOLE}
  ]
};
```


#### transporter configuration
__type:__ `object`

The transporter config is different for each transporter type.
These fields are supported by every transporter:

  * `type`
  * `severity`

Support for other fields depends on the transporter type.


### transporter.severity
__type:__ `object`

`severity` should be an object containing two fields: `minimum` and `maximum`.
This sets the severity range this transporter should react on.

Both fields are optional, but if present they must be a `number` or constant.

Constants are:

* `HighLogger.SEVERITY.EMERG`
* `HighLogger.SEVERITY.ALERT`
* `HighLogger.SEVERITY.CRIT`
* `HighLogger.SEVERITY.ERROR`
* `HighLogger.SEVERITY.WARN`
* `HighLogger.SEVERITY.NOTICE`
* `HighLogger.SEVERITY.INFO`
* `HighLogger.SEVERITY.DEBUG`

A lower numbers means a higher priority, so `EMERG` is the lowest severity while `DEBUG` is the highest.

__Example__
```node
let config = {
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE,
      severity: {
        minimum: HighLogger.SEVERITY.ERROR,
        maximum: HighLogger.SEVERITY.DEBUG
      }
    }
  ]
};
```

In this example, any message lower than `NOTICE`, won't be sent to this transporter, meaning `EMERG`, `ALERT` and `CRIT` will be ignored.


### transporter.type
__type:__ `number`

__required__

With `type` you can decide what kind of transporter you are setting up.
This field is required and must either be a `number`or constant.

Constants are:

* `HighLogger.TRANSPORTER.CONSOLE`
* `HighLogger.TRANSPORTER.SOCKET`
* `HighLogger.TRANSPORTER.SYSLOG`

__Example__
```node
let config = {
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE
    }
  ]
}
```


#### transporter.type: HighLogger.TRANSPORTER.CONSOLE
_todo_


#### transporter.type: HighLogger.TRANSPORTER.SOCKET
_todo_


#### transporter.type: HighLogger.TRANSPORTER.SYSLOG
_todo_

## Singleton

HighLogger needs to be instanced at least once before usage, what means that you will have to pass your desired configuration to it.
If you don't want to create a new instance of HighLogger each time, you have to access the already created instance.
In most cases, it should be enough to access HighLogger's built-in singleton functionality

```node
let logger = require('highlogger').getInstance();

logger.notice('this is a error message');
```

This will work only if you previously instanced HighLogger at least once.
In rare cases, you might not be able to rely on node.js's built-in module caching, then you either need to inject/pass your instance of HighLogger to any place you're going to use it or use a service locator.

## Usage
_todo_

An instance of HighLogger offers these logging methods

* `emerg`
* `crit`
* `error`
* `warn`
* `notice`
* `info`

## Tests

To run the test suite, install the dependencies first, then run `npm test`:

```bash
$ npm install
$ npm test
```

To run test coverage run `npm run cover`, after installing the dependencies:

```bash
$ npm install
$ npm run cover
```

## Todo

  * expand readme
  * message limit (per transporter)
  * support for third-party transporters
  * direct file logging transporter (already working by passing a filestream to console transporter)
  * unix-domain socket transporter
  * tcp4/6 support for socket transporter
  * udp6 support for socket transporter

## People

The original author of HighLogger is me, [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License

[MIT](LICENSE)
