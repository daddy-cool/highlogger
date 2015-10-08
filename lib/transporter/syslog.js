'use strict';

let moment = require('moment'),
    Socket = require('./socket'),
    util = require('util'),
    osHostname = require('os').hostname();

const SHARED_CONSTANTS = require('../shared-constants');
const FACILITY = SHARED_CONSTANTS.FACILITY;
const NIL = '-';
const SPACE = ' ';
const PRI_START = '<';
const PRI_END = '>';
const VERSION = '1';
const EMPTY = '';

const FILTER = {
  PRINT_US_ASCII: /[\x21-\x7e]/g
};

/**
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function filterPrintUsASCII (str, maxLength) {
  if (typeof str === 'number' || typeof str === 'boolean') {
    str = EMPTY + str;
  }

  if (typeof str === 'string') {
    let strArray = str.match(FILTER.PRINT_US_ASCII);
    if (strArray.length) {
      return strArray.join(EMPTY).substring(0, maxLength);
    }
  }

  return NIL;
}

class Syslog extends Socket {

  /**
   * @param {Object} config
   */
  constructor (config) {
    if (typeof config !== 'object') {
      config = {};
    }

    super(config);

    this.setFacility(config.facility)
        .setHostname(config.hostname)
        .setAppName(config.appName)
        .setProcessId(config.processId)
        .setJson(config.json);
  }

  /**
   * @param {number} [facility]
   * @returns {Syslog}
   */
  setFacility (facility) {
    this.facility = (typeof facility === 'number') ? parseInt(facility, 10) * 8 : FACILITY.USER * 8;

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
    if (typeof json === 'boolean') {
      this.json = json;
    } else {
      this.json = false;
    }

    return this;
  }

  /**
   * @param {string} message
   * @param {Object} options
   * @param {Function} callback
   */
  write (message, options, callback) {
    if (typeof options.date === 'undefined') {
      options.date = new Date();
    }
    //noinspection JSUnresolvedFunction
    options.date = moment(options.date).format();

    options.messageId = filterPrintUsASCII(options.messageId, 32);

    if (typeof options.structuredData !== 'string') {
      options.structuredData = NIL;
    }

    super.write(
      PRI_START + (this.facility + options.severity) + PRI_END + VERSION + SPACE + options.date + SPACE + this.hostname
      + SPACE + this.appName + SPACE + this.processId + SPACE + options.messageId + SPACE + options.structuredData
      + SPACE + message,
      options,
      callback
    );
  }
}

module.exports = Syslog;