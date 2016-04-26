'use strict';

module.exports = {
  config: {
    invalidValue: function configInvalidValue (field) {
      return `highlogger: invalid value for '${field}'`;
    },
    invalid: function configInvalid () {
      return 'highlogger: invalid config';
    }
  },
  transporter: {
    notImplemented: function transporterNotImplemented (functionName) {
      return `highlogger: function '${functionName}' not implemented`;
    }
  },
  general: {
    notInstanced: function notInstanced () {
      return 'highlogger: not instanced';
    }
  }
};