'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
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

/**
 * @class Syslog
 * @extends Socket
 */
class Syslog extends Socket {

  /**
   * @param {Object} config
   */
  constructor (config) {
    super(config);

    this.setFacility(config)
        .setHostname(config)
        .setAppName(config)
        .setProcessId(config)
        .setTimezoneOffset(config)
        .setSyslogSizeLimit();
  }

  /**
   * @param {Object} config
   * @param {String} config.address
   * @returns {Syslog}
   */
  setAddress (config) {
    if (!config.hasOwnProperty('address')) {
      config.address = '127.0.0.1';
    }
    super.setAddress(config);

    return this;
  }

  /**
   * @param {Object} config
   * @param {Number} config.port
   * @returns {Syslog}
   */
  setPort (config) {
    if (!config.hasOwnProperty('port')) {
      config.port = 514;
    }
    super.setPort(config);

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} config.method
   * @returns {Syslog}
   */
  initSocket (config) {
    if (!config.hasOwnProperty('method')) {
      config.method = 'udp4';
    }
    super.initSocket(config);

    return this;
  }

  /**
   * @returns {Syslog}
   */
  setSyslogSizeLimit () {
    this.sizeLimit -= this.getSyslogPrefix(constants.SEVERITY.debug).length;

    return this;
  }

  /**
   * @param {Object} config
   * @param {Number} [config.facility]
   * @returns {Syslog}
   */
  setFacility (config) {
    let facility = FACILITY.user;

    if (config.hasOwnProperty('facility')) {
      if (typeof FACILITY[config.facility] !== constants.TYPE_OF.NUMBER) {
        throw new Error(error.config.invalidValue('facility'));
      }
      facility = FACILITY[config.facility];
    }

    this.facility = 8 * facility;

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} [config.hostname]
   * @returns {Syslog}
   */
  setHostname (config) {
    let hostname = osHostname;

    if (config.hasOwnProperty('hostname')) {
      if (typeof config.hostname !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('hostname'));
      }
      hostname = config.hostname;
    }

    this.hostname = filterPrintUsASCII(hostname, 255);

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} [config.appName]
   * @returns {Syslog}
   */
  setAppName (config) {
    let appName = NIL;

    if (config.hasOwnProperty('appName')) {
      if (typeof config.appName !== constants.TYPE_OF.STRING) {
        throw new Error(error.config.invalidValue('appName'));
      }
      appName = config.appName;
    } else {
      let appDir = path.dirname(require.main.filename),
          packageJson = path.join(appDir, 'package.json');

      try {
        appName = require(packageJson).name.split('/').pop();
      } catch (e) {
        //do nothing
      }
    }

    this.appName = filterPrintUsASCII(appName, 48);

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} [config.processId]
   * @returns {Syslog}
   */
  setProcessId (config) {
    let processId = process.pid;

    if (config.hasOwnProperty('processId')) {
      if (typeof config.processId !== constants.TYPE_OF.STRING && typeof config.processId !== constants.TYPE_OF.NUMBER) {
        throw new Error(error.config.invalidValue('processId'));
      }
      processId = config.processId;
    }

    this.processId = filterPrintUsASCII(processId + EMPTY, 128);

    return this;
  }

  /**
   * @param {Object} config
   * @param {Number} [config.timezoneOffset]
   * @returns {Syslog}
   */
  setTimezoneOffset (config) {
    this.timezoneOffset = moment().utcOffset();

    if (config.hasOwnProperty('timezoneOffset')) {
      if (typeof config.timezoneOffset !== constants.TYPE_OF.NUMBER || config.timezoneOffset < -16 || config.timezoneOffset > 16) {
        throw new Error(error.config.invalidValue('timezoneOffset'));
      }
      this.timezoneOffset = config.timezoneOffset;
    }

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

  getSyslogPrefix (severity) {
    return [
      this.getPriority(severity) + VERSION,
      moment().utcOffset(this.timezoneOffset).format(DATE_FORMAT),
      this.hostname,
      this.appName,
      this.processId,
      this.filterMessageId(),
      NIL,
      EMPTY
    ].join(SPACE);
  }

  /**
   * @param {String} message
   * @param {Number} severity
   * @param {Function} callback
   */
  write (message, severity, callback) {
    super.write(this.getSyslogPrefix(severity) + message, severity, callback);
  }
}

module.exports = Syslog;