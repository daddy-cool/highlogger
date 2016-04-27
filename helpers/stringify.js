'use strict';

let CircularJSON = require('circular-json'),
    async = require('async'),
    util = require('util'),
    constants = require('./constants');

const EMPTY = '';
const SPACE = ' ';

class Stringify {

  constructor (config) {
    this.json = config.json;
    this.jsonDefaultField = config.jsonDefaultField;
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

  stringify (messages, callback) {
    console.log("---");
    let self = this,
        combined = [];

    async.each(messages, function b (message, cb) {
      if (!self.json) {
        combined.push(util.inspect(message));
        return cb();
      }

      if (message !== null && typeof message === constants.TYPE_OF.OBJECT) {
        if (message instanceof Error) {
          message = self.errorToObject(message);
        }

        combined.push(CircularJSON.stringify(message));
        return cb();
      }

      combined.push(message + EMPTY);
      cb();
    }, function () {
      if (!self.json) {
        return callback(combined.join(SPACE));
      }

      console.log(combined);

      callback("foo");
    });
  }

}

module.exports = Stringify;