'use strict';

const OBJECT_TYPE = require('./shared-constants').OBJECT_TYPE;
const EMPTY = '';
const NULL = 'null';

/**
 * @param {Object} objWithProperties
 * @param {Object} obj
 * @param {string} propKey
 */
function addProperty (objWithProperties, obj, propKey) {
  objWithProperties[propKey] = obj[propKey];
}

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

    if (
      msgType === OBJECT_TYPE.NUMBER ||
      msgType === OBJECT_TYPE.BOOLEAN ||
      msgType === OBJECT_TYPE.UNDEFINED ||
      msgType === OBJECT_TYPE.FUNCTION
    ) {
      return EMPTY + msg;
    }

    if (msg === null) {
      return NULL;
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
      /* istanbul ignore else*/
      if (stopOnError !== true) {
        return Stringify.objectWithProperties(err, true);
      }

      /* istanbul ignore next - this should never happen and it's pretty impossible to test, thus the ignore */
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

    Object.getOwnPropertyNames(obj).forEach(addProperty.bind(null, objWithProperties, obj), obj);

    return Stringify.object(objWithProperties, stopOnError);
  }
}

module.exports = Stringify.value;