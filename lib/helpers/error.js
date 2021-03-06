'use strict';

module.exports = {
  config: {
    invalidValue: function configInvalidValue (field) {
      return `highlogger invalid value for '${field}'`;
    },
    invalid: function configInvalid () {
      return 'highlogger invalid config';
    }
  },
  transporter: {
    exceededSizeLimit: function transporterExceededSizeLimit () {
      return `message exceeded sizeLimit`;
    }
  },
  general: {
    notInstanced: function notInstanced () {
      return 'highlogger not instanced';
    },
    notImplemented: function transporterNotImplemented (functionName) {
      return `highlogger function '${functionName}' not implemented`;
    }
  }
};