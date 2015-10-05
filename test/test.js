"use strict";

let Highlogger = require('../index'),
    assert = require('assert');

describe('module-logger-nodejs', function () {

  let hl = new Highlogger({
    transporters: [
        {
          type: Highlogger.TRANSPORTER.CONSOLE,
          severityLevel: Highlogger.SEVERITY.DEBUG
        },
        {
          type: Highlogger.TRANSPORTER.CONSOLE,
          severityLevel: Highlogger.SEVERITY.EMERGENCY
        }
    ]
  });

  hl.emerg('emerg');
  hl.alert('alert');
  hl.crit('crit');
  hl.err('err');
  hl.warn('warn');
  hl.notice('notice');
  hl.info('info');
  hl.debug('debug');

});