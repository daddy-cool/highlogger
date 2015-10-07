'use strict';

module.exports = {
  SEVERITY: {
    EMERGENCY: 0, // system is unusable
    ALERT: 1, // action must be taken immediately
    CRITICAL: 2, // critical conditions
    ERROR: 3, // error conditions
    WARNING: 4, // warning conditions
    NOTICE: 5, // normal but significant condition
    INFO: 6, // informational messages
    DEBUG: 7 // debug-level messages
  },
  FACILITY: {
    KERN: 0, // kernel
    USER: 1, // user-level
    MAIL: 2, // mail system
    DAEMON: 3, // system daemons
    AUTH: 4, // security/authorization
    SYSLOG: 5, // generated internally by syslogd
    LPR: 6, // line printer subsystem
    NEWS: 7, // network news subsystem
    UUCP: 8, // UUCP subsystem
    CLOCK: 9, // clock daemon
    SEC: 10, // security/authorization
    FTP: 11, // FTP daemon
    NTP: 12, // NTP subsystem
    AUDIT: 13, // log audit
    ALERT: 14, // log alert
    CLOCK2: 15, // clock daemon
    LOCAL0: 16, // local use 0
    LOCAL1: 17, // local use 1
    LOCAL2: 18, // local use 2
    LOCAL3: 19, // local use 3
    LOCAL4: 20, // local use 4
    LOCAL5: 21, // local use 5
    LOCAL6: 22, // local use 6
    LOCAL7: 23 // local use 7
  },
  TRANSPORTER: {
    CONSOLE: 0,
    SOCKET: 1,
    SYSLOG: 2
  }
};
