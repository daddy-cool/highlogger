'use strict';

const CONSTANTS = {
  SEVERITY: {
    emerg: 0, // system is unusable
    alert: 1, // action must be taken immediately
    crit: 2, // critical conditions
    error: 3, // error conditions
    warn: 4, // warning conditions
    notice: 5, // normal but significant condition
    info: 6, // informational messages
    debug: 7 // debug-level messages
  },
  TYPE_OF: {
    BOOLEAN: 'boolean',
    FUNCTION: 'function',
    OBJECT: 'object',
    NUMBER: 'number',
    STRING: 'string',
    SYMBOL: 'symbol',
    UNDEFINED: 'undefined'
  }
};

module.exports = CONSTANTS;