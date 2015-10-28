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
As mentioned above, HighLogger needs to be instanced at least once before you can use it and it will accept an object as parameter.

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

__Example__
```node
let HighLogger = require('highlogger');

let config = {transporters: [
  {
    type: HighLogger.TRANSPORTER.CONSOLE
  },
  {
    type: HighLogger.TRANSPORTER.SYSLOG,
    severity: {
      minimum: HighLogger.SEVERITY.EMERG,
      maximum: HighLogger.SEVERITY.DEBUG
    },
    facility: HighLogger.FACILITY.USER
  }
]};

let logger = new HighLogger(config);
```


### transporters
__type:__ `array`

`transporters` is an array of transporter configs.
The default is a single console transporter.

__Example__
```node
{
  transporters: [
    {type: HighLogger.TRANSPORTER.CONSOLE}
  ]
}
```


#### transporter configuration
__type:__ `object`

The transporter config is different for each transporter type.
These fields are supported by every transporter type:

  * `type`
  * `severity`

Support for other fields depends on the transporter type.


### transporter.severity
__type:__ `object`

`severity` should be an object containing the severity range this transporter should react on, defined by a minimum and maximum.

__Example__
```node
{
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE,
      severity: {
        minimum: HighLogger.SEVERITY.EMERG,
        maximum: HighLogger.SEVERITY.DEBUG
      }
    }
  ]
}
```


###### Severity Constants

* `HighLogger.SEVERITY.EMERG`
* `HighLogger.SEVERITY.ALERT`
* `HighLogger.SEVERITY.CRIT`
* `HighLogger.SEVERITY.ERROR`
* `HighLogger.SEVERITY.WARN`
* `HighLogger.SEVERITY.NOTICE`
* `HighLogger.SEVERITY.INFO`
* `HighLogger.SEVERITY.DEBUG`


#### transporter.severity.minimum
__type:__ `number`

Severity ranges from `HighLogger.SEVERITY.EMERG` to `HighLogger.SEVERITY.DEBUG`, or 0 to 7.
Lower means a higher priority, so `HighLogger.SEVERITY.EMERG` is the lowest severity while `HighLogger.SEVERITY.DEBUG` is the highest.
A transporter will not log any message with a severity lower than his minimum severity.

__Example__
```node
{
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE,
      severity: {
        minimum: HighLogger.SEVERITY.INFO
      }
    }
  ]
}
```



#### transporter.severity.maximum
__type:__ `number`

Severity ranges from `HighLogger.SEVERITY.EMERG` to `HighLogger.SEVERITY.DEBUG`, or 0 to 7.
A transporter will not log any message with a severity higher than his maximum severity.

__Example__
```node
{
  transporters: [
    {
      type: HighLogger.TRANSPORTER.CONSOLE,
      severity: {
        maximum: HighLogger.SEVERITY.INFO
      }
    }
  ]
}
```

### transporter.type
__type:__ `number`
__required__

__Example__
```node
  transporters: [{
    type: HighLogger.TRANSPORTER.CONSOLE
  }]
```


###### Transporter Type Constants

* `HighLogger.TRANSPORTER.CONSOLE`
* `HighLogger.TRANSPORTER.SOCKET`
* `HighLogger.TRANSPORTER.SYSLOG`


#### transporter.type: HighLogger.TRANSPORTER.CONSOLE
_todo_


#### transporter.type: HighLogger.TRANSPORTER.SOCKET
_todo_


#### transporter.type: HighLogger.TRANSPORTER.SYSLOG
_todo_


## Singleton

HighLogger needs to be instanced at least once before usage, this means that you will have to pass it your desired configuration.
If you don't want to create a new instance of HighLogger each time you will need to access the same instance you previously created.
In most cases it will be enough to access HighLogger's built-in singleton functionality

```node
let logger = require('highlogger').getInstance();

logger.notice('this is a error message');
```

This will only work if you previously instanced HighLogger at least once.
In rare cases you might not be able to rely on node.js's built-in module caching, then you either need to inject/pass your instance of HighLogger to any place you're using it or use a service locator.

## Usage

An instance of HighLogger offers these logging methods

* `emerg`
* `crit`
* `error`
* `warn`
* `notice`
* `info`

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

To run test coverage, first install the dependencies, then run `npm run cover`:

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