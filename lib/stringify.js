'use strict';

const OBJECT_TYPE = require('./shared-constants').OBJECT_TYPE;
const EMPTY = '';

class Stringify {

  /**
   * @param {*} msg
   * @param {Object} options
   * @param {boolean} options.json,
   * @param {number} options.messageLength,
   * @param {string} options.file,
   * @param {string} options.function
   * @returns {String}
   */
  static value (msg, options) {
    let msgType = typeof msg;
    options.context = (options.trace) ? ',"file":"' + options.file + '","function":"' + options.function + '"}' : '}';

    if (
      msgType === OBJECT_TYPE.STRING ||
      msgType === OBJECT_TYPE.NUMBER ||
      msgType === OBJECT_TYPE.BOOLEAN ||
      msgType === OBJECT_TYPE.UNDEFINED ||
      msgType === OBJECT_TYPE.FUNCTION ||
      msg === null
    ) {
      return Stringify.shortenMessage(msg, options);
    }

    if (msg instanceof Error) {
      return Stringify.objectWithProperties(msg, options);
    }

    return Stringify.object(msg, options);
  }

  /**
   *
   * @param {string} msg
   * @param {Object} options
   * @param {boolean} options.json,
   * @param {number} options.messageLength,
   * @param {string} options.file,
   * @param {string} options.function
   * @returns {string}
   */
  static shortenMessage (msg, options) {
    let messageLength = options.messageLength;

    if (options.json) {
      messageLength = options.messageLength - (options.context.length + 1 + '{"msg":"'.length);
    }

    msg = EMPTY + msg;
    msg = (msg.length <= messageLength) ? msg : 'exceeds limit of ' + options.messageLength + 'B';

    if (!options.json) {
      return msg;
    }

    return '{"msg":"' + msg + options.context;
  }

  /**
   * @param {Object} obj
   * @param {Object} options
   * @param {boolean} options.json,
   * @param {number} options.messageLength,
   * @param {string} options.file,
   * @param {string} options.function
   * @param {boolean} [options.stopOnError]
   * @returns {String}
   */
  static object (obj, options) {
    let msg;

    try {
      if (obj instanceof Array) {
        //TODO ARRAY TO OBJECT WITH KEYS
        msg = '{"msg":' + JSON.stringify(obj) + '}';
      } else {
        msg = JSON.stringify(obj);
      }

      if (msg.length <= options.messageLength - (options.context.length + 1)) {
        return msg.substring(0, msg.length - 1) + options.context;
      }

      return '{"msg":"exceeds limit of ' + options.messageLength + 'B"' + options.context;

    } catch (err) {
      /* istanbul ignore else*/
      if (options.stopOnError !== true) {
        options.stopOnError = true;
        return Stringify.objectWithProperties(err, options);
      }

      return Stringify.shortenMessage(err.message, options);
    }
  }

  /**
   * @param {Object} obj
   * @param {Object} options
   * @returns {String}
   */
  static objectWithProperties (obj, options) {
    let objWithProperties = {},
        propertyKeys = Object.getOwnPropertyNames(obj),
        propertyKeysLength = propertyKeys.length;

    while (propertyKeysLength--) {
      objWithProperties[propertyKeys[propertyKeysLength]] = obj[propertyKeys[propertyKeysLength]];
    }

    return Stringify.object(objWithProperties, options);
  }
}

module.exports = Stringify.value;