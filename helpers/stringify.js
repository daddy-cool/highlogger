'use strict';

let CircularJSON = require('circular-json'),
    async = require('async'),
    util = require('util'),
    constants = require('./constants');

const EMPTY = '';
const SPACE = ' ';

class Stringify {

  /**
   * @param {object} [config]
   * @param {boolean} [config.json]
   */
  constructor (config) {
    if (typeof config !== constants.TYPE_OF.OBJECT || config === null) {
      config = {};
    }
    this.json = typeof config.json === constants.TYPE_OF.BOOLEAN ? config.json : false;
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
   * @param {string} context
   * @param {Array} messages
   * @param {function} callback
   */
  stringify (context, messages, callback) {
    let self = this,
        combined = [];

    async.each(messages, function stringifyMessage (message, cb) {
      if (!self.json) {
        if (message === null || typeof message !== constants.TYPE_OF.OBJECT) {
          combined.push(message + EMPTY);
        } else {
          combined.push(util.inspect(message));
        }
        return cb();
      }

      if (message === null || typeof message !== constants.TYPE_OF.OBJECT) {
        message += EMPTY;
      } else if (message instanceof Error) {
        message = self.errorToObject(message);
      }

      combined.push(message);
      cb();
    }, function stringifyFinish () {
      let payload = '';
      if (!self.json) {
        if (context.length > 0) {
          combined.unshift(context);
        }
        payload += combined.join(SPACE);
      } else {
        let payloadObj = {message: combined};
        if (context.length > 0) {
          payloadObj.context = context;
        }
        payload = CircularJSON.stringify(payloadObj);
      }

      callback(payload);
    });
  }

}

module.exports = Stringify;