## Available Constants

These are all available constants that can be used to setup HighLogger:

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

## Usage Example

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