'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    Stringify = require('../helpers/stringify'),
    osHostname = require('os').hostname(),
    path = require('path');

const SPACE = ' ';
const NIL = '-';
const PRI_START = '<';
const PRI_END = '>';
const VERSION = '1';
const EMPTY = '';
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
const FACILITY = {
  kern: 0, // kernel
  user: 1, // user-level
  mail: 2, // mail system
  daemon: 3, // system daemons
  auth: 4, // security/authorization
  syslog: 5, // generated internally by syslogd
  lpr: 6, // line printer subsystem
  news: 7, // network news subsystem
  uucp: 8, // UUCP subsystem
  clock: 9, // clock daemon
  sec: 10, // security/authorization
  ftp: 11, // FTP daemon
  ntp: 12, // NTP subsystem
  audit: 13, // log audit
  alert: 14, // log alert
  clock2: 15, // clock daemon
  local0: 16, // local use 0
  local1: 17, // local use 1
  local2: 18, // local use 2
  local3: 19, // local use 3
  local4: 20, // local use 4
  local5: 21, // local use 5
  local6: 22, // local use 6
  local7: 23 // local use 7
};

const FILTER_PRINT_US_ASCII = /([\x21-\x7e])+/g;

/**
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function filterPrintUsASCII (str, maxLength) {
  if (typeof str === constants.TYPE_OF.NUMBER || typeof str === constants.TYPE_OF.BOOLEAN) {
    str = EMPTY + str;
  }

  if (typeof str === constants.TYPE_OF.STRING && str.length > 0) {
    let strArray = str.match(FILTER_PRINT_US_ASCII);
    if (strArray && strArray.length) {
      return strArray.join(EMPTY).substring(0, maxLength);
    }
  }

  return NIL;
}

class Syslog extends Socket {

  /**
   * @param {Object} config
   * @param {boolean} [config.json]
   * @param {string} [config.address]
   * @param {number} [config.port]
   * @param {string} [config.method]
   * @param {number} [config.facility]
   * @param {string} [config.hostname]
   * @param {string} [config.appName]
   * @param {string} [config.processId]
   * @param {number} [config.timezoneOffset]
   * @param {string} [config.dateFormat]
   */
  constructor (config) {
    if (typeof config.address !== constants.TYPE_OF.STRING) {
      config.address = '127.0.0.1';
    }

    if (typeof config.port !== constants.TYPE_OF.NUMBER) {
      config.port = 514;
    }

    if (typeof config.method !== constants.TYPE_OF.STRING) {
      config.method = 'udp4';
    }

    let json = typeof config.json === constants.TYPE_OF.BOOLEAN ? config.json : false;
    config.json = false;
    super(config);
    config.json = json;
    this.stringifySyslog = new Stringify(config);

    this.validate(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setProcessId(config.processId)
        .setTimezoneOffset(config.timezoneOffset);
  }

  /**
   * @param {number} [facility]
   * @returns {Syslog}
   */
  setFacility (facility) {
    this.facility = 8 * (typeof FACILITY[facility] === constants.TYPE_OF.NUMBER ? FACILITY[facility] : FACILITY.user);

    return this;
  }

  /**
   * @param {string} [hostname]
   * @returns {Syslog}
   */
  setHostname (hostname) {
    this.hostname = filterPrintUsASCII(hostname || osHostname, 255);

    return this;
  }

  /**
   * @param {string} [appName]
   * @returns {Syslog}
   */
  setAppName (appName) {
    let appDir = path.dirname(require.main.filename),
        packageJson = path.join(appDir, 'package.json'),
        defaultName;

    try {
      defaultName = require(packageJson).name.split('/').pop();
    } catch (err) {
      defaultName = NIL;
    }

    this.appName = filterPrintUsASCII(appName || defaultName, 48);

    return this;
  }

  /**
   * @param {string} [processId]
   * @returns {Syslog}
   */
  setProcessId (processId) {
    this.processId = filterPrintUsASCII(processId || process.pid, 128);

    return this;
  }

  /**
   * @param {number} [timezoneOffset]
   * @returns {Syslog}
   */
  setTimezoneOffset (timezoneOffset) {
    if (typeof timezoneOffset !== constants.TYPE_OF.NUMBER || timezoneOffset < -16 || timezoneOffset > 16) {
      //noinspection JSUnresolvedFunction
      this.timezoneOffset = moment().utcOffset();
      return this;
    }

    this.timezoneOffset = timezoneOffset;

    return this;
  }

  /**
   * @param {string} [messageId]
   * @returns {string}
   */
  filterMessageId (messageId) {
    return filterPrintUsASCII(messageId, 32);
  }

  getPriority (severity) {
    return PRI_START + (this.facility + severity) + PRI_END;
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   * @param {Function} callback
   */
  write (messages, severity, context, callback) {
    //noinspection JSUnresolvedFunction
    let self = this,
        syslogPrefixes = [
          this.getPriority(severity) + VERSION,
          moment().utcOffset(this.timezoneOffset).format(DATE_FORMAT),
          this.hostname,
          this.appName,
          this.processId,
          this.filterMessageId(context),
          NIL
        ].join(SPACE);

    self.stringifySyslog.stringify(EMPTY, messages, function syslogStringify (message) {
      if ((syslogPrefixes + SPACE + message).length <= self.sizeLimit) {
        return self.socketLog(syslogPrefixes + SPACE + message, callback);
      }

      let fallbackMessages = [error.transporter.exceededSizeLimit(self.sizeLimit)];
      if (!self.fallback) {
        return self.fallbackSyslog(syslogPrefixes, fallbackMessages, callback);
      }

      self.fallback.write(messages, severity, context, function writeCb (e, fallbackMessage) {
        if (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED) {
          fallbackMessages.push(fallbackMessage);
        }
        self.fallbackSyslog(syslogPrefixes, fallbackMessages, callback);
      });
    });
  }

  fallbackSyslog (syslogPrefixes, payload, callback) {
    let self = this;

    this.stringifySyslog.stringify(
      EMPTY,
      payload,
      function syslogStringifyFallback (message) {
        self.socketLog(syslogPrefixes + SPACE + message, callback);
      }
    );
  }

  /**
   * @param {object} config
   */
  validate (config) {

  }
}

module.exports = Syslog;