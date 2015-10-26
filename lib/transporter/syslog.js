'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    osHostname = require('os').hostname();

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const FACILITY = SHARED_CONSTANTS.FACILITY;
const NIL = '-';
const SPACE = ' ';
const PRI_START = '<';
const PRI_END = '>';
const VERSION = '1';
const EMPTY = '';
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

const FILTER = {
  PRINT_US_ASCII: /([\x21-\x7e])+/g
};

/**
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function filterPrintUsASCII (str, maxLength) {
  if (typeof str === OBJECT_TYPE.NUMBER || typeof str === OBJECT_TYPE.BOOLEAN) {
    str = EMPTY + str;
  }

  if (typeof str === OBJECT_TYPE.STRING && str.length > 0) {
    let strArray = str.match(FILTER.PRINT_US_ASCII);
    if (strArray && strArray.length) {
      return strArray.join(EMPTY).substring(0, maxLength);
    }
  }

  return NIL;
}

class Syslog extends Socket {

  /**
   * @param {Object} config
   * @param {number} config.facility
   * @param {string} config.hostname
   * @param {string} config.appName
   * @param {string} config.processId
   * @param {boolean} config.json
   * @param {number} config.timezoneOffset
   * @param {string} config.dateFormat
   */
  constructor (config) {
    super(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setProcessId(config.processId)
        .setJson(config.json)
        .setTimezoneOffset(config.timezoneOffset);
  }

  /**
   * @param {number} [facility]
   * @returns {Syslog}
   */
  setFacility (facility) {
    this.facility = (typeof facility === OBJECT_TYPE.NUMBER) ? parseInt(facility, 10) * 8 : FACILITY.USER * 8;

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
    this.appName = filterPrintUsASCII(appName, 48);

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
   * @param {boolean} json
   * @returns {Syslog}
   */
  setJson (json) {
    this.json = (typeof json === OBJECT_TYPE.BOOLEAN) ? json : false;

    return this;
  }

  /**
   * @param {number} [timezoneOffset]
   * @returns {Syslog}
   */
  setTimezoneOffset (timezoneOffset) {
    if (typeof timezoneOffset !== OBJECT_TYPE.NUMBER || timezoneOffset < -16 || timezoneOffset > 16) {
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

  /**
   * @param {string} [structuredData]
   * @returns {string}
   */
  filterStructuredData (structuredData) {
    return (typeof structuredData === OBJECT_TYPE.STRING) ? structuredData : NIL;
  }

  /**
   * @param {string} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    if (
      options.severity === SHARED_CONSTANTS.SEVERITY.DEBUG &&
      typeof options.debugKey === SHARED_CONSTANTS.OBJECT_TYPE.STRING
    ) {
      options.messageId = options.debugKey;
      delete options.debugKey;
    }

    //noinspection JSUnresolvedFunction
    super.write(
      PRI_START + (this.facility + options.severity) + PRI_END + VERSION + SPACE
      + moment().utcOffset(this.timezoneOffset).format(DATE_FORMAT) + SPACE + this.hostname + SPACE + this.appName
      + SPACE + this.processId + SPACE + this.filterMessageId(options.messageId) + SPACE
      + this.filterStructuredData(options.structuredData) + SPACE + message,
      options,
      callback
    );
  }
}

module.exports = Syslog;