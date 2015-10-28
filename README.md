[![npm](https://img.shields.io/npm/v/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![downloads](https://img.shields.io/npm/dt/highlogger.svg)](https://www.npmjs.com/package/highlogger)
[![Coverage Status](https://coveralls.io/repos/daddy-cool/highlogger/badge.svg?branch=master&service=github)](https://coveralls.io/github/daddy-cool/highlogger?branch=master)

## Installation

```bash
$ npm install highlogger
```

## Quick Start

```node
let HighLogger = require('highlogger');
let logger = new HighLogger();

logger.error('this is a error message');
logger.notice('this is a notice message');
```

This will create a simple logger that logs everything to the default console (process.stdout).

## Features

  * logging to several transporters
    * default console (process.stdout)
    * any writable stream
    * udp4 socket
    * syslog via udp4 socket according to [RFC5424](https://tools.ietf.org/html/rfc5424)
  * debug prefixes, as well as white- and blacklisting depending on the debug prefix
  * colors for console/streams

## Usage

An instance of HighLogger offers the following basic logging methods:

* emerg
* crit
* error
* warn
* notice
* info

## Setup

HighLogger can be used without any configuration but won't offer much besides console.
In order to use certain features - like other transporters - you will have to configure it.

#### Constants

HighLogger exposes several constants, they are available under SEVERITY, TRANSPORTER and FACILITY.
See [available constants and how they can be used](doc/Constants.md) for further information.



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
  * direct file logging (already working by passing a writable filestream)
  * unix-domain socket support
  * tcp4/6 socket support
  * udp6 socket support

## People

The original author of HighLogger is me, [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License

[MIT](LICENSE)