'use strict';

let AbstractTransporter = require('./abstract'),
    dgram = require('dgram');

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const SPACE = ' ';

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
    if (config.method === 'udp4') {
      this.socket = dgram.createSocket('udp4');
    } else {
      this.errorHandler(new Error('unsupported socket method "' + config.method + '"'));
    }

    return this;
  }

  /**
   * @param {string} [address]
   * @returns {Socket}
   */
  setAddress (address) {
    if (typeof address !== OBJECT_TYPE.STRING) {
      this.errorHandler(new Error('socket transporters requires an address'));
    } else {
      this.address = '127.0.0.1';
    }

    return this;
  }

  /**
   * @param {number} [port]
   * @returns {Socket}
   */
  setPort (port) {
    if (typeof port !== OBJECT_TYPE.NUMBER) {
      this.errorHandler(new Error('socket transporter requires a port'));
    } else {
      this.port = port;
    }

    return this;
  }

  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {Function} [callback]
   */
  write (message, options, callback) {
    if (
      typeof options === SHARED_CONSTANTS.OBJECT_TYPE.OBJECT &&
      options.severity === SHARED_CONSTANTS.SEVERITY.DEBUG &&
      typeof options.debugKey === SHARED_CONSTANTS.OBJECT_TYPE.STRING
    ) {
      message = options.debugKey + SPACE + message;
    }
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