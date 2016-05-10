'use strict';

let Abstract = require('./abstract'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    dgram = require('dgram');

/**
 * @class Socket
 * @extends Abstract
 */
class Socket extends Abstract {
  /**
   * @name Socket#socket
   * @type dgram.Socket
   */
  /**
   * @name Socket#address
   * @type string
   */
  /**
   * @name Socket#port
   * @type number
   */
  /**
   * @name Socket#sizeLimit
   * @type number
   * @default 512
   */

  /**
   * @inheritdoc
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   */
  constructor (config) {
    super(config);

    this.setAddress(config)
        .setPort(config)
        .initSocket(config);
  }

  /**
   * @inheritdoc
   */
  setSizeLimit (config) {
    if (!config.hasOwnProperty('sizeLimit')) {
      config.sizeLimit = 512;
    }
    super.setSizeLimit(config);

    return this;
  }

  /**
   * @param {object} config
   * @param {string} config.method
   * @returns {Socket}
   * @throws {Error}
   */
  initSocket (config) {
    if (typeof config.method !== constants.TYPE_OF.STRING || config.method !== 'udp4') {
      throw new Error(error.config.invalidValue('method'));
    }
    this.socket = dgram.createSocket(config.method);

    return this;
  }

  /**
   * @param {object} config
   * @param {string} config.address
   * @returns {Socket}
   * @throws {Error}
   */
  setAddress (config) {
    if (!config.hasOwnProperty('address') || typeof config.address !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('address'));
    }
    this.address = config.address;

    return this;
  }

  /**
   * @param {object} config
   * @param {number} config.port
   * @returns {Socket}
   * @throws {Error}
   */
  setPort (config) {
    if (!config.hasOwnProperty('port') || typeof config.port !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue('port'));
    }
    this.port = config.port;

    return this;
  }

  /**
   * @inheritdoc
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