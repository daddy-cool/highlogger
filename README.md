# highlogger
[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)


## Installation
```bash
$ npm install highlogger
```


## Features

  * logging to multiple transporters at once
  * multiple transporters
    * console, accepts any writable stream but will default to `process.stdout`
    * unix-dgram socket, supporting udp4 for now
    * syslog, with complete support for [RFC5424](https://tools.ietf.org/html/rfc5424) (logs only via udp4 for now)
  * set different severity ranges per transporter, transporter will only log messages within their severity range
  * debug prefixes/keys
    * white- and blacklisting for debug messages based on their prefix/key
  * colors for console/streams
  * optional singleton use to retain configuration across a whole project


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
It will accept an object as parameter for configuration.

```node
let logger = new Highlogger(config);
```

__Default Configuration__
```node
let config = {
  transporters: [{
    type: Highlogger.TRANSPORTER.CONSOLE
  }],
  errorHandler: function (err) {
    if (err) {
      console.log(err);
    }
  },
  debugKeys: {
    include: [],
    exclude: []
  }
};
```

Per default Highlogger will just log to console (`process.stdout`), won't show any debug messages and will log any errors to console (`process.stdout`) as well.
You can overwrite any of these fields simply by passing the matching attribute in the config object.


### Constants
Highlogger exposes several constants for configuration purposes

__Example__
```node
let config = {
  transporters: [
    {
      type: Highlogger.TRANSPORTER.CONSOLE
    }
  ]
};
```


## Configuration
__type:__ `object`

The configuration object accepts the following attributes

attribute      | type
-------------- | ----------
`errorHandler` | `function`
`debugKeys`    | `object`
`transporters` | `array`


### errorHandler
__type:__ `function`

For `errorHandler` you can pass a function that should be called in case a transporter throws an error.
The default will just log to console (`process.stdout`).


### debugKeys
__type:__ `object`

`debugKeys` is expected to be an object that can two fields: `include` and `exclude`.
Both, if present, must be an `array` of strings.

`include` sets the whitelist for debug messages that should be logged, based on the messages debug key/prefix.
`exclude` sets the blacklist for debug messages that should'nt be logged, also based on the messages debug key/prefix.

An `exclude` will overwrite an `include`.

Both will accept `*` as a wildcard that matches any string. It can be used at the beginning, in the middle and/or at the end of a string.
So for example `foo*bar` would match any string that starts with `foo` and ends with `bar`.

__Example__
```node
let config = {
  debugKeys: {
    include: ['foo*'],
    exclude: ['foobar']
  }
};
```

In this example any debug message, whose debugKey starts with `foo`, will be logged - except `foobar`.


### transporters
__type:__ `array`

`transporters` is expected to be an array of transporter configurations.
The default is a single console transporter.

__Example__
```node
let config = {
  transporters: [
    {type: Highlogger.TRANSPORTER.CONSOLE},
    {type: Highlogger.TRANSPORTER.SOCKET}
  ]
};
```


#### transporter configuration
__type:__ `object`

The transporter config is different for each transporter type.
These attributes are supported by every transporter:

attribute  | type
---------- | ---------
`severity` | `object`
`json`     | `boolean`
`type`     | `number`

Other attributes are supported depending on the transporter type.


### transporter.severity
__type:__ `object`
__default:__
```node
  {
    minimum: Highlogger.SEVERITY.EMERG,
    maximum: Highlogger.SEVERITY.DEBUG
  }
```

`severity` is expected to be an object that can two fields: `minimum` and `maximum`.
These set the severity range this transporter should react on.

Both fields are optional and if one is passed it must either be a `number` or constant.
Per default transporters react to any severity.

Available constants are:

* `Highlogger.SEVERITY.EMERG`
* `Highlogger.SEVERITY.ALERT`
* `Highlogger.SEVERITY.CRIT`
* `Highlogger.SEVERITY.ERROR`
* `Highlogger.SEVERITY.WARN`
* `Highlogger.SEVERITY.NOTICE`
* `Highlogger.SEVERITY.INFO`
* `Highlogger.SEVERITY.DEBUG`

A lower severity means a higher priority, so `EMERG` is the lowest severity while `DEBUG` is the highest.

__Example__
```node
let config = {
  transporters: [
    {
      type: Highlogger.TRANSPORTER.CONSOLE,
      severity: {
        minimum: Highlogger.SEVERITY.ERROR,
        maximum: Highlogger.SEVERITY.DEBUG
      }
    }
  ]
};
```

In this example any message lower than `ERROR` wouldn't be sent to this transporter, which means `EMERG`, `ALERT` and `CRIT` would be ignored.


### transporter.json
__type:__ `boolean`
__default:__ `false`

This flag determines whether or not the transporter should always log messages as stringified JSON objects.
This doesn't change the behavior when logging objects, those become stringified JSON objects anyway.

What this does is, it will wrap any non-object as a value in a simple object.

__Example transporter.json=true__
`"foobar"` would become `{"message": "foobar"}`

This should only be enabled for transporters if you specifically need stringified JSON _objects_.
(e.g. Kibana pattern)


### transporter.type
__type:__ `number`
__required__

With `type` you can decide what kind of transporter you are setting up.
This field is required and must either be a `number` or constant.

Available constants are:

* `Highlogger.TRANSPORTER.CONSOLE`
* `Highlogger.TRANSPORTER.SOCKET`
* `Highlogger.TRANSPORTER.SYSLOG`

__Example__
```node
let config = {
  transporters: [
    {
      type: Highlogger.TRANSPORTER.CONSOLE
    }
  ]
}
```


#### transporter.type: Highlogger.TRANSPORTER.CONSOLE
_todo_


#### transporter.type: Highlogger.TRANSPORTER.SOCKET
_todo_


#### transporter.type: Highlogger.TRANSPORTER.SYSLOG
_todo_

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
_todo_

An instance of Highlogger offers these logging methods

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

To check test coverage run `npm run cover`, after installing the dependencies:

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

The original author of Highlogger is me, [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License

[MIT](LICENSE)