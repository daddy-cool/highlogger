'use strict';

let AbstractTransporter = require('./abstract'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;

class Socket extends AbstractTransporter {

  /**
   * @param {Object} config
   */
  constructor (config) {
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
    if (typeof config.method === OBJECT_TYPE.UNDEFINED || config.method === 'udp') {
      this.socket = dgram.createSocket('udp4');
    } else {
      super.errorHandler(new Error('unsupported socket method "' + config.method + '"'));
    }

    return this;
  }

  /**
   * @param {string} [address]
   * @returns {Socket}
   */
  setAddress (address) {
    this.address = address || '127.0.0.1';

    return this;
  }

  /**
   * @param {number} [port]
   * @returns {Socket}
   */
  setPort (port) {
    this.port = (typeof port === OBJECT_TYPE.NUMBER) ? port : 514;

    return this;
  }

  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Function} [callback]
   */
  write (message, options, callback) {
    let messageBuffer = new Buffer(message);

    this.socket.send(
      messageBuffer,
      0,
      messageBuffer.length,
      this.port,
      this.address,
      callback
    );
  }
}

module.exports = Socket;