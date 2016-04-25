'use strict';

module.exports = {
  config: {
    invalidValue: function configInvalidValue (transporterName, field) {
      return `highlogger: invalid value for '${field}' for transporter '${transporterName}'`;
    },
    invalid: function configInvalid () {
      return 'highlogger: invalid config';
    }
  },
  transporter: {
    notImplemented: function transporterNotImplemented (transporterType, functionName) {
      return `highlogger: function '${functionName}' not implemented for transporter type '${transporterType}'`;
    }
  },
  general: {
    notInstanced: function notInstanced () {
      return 'highlogger: not instanced';
    }
  }
};