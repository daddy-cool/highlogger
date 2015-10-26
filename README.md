```js
let HighLogger = require('highlogger'),
    hl = new HighLogger({debugKeys: {include: ['*']}}),
    debug = hl.getDebug('myDebugPrefix');

hl.error('this is a error message');
debug('this is a debug message');
```

## Installation

```bash
$ npm install highlogger
```

## Features

  * logging to default console/stdout
  * logging to any writable stream
  * logging to vanilla udp4 socket
  * syslog-logging via udp4 socket according to [RFC5424](https://tools.ietf.org/html/rfc5424)
  * debug prefixes, as well as white- and blacklisting of those
  * colors for console/stdout/stream

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

## People

The original author of HighLogger is me, [Metin Kul](https://github.com/daddy-cool)

[List of all contributors](https://github.com/daddy-cool/highlogger/graphs/contributors)

## License

[MIT](LICENSE)