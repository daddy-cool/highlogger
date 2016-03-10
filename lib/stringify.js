'use strict';

let CircularJSON = require('circular-json');

const OBJECT_TYPE = require('./shared-constants').OBJECT_TYPE;
const EMPTY = '';
const JSON_CONVERT_TIMEOUT = 100;
const JSON_CONVERT_TIMEOUT_MSG = CircularJSON.stringify({message: 'stringify timeout after ' + JSON_CONVERT_TIMEOUT + 'ms'});
const JSON_MAX_LENGTH_ZERO = CircularJSON.stringify({message: ''});

/**
 * @param {Array} arr
 * @returns {Object}
 */
function arrayToObject (arr) {
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
function errorToObject (err) {
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
function shortenString (str, maxLength) {
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
function stringify (obj, json, maxLength) {
  if (obj !== null && typeof obj === OBJECT_TYPE.OBJECT) {
    if (json && obj instanceof Array) {
      obj = arrayToObject(obj);
    } else if (obj instanceof Error) {
      obj = errorToObject(obj);
    }

    obj = CircularJSON.stringify(obj);
    if (obj.length <= maxLength) {
      return obj;
    }
  }

  if (!json) {
    return shortenString(obj, maxLength);
  }

  if (maxLength === 0) {
    return JSON_MAX_LENGTH_ZERO;
  }

  let start = Date.now();
  while (Date.now() < start + JSON_CONVERT_TIMEOUT) {
    let jsonObj = CircularJSON.stringify({message: obj});

    if (jsonObj.length <= maxLength) {
      return jsonObj;
    }

    if (jsonObj.length > maxLength * 2) {
      obj = obj.substr(0, obj.length/2);
    } else {
      obj = obj.substr(0, obj.length-1);
    }
  }

  return JSON_CONVERT_TIMEOUT_MSG;
}

module.exports = stringify;