'use strict';

let CircularJSON = require('circular-json');

const OBJECT_TYPE = require('./shared-constants').OBJECT_TYPE;
const EXCEED_MSG = 'message exceeds size limit of transporter';
const EXCEED_MSG_JSON = '{"0":"message exceeds size limit of transporter"}';
const EMPTY = '';

/**
 * @param {string} str
 * @param {boolean} wasObject
 * @param {boolean} json
 * @param {number} maxMessageSize
 * @returns {string}
 */
function shortenString (str, wasObject, json, maxMessageSize) {
  let message = str + EMPTY;

  if (json && !wasObject) {
    message = CircularJSON.stringify({0: message});
  }

  if (message.length <= maxMessageSize) {
    return message;
  }

  return (json) ? EXCEED_MSG_JSON : EXCEED_MSG;
}

/**
 * @param {Object} obj
 * @returns {string}
 */
function objectToString (obj) {
  return CircularJSON.stringify(obj);
}

/**
 * @param {Array} arr
 * @returns {string}
 */
function arrayToString (arr) {
  let i = arr.length,
      msgObject = {};

  while (i--) {
    msgObject[i] = arr[i];
  }

  return objectToString(msgObject);
}

/**
 * @param {Error} err
 * @returns {string}
 */
function errorToString (err) {
  let obj = {},
      errKeys = Object.keys(err),
      errKeysIterator = errKeys.length;

  while (errKeysIterator--) {
    obj[errKeys[errKeysIterator]] = err[errKeys[errKeysIterator]];
  }

  obj.message = err.message;
  obj.stack = err.stack;

  return objectToString(obj);
}

/**
 * @param {*} msg
 * @param {boolean} json,
 * @param {number} maxMessageSize
 * @returns {String}
 */
function stringify (msg, json, maxMessageSize) {
  if (msg === null || typeof msg !== OBJECT_TYPE.OBJECT) {
    return shortenString(msg, false, json, maxMessageSize);
  }

  if (json && msg instanceof Array) {
    return shortenString(arrayToString(msg), true, json, maxMessageSize);
  }

  if (msg instanceof Error) {
    return shortenString(errorToString(msg), true, json, maxMessageSize);
  }

  return shortenString(objectToString(msg), true, json, maxMessageSize);
}

module.exports = stringify;