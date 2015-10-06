"use strict";

let AbstractTransporter = require('./abstract-transporter'),
    dgram = require('dgram'),
    sharedConstants = require('../shared-constants'),
    SEVERITY = sharedConstants.SEVERITY;

class Socket extends AbstractTransporter {

  constructor (config) {
    super(config);

    this.setAddress(config.address)
        .setPort(config.port)
        .initSocket(config);
  }

  initSocket (config) {
    if (typeof config.method === 'undefined') {
      config.method = 'udp';
    }

    if (typeof config.method !== 'string') {
      throw new Error('unsupported method');
    }

    switch (config.method) {
      case 'udp':
        this.socket = dgram.createSocket('udp4');
        break;

      default:
        throw new Error(`unsupported method ${config.method}`);
    }

    return this;
  }

  setAddress (address) {
    this.address = address || '127.0.0.1';

    return this;
  }

  setPort (port) {
    this.port = (typeof port === 'number') ? port : 514;

    return this;
  }

  log (message, options, callback) {
    let messageBuffer;

    switch (typeof message) {
      case 'buffer':
        messageBuffer = message;
        break;
      case 'string':
        messageBuffer = new Buffer(message);
        break;
      case 'object':
        message = new Buffer(JSON.stringify(message));
        break;
      default:
        message = new Buffer(String(message));
        break;
    }

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