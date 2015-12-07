'use strict';

let AbstractTransporter = require('./abstract'),
    dgram = require('dgram'),
    stringify = require('../stringify');

const SHARED_CONSTANTS = require('../shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;
const SPACE = ' ';

class Socket extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   * @param {number} [config.maxMessageSize]
   */
  constructor (config) {
    if (typeof config.maxMessageSize !== OBJECT_TYPE.NUMBER) {
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
    if (typeof address !== OBJECT_TYPE.STRING) {
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
    if (typeof port !== OBJECT_TYPE.NUMBER) {
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
      typeof options === SHARED_CONSTANTS.OBJECT_TYPE.OBJECT &&
      options.severity === SHARED_CONSTANTS.SEVERITY.debug &&
      typeof options.debugKey === SHARED_CONSTANTS.OBJECT_TYPE.STRING
    ) {
      let msgPrefix = options.debugKey + SPACE;
      msgBuffer = new Buffer(msgPrefix + stringify(msg, false, this.maxMessageSize -  msgPrefix.length));
    } else {
      msgBuffer = new Buffer(stringify(msg, false, this.maxMessageSize));
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
}

module.exports = Socket;