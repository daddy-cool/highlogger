'use strict';

let CircularJSON = require('circular-json');

const OBJECT_TYPE = require('./shared-constants').OBJECT_TYPE;
const EMPTY = '';

class Stringify {

  /**
   * @param config
   * @param {number} [config.jsonTimeout]
   * @param {String} [config.jsonDefaultField]
   */
  constructor (config) {
    this
      ._setDefaultField(config.jsonDefaultField)
      ._setTimeout(config.jsonTimeout);

    let msgTimeout = {},
        msgInvalidMaxLength = {};

    msgTimeout[this.defaultField] = 'stringify timeout after ' + this.timeout + 'ms';
    this.msgTimeout = CircularJSON.stringify(msgTimeout);

    msgInvalidMaxLength[this.defaultField] = '';
    this.msgInvalidMaxLength = CircularJSON.stringify(msgInvalidMaxLength);
  }

  /**
   * @param {String} defaultField
   * @returns {Stringify}
   */
  _setDefaultField (defaultField) {
    this.defaultField = (typeof defaultField === OBJECT_TYPE.STRING) ? defaultField : 'message';

    return this;
  }

  /**
   * @param {number} timeout
   * @returns {Stringify}
   */
  _setTimeout (timeout) {
    this.timeout = (typeof timeout === OBJECT_TYPE.NUMBER) ? timeout : 100;

    return this;
  }

  /**
   * @param {Array} arr
   * @returns {Object}
   */
  arrayToObject (arr) {
    let i = arr.length,
        obj = {};

    while (i--) {
      obj[i] = arr[i];
    }

    return obj;
  }

  /**
   * @param {Error} err
   * @returns {Object}
   */
  errorToObject (err) {
    let obj = {},
        errKeys = Object.keys(err),
        errKeysIterator = errKeys.length;

    while (errKeysIterator--) {
      obj[errKeys[errKeysIterator]] = err[errKeys[errKeysIterator]];
    }

    obj.message = err.message;
    obj.stack = err.stack;

    return obj;
  }

  /**
   * @param {string} str
   * @param {number} maxLength
   * @returns {string}
   */
  shortenString (str, maxLength) {
    str += EMPTY;

    if (str.length <= maxLength) {
      return str;
    }

    return str.substring(0, maxLength);
  }

  /**
   * @param {*} obj
   * @param {boolean} json,
   * @param {number} maxLength
   * @returns {String}
   */
  stringify (obj, json, maxLength) {
    if (obj !== null && typeof obj === OBJECT_TYPE.OBJECT) {
      if (json && obj instanceof Array) {
        obj = this.arrayToObject(obj);
      } else if (obj instanceof Error) {
        obj = this.errorToObject(obj);
      }

      obj = CircularJSON.stringify(obj);
      if (obj.length <= maxLength) {
        return obj;
      }
    }

    if (!json) {
      return this.shortenString(obj, maxLength);
    }

    if (maxLength <= 0) {
      return this.msgInvalidMaxLength;
    }

    let start = Date.now();
    while (Date.now() < start + this.timeout) {
      let newObj = {},
          jsonObj;
      newObj[this.defaultField] = obj;

      jsonObj = CircularJSON.stringify(newObj);

      if (jsonObj.length <= maxLength) {
        return jsonObj;
      }

      if (jsonObj.length > maxLength * 2) {
        obj = obj.substr(0, obj.length / 2);
      } else {
        obj = obj.substr(0, obj.length - 1);
      }
    }

    return this.msgTimeout;
  }
}

module.exports = Stringify;