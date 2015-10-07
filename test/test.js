"use strict";

let Highlogger = require('../index'),
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

let hl = new Highlogger({
  json: true,
  transporters: [
      {
        type: Highlogger.TRANSPORTER.SYSLOG,
        severityLevel: Highlogger.SEVERITY.EMERGENCY,
        port: 22514
      }
  ]
});

describe('module-logger-nodejs', function () {

  it('should listen', function (done) {
    doneCallback = done;
    hl.debug("f");
  });

});