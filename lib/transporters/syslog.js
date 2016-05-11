'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    osHostname = require('os').hostname(),
    filterPrintUsASCII = require('../helpers/functions').filterPrintUsASCII,
    path = require('path');

const SPACE = ' ';
const NIL = '-';
const PRI_START = '<';
const PRI_END = '>';
const VERSION = '1';
const EMPTY = '';
//noinspection SpellCheckingInspection
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
//noinspection SpellCheckingInspection
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

/**
 * @class Syslog
 * @extends Socket
 */
class Syslog extends Socket {
  /**
   * @name Syslog#address
   * @type string
   * @default 127.0.0.1
   */
  /**
   * @name Syslog#port
   * @type number
   * @default 514
   */
  /**
   * @name Syslog#facility
   * @type number
   */
  /**
   * @name Syslog#hostname
   * @type string
   */
  /**
   * @name Syslog#appName
   * @type string
   */
  /**
   * @name Syslog#processId
   * @type string
   */
  /**
   * @name Syslog#timezoneOffset
   * @type number
   */

  /**
   * @inheritdoc
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
   * @inheritdoc
   */
  setAddress (config) {
    if (!config.hasOwnProperty('address')) {
      config.address = '127.0.0.1';
    }
    super.setAddress(config);

    return this;
  }

  /**
   * @inheritdoc
   */
  setPort (config) {
    if (!config.hasOwnProperty('port')) {
      config.port = 514;
    }
    super.setPort(config);

    return this;
  }

  /**
   * @inheritdoc
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
   * @param {object} config
   * @param {string} [config.facility]
   * @returns {Syslog}
   * @throws {Error}
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
   * @param {object} config
   * @param {string} [config.hostname]
   * @returns {Syslog}
   * @throws {Error}
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
   * @param {object} config
   * @param {string} [config.appName]
   * @returns {Syslog}
   * @throws {Error}
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
   * @param {object} config
   * @param {string} [config.processId]
   * @returns {Syslog}
   * @throws {Error}
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
   * @param {object} config
   * @param {number} [config.timezoneOffset]
   * @returns {Syslog}
   * @throws {Error}
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
  //unused for now
  //filterMessageId (messageId) {
  // return filterPrintUsASCII(messageId, 32);
  //}

  /**
   * @param {number} severity
   * @returns {string}
   */
  getSyslogPrefix (severity) {
    return [
      PRI_START + (this.facility + severity) + PRI_END + VERSION,
      moment().utcOffset(this.timezoneOffset).format(DATE_FORMAT),
      this.hostname,
      this.appName,
      this.processId,
      NIL, //filterMessageId(?)
      NIL, //structuredData
      EMPTY
    ].join(SPACE);
  }

  /**
   * @inheritdoc
   */
  write (message, severity, callback) {
    super.write(this.getSyslogPrefix(severity) + message, severity, callback);
  }
}

module.exports = Syslog;