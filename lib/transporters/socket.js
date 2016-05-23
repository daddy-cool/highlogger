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
   * @inheritdoc
   */
  constructor (config) {
    config.sizeLimit = config.sizeLimit || 512;

    super(config);

    this.setAddress()
        .setPort()
        .initSocket();
  }

  /**
   * @returns {Socket}
   * @throws {TypeError}
   */
  initSocket () {
    if (typeof this.config.method !== constants.TYPE_OF.STRING || this.config.method !== 'udp4') {
      throw new TypeError(error.config.invalidValue('method'));
    }
    this.socket = dgram.createSocket(this.config.method);

    return this;
  }

  /**
   * @returns {Socket}
   * @throws {TypeError}
   */
  setAddress () {
    if (!this.config.hasOwnProperty('address') || typeof this.config.address !== constants.TYPE_OF.STRING) {
      throw new TypeError(error.config.invalidValue('address'));
    }
    this.address = this.config.address;

    return this;
  }

  /**
   * @returns {Socket}
   * @throws {TypeError}
   */
  setPort () {
    if (!this.config.hasOwnProperty('port') || typeof this.config.port !== constants.TYPE_OF.NUMBER) {
      throw new TypeError(error.config.invalidValue('port'));
    }
    this.port = this.config.port;

    return this;
  }

  //noinspection JSUnusedLocalSymbols
  /**
   * @inheritdoc
   */
  write (message, context, severity, callback) {
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