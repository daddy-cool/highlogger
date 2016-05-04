'use strict';

let AbstractTransporter = require('./abstract'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    dgram = require('dgram');

/**
 * @class Socket
 * @extends AbstractTransporter
 */
class Socket extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   * @param {number} [config.sizeLimit]
   */
  constructor (config) {
    super(config);

    this.setAddress(config)
        .setPort(config)
        .initSocket(config);
  }

  /**
   * @param {Object} config
   * @param {Number} [config.sizeLimit]
   * @returns {Socket}
   */
  setSizeLimit (config) {
    if (!config.hasOwnProperty('sizeLimit')) {
      config.sizeLimit = 512;
    }
    super.setSizeLimit(config);

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} config.method
   * @returns {Socket}
   */
  initSocket (config) {
    if (typeof config.method !== constants.TYPE_OF.STRING || config.method !== 'udp4') {
      throw new Error(error.config.invalidValue('method'));
    }
    this.socket = dgram.createSocket(config.method);

    return this;
  }

  /**
   * @param {Object} config
   * @param {String} config.address
   * @returns {Socket}
   */
  setAddress (config) {
    if (!config.hasOwnProperty('address') || typeof config.address !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('address'));
    }
    this.address = config.address;

    return this;
  }

  /**
   * @param {Object} config
   * @param {Number} config.port
   * @returns {Socket}
   */
  setPort (config) {
    if (!config.hasOwnProperty('port') || typeof config.port !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue('port'));
    }
    this.port = config.port;

    return this;
  }

  /**
   * @param {String} message
   * @param {Number} severity
   * @param {Function} callback
   */
  write (message, severity, callback) {
    let msgBuffer = new Buffer(message);

    this.socket.send(
      msgBuffer,
      0,
      msgBuffer.length,
      this.port,
      this.address,
      callback
    );
  }
}

module.exports = Socket;