'use strict';

let CircularJSON = require('circular-json'),
    util = require('util'),
    constants = require('./constants');

const SPACE = ' ';

/**
 * @param {Error} err
 * @returns {Object}
 */
function errToObject (err) {
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
 * @param {String} context
 * @param {*} message
 * @param {Boolean} json
 * @param {function} callback
 */
function stringify (context, message, json, callback) {
  if (!json) {
    if (message !== null && typeof message === constants.TYPE_OF.OBJECT) {
      message = util.inspect(message);
    }
    message = context + SPACE + message;
  } else {
    if (message instanceof Error) {
      message = errToObject(message);
    } else if (message instanceof Array) {
      message = arrayToObject(message);
    } else if (message !== null && typeof message !== constants.TYPE_OF.OBJECT) {
      message = {message: message};
    }
    message.context = context;

    message = CircularJSON.stringify(message);
  }

  callback(message);
}

module.exports = stringify;