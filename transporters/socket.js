'use strict';

let AbstractTransporter = require('./abstract'),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    Stringify = require('../helpers/stringify'),
    dgram = require('dgram');

class Socket extends AbstractTransporter {

  /**
   * @param {Object} config
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   * @param {number} [config.sizeLimit]
   */
  constructor (config) {
    if (typeof config.sizeLimit === constants.TYPE_OF.UNDEFINED) {
      config.sizeLimit = 512;
    }

    super(config);

    this.validate(config);

    this
        .setAddress(config.address)
        .setPort(config.port)
        .initSocket(config.method);

    //noinspection JSUnresolvedVariable
    this.stringify = new Stringify(config);
  }

  /**
   * @param {String} method
   * @returns {Socket}
   */
  initSocket (method) {
    this.socket = dgram.createSocket(method);

    return this;
  }

  /**
   * @param {string} [address]
   * @returns {Socket}
   */
  setAddress (address) {
    this.address = address;

    return this;
  }

  /**
   * @param {number} [port]
   * @returns {Socket}
   */
  setPort (port) {
    //noinspection JSUnresolvedVariable
    this.port = port;

    return this;
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   * @param {Function} callback
   */
  write (messages, severity, context, callback) {
    let self = this;

    this.stringify.stringify(context, messages, function socketStringify (message) {
      if (message.length <= self.sizeLimit) {
        return self.socketLog(message, callback);
      }

      if (!self.fallback) {
        return self.stringify.stringify(
          context,
          [error.transporter.exceededSizeLimit(self.sizeLimit)],
          function stringifyFallback (message2) {
            self.socketLog(message2, callback);
          }
        );
      }

      self.fallback.write(messages, severity, context, function writeCb (e, fallbackMessage) {
        let payload = [error.transporter.exceededSizeLimit(self.sizeLimit)];
        if (typeof fallbackMessage !== constants.TYPE_OF.UNDEFINED) {
          payload.push(fallbackMessage);
        }
        self.stringify.stringify(
          context,
          payload,
          function stringifyFallback (message3) {
            self.socketLog(message3, callback);
          }
        );
      });
    });
  }

  socketLog (message, callback) {
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

  /**
   * @param {object} config
   * @param {string} config.address
   * @param {number} config.port
   * @param {string} config.method
   */
  validate (config) {
    if (typeof config.address !== constants.TYPE_OF.STRING) {
      throw new Error(error.config.invalidValue('address'));
    }

    if (typeof config.port !== constants.TYPE_OF.NUMBER) {
      throw new Error(error.config.invalidValue('port'));
    }

    if (typeof config.method !== constants.TYPE_OF.STRING || config.method !== 'udp4') {
      throw new Error(error.config.invalidValue('method'));
    }
  }
}

module.exports = Socket;