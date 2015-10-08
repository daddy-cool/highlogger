"use strict";

let HighLogger = require('../index'),
    assert = require('assert'),
    dgram = require('dgram'),
    socket = dgram.createSocket('udp4'),
    count = 0,
    doneCallback;

socket.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  socket.close(doneCallback);
});

socket.on("message", function (msg, rinfo) {
  count++;
  console.log("udp message: " + msg.toString());
  if (count === 1) {
    socket.close(doneCallback);
  }
});

socket.bind(22514);

let hl = new HighLogger({
  json: true,
  transporters: [
      {
        type: HighLogger.TRANSPORTER.SYSLOG,
        address: '10.30.2.188',
        severity: {
          minimum: HighLogger.SEVERITY.EMERGENCY,
          maximum: HighLogger.SEVERITY.DEBUG
        },
        appName: 'highLogger',
        json: true
      }
  ]
});

describe('module-logger-nodejs', function () {

  it('should listen', function (done) {
    doneCallback = done;
    hl.warning('STRING!');
  });

});