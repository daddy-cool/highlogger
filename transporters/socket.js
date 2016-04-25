'use strict';

let AbstractTransporter = require('./abstract'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    dgram = require('dgram');

const SPACE = ' ';

/**
 * @namespace Transporters
 */
class Socket extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   * @param {number} [config.maxMessageSize]
   */
  constructor (config) {
    if (typeof config.maxMessageSize !== constants.TYPE_OF.NUMBER) {
      config.maxMessageSize = 512;
    }

    super(config);

    this.setAddress(config.address)
        .setPort(config.port)
        .initSocket(config);
  }

  /**
   * @param {Object} config
   * @returns {Socket}
   */
  initSocket (config) {
    if (config.method === 'udp4') {
      this.socket = dgram.createSocket('udp4');
    } else {
      throw new Error('unsupported socket method "' + config.method + '"');
    }

    return this;
  }

  /**
   * @param {string} [address]
   * @returns {Socket}
   */
  setAddress (address) {
    if (typeof address !== constants.TYPE_OF.STRING) {
      throw new Error('socket transporters requires an address');
    } else {
      this.address = address;
    }

    return this;
  }

  /**
   * @param {number} [port]
   * @returns {Socket}
   */
  setPort (port) {
    if (typeof port !== constants.TYPE_OF.NUMBER) {
      throw new Error('socket transporter requires a port');
    } else {
      this.port = port;
    }

    return this;
  }

  /**
   * @param {*} msg
   * @param {Object} [options]
   * @param {Function} [callback]
   */
  write (msg, options, callback) {
    let msgBuffer;

    if (
      options !== null &&
      typeof options === constants.constants.TYPE_OF.OBJECT &&
      options.severity === constants.SEVERITY.debug &&
      typeof options.debugKey === constants.constants.TYPE_OF.STRING
    ) {
      let msgPrefix = options.debugKey + SPACE;
      msgBuffer = new Buffer(msgPrefix + this.stringify.stringify(msg, this.json, this.maxMessageSize -  msgPrefix.length));
    } else {
      msgBuffer = new Buffer(this.stringify.stringify(msg, this.json, this.maxMessageSize));
    }

    this.socket.send(
      msgBuffer,
      0,
      msgBuffer.length,
      this.port,
      this.address,
      callback
    );
  }

  /**
   * @param {string} name
   * @param {object} config
   * @param {string} [config.severityMin]
   * @param {string} [config.severityMax]
   * @param {number} [config.sizeLimit]
   * @param {boolean} [config.json]
   */
  static validate (name, config) {
    super.validate(name, config);

    if (config.hasOwnProperty('severityMin') && !constants.SEVERITY.hasOwnProperty(config.severityMin)) {
      throw new Error(error.config.invalidValue(name, 'severityMin'));
    }

    if (config.hasOwnProperty('severityMax') && !constants.SEVERITY.hasOwnProperty(config.severityMax)) {
      throw new Error(error.config.invalidValue(name, 'severityMax'));
    }

    if (config.hasOwnProperty('sizeLimit') && typeof config.sizeLimit !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue(name, 'sizeLimit'));
    }

    if (config.hasOwnProperty('json') && typeof config.json !== constants.TYPE_OF.BOOLEAN) {
      throw new Error(error.config.invalidValue(name, 'json'));
    }
  }
}

module.exports = Socket;