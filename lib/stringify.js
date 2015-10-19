'use strict';

const SHARED_CONSTANTS = require('./shared-constants');
const OBJECT_TYPE = SHARED_CONSTANTS.OBJECT_TYPE;

class Stringify {

  /**
   * @param {*} msg
   * @returns {String}
   */
  static value (msg) {
    let msgType = typeof msg;

    if (msgType === OBJECT_TYPE.STRING) {
      return msg;
    }

    if (msgType === OBJECT_TYPE.NUMBER || msgType === OBJECT_TYPE.BOOLEAN || msgType === OBJECT_TYPE.UNDEFINED) {
      return '' + msg;
    }

    if (msg instanceof Error) {
      return Stringify.objectWithProperties(msg);
    }

    return Stringify.object(msg);
  }

  /**
   * @param {Object} obj
   * @param {boolean} [stopOnError]
   * @returns {String}
   */
  static object (obj, stopOnError) {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      if (stopOnError !== true) {
        return Stringify.objectWithProperties(err, true);
      }

      return err.message;
    }
  }

  /**
   * @param {Object} obj
   * @param {boolean} [stopOnError]
   * @returns {String}
   */
  static objectWithProperties (obj, stopOnError) {
    let objWithProperties = {};

    function addProperty (propKey) {
      objWithProperties[propKey] = obj[propKey];
    }

    Object.getOwnPropertyNames(obj).forEach(addProperty, obj);

    return Stringify.object(objWithProperties, stopOnError);
  }
}

module.exports = Stringify.value;