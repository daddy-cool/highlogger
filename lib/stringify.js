'use strict';

class Stringify {

  /**
   * @param {*} msg
   * @returns {String}
   */
  static value (msg) {
    let msgType = typeof msg;

    if (msgType === 'string') {
      return msg;
    }

    if (msgType === 'number' || msgType === 'boolean' || msgType === 'undefined') {
      return '' + msg;
    }

    if (msg instanceof Error) {
      return Stringify.objectWithProperties(msg);
    }

    return Stringify.object(msg);
  }

  /**
   * @param {Object} obj
   * @returns {String}
   */
  static object (obj) {
    try {
      return JSON.stringify(obj);
    } catch (err) {
      return Stringify.objectWithProperties(err);
    }
  }

  /**
   * @param {Object} obj
   * @returns {String}
   */
  static objectWithProperties (obj) {
    let objWithProperties = {};

    function addProperty (propKey) {
      objWithProperties[propKey] = obj[propKey];
    }

    Object.getOwnPropertyNames(obj).forEach(addProperty, obj);

    return Stringify.object(objWithProperties);
  }
}

module.exports = Stringify.value;