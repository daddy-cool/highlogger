'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    osHostname = require('os').hostname(),
    path = require('path');

const CONSTANTS = require('../constants');
const NIL = '-';
const SPACE = ' ';
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
  if (typeof str === CONSTANTS.TYPE_OF.NUMBER || typeof str === CONSTANTS.TYPE_OF.BOOLEAN) {
    str = EMPTY + str;
  }

  if (typeof str === CONSTANTS.TYPE_OF.STRING && str.length > 0) {
    let strArray = str.match(FILTER_PRINT_US_ASCII);
    if (strArray && strArray.length) {
      return strArray.join(EMPTY).substring(0, maxLength);
    }
  }

  return NIL;
}

/**
 * @namespace Transporters
 */
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
    if (typeof config.address !== CONSTANTS.TYPE_OF.STRING) {
      config.address = '127.0.0.1';
    }

    if (typeof config.port !== CONSTANTS.TYPE_OF.NUMBER) {
      config.port = 514;
    }

    config.method = 'udp4';
    let syslogJson = config.json;
    config.json = false;
    super(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setProcessId(config.processId)
        .setTimezoneOffset(config.timezoneOffset)
        .setSyslogJson(syslogJson);
  }

  /**
   * @param {boolean} json
   * @returns {Syslog}
   */
  setSyslogJson (json) {
    this.syslogJson = (typeof json === CONSTANTS.TYPE_OF.BOOLEAN) ? json : false;

    return this;
  }

  /**
   * @param {number} [facility]
   * @returns {Syslog}
   */
  setFacility (facility) {
    this.facility = 8 * (typeof FACILITY[facility] === CONSTANTS.TYPE_OF.NUMBER ? FACILITY[facility] : FACILITY.user);

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
    if (typeof timezoneOffset !== CONSTANTS.TYPE_OF.NUMBER || timezoneOffset < -16 || timezoneOffset > 16) {
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

  /**
   * @param {*} msg
   * @param {Object} options
   * @param {Function} callback
   */
  write (msg, options, callback) {
    let msgId = NIL,
        msgPrefix;

    if (
      options.severity === CONSTANTS.SEVERITY.debug &&
      typeof options.debugKey === CONSTANTS.CONSTANTS.TYPE_OF.STRING
    ) {
      msgId = this.filterMessageId(options.debugKey);
    }

    msgPrefix = PRI_START + (this.facility + options.severity) + PRI_END + VERSION + SPACE
    + moment().utcOffset(this.timezoneOffset).format(DATE_FORMAT) + SPACE + this.hostname + SPACE + this.appName
    + SPACE + this.processId + SPACE + msgId + SPACE + NIL + SPACE;

    super.write(
      msgPrefix + this.stringify.stringify(msg, this.syslogJson, this.maxMessageSize -  msgPrefix.length),
      {},
      callback
    );
  }
}

module.exports = Syslog;