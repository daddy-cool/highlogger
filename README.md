# HighLogger

[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)

## Installation

```bash
$ npm install highlogger
```

## Features

  * logging to several transporters
    * default console (process.stdout)
    * any writable stream
    * udp4 socket
    * syslog via udp4 socket according to [RFC5424](https://tools.ietf.org/html/rfc5424)
  * debug prefixes, as well as white- and blacklisting depending on the debug prefix
  * colors for console/streams

## Documentation

### Setup

HighLogger can be used without any configuration but won't offer much besides console.
In order to use certain features - like other transporters - you will have to configure it.

#### Quick Start

```node
let HighLogger = require('highlogger');
let logger = new HighLogger();

logger.error('this is a error message');
logger.notice('this is a notice message');
```

#### Configuration

HighLogger is a class that needs to be instanced before you can use it and it will accept a object for configuration in the constructor.
```node
let logger = new HighLogger(config);
```

The configuration currently allows the following fields

<table>

  <tr>
    <td>transporters</td>
    <td>array</td>
    <td>an array of transporter configs</td>
    <td>console transporter</td>
  </tr>

  <tr>
      <td>errorHandler</td>
      <td>function</td>
      <td>custom error handling function</td>
      <td>errors are sent to process.stdout</td>
    </tr>

  <tr>
    <td>debugKeys</td>
    <td>object</td>
    <td colspan="2">
      <table>
        <tr>
          <td>include</td>
          <td>array</td>
          <td>an array of strings, * can be used as wildcard</td>
          <td>empty array</td>
        </tr>
        <tr>
          <td>exclude</td>
          <td>array</td>
          <td>an array of strings, * can be used as wildcard</td>
          <td>empty array</td>
        </tr>
      </table
    </td>
  </tr>

</table>

### Available Methods

This will create a simple logger that logs everything to the default console (process.stdout).

An instance of HighLogger offers the following basic logging methods:

* emerg
* crit
* error
* warn
* notice
* info



#### Constants

HighLogger exposes several constants, you can use them for example like this

```node
let HighLogger = require('highlogger');

let config = {transporters: [
  {type: HighLogger.TRANSPORTER.CONSOLE},
  {
    type: HighLogger.TRANSPORTER.SOCKET,
    severity: {
      minimum: HighLogger.SEVERITY.EMERG,
      maximum: HighLogger.SEVERITY.DEBUG
    }
  }
]};

let logger = new HighLogger(config);
```


All available constants that can be used to setup HighLogger

FACILITY | SEVERITY  | TRANSPORTER
-------- | --------- | -----------
KERN     | EMERG     | CONSOLE
USER     | ALERT     | SOCKET
MAIL     | CRIT      | SYSLOG
DAEMON   | ERROR     |
AUTH     | WARN      |
SYSLOG   | NOTICE    |
LPR      | INFO      |
NEWS     | DEBUG     |
UUCP     |           |
CLOCK    |           |
SEC      |           |
FTP      |           |
NTP      |           |
AUDIT    |           |
ALERT    |           |
CLOCK2   |           |
LOCAL0   |           |
LOCAL1   |           |
LOCAL2   |           |
LOCAL3   |           |
LOCAL4   |           |
LOCAL5   |           |
LOCAL6   |           |
LOCAL7   |           |


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