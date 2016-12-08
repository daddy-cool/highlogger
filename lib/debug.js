'use strict';
let constants = require('./helpers/constants');

/**
 * @class Debug
 */
class Debug {

  constructor () {
    this.included = [];
    this.excluded = [];

    if (process.env.DEBUG) {
      let debugKeys = process.env.DEBUG.split(','),
          debugKeysIterator = debugKeys.length;

      while (debugKeysIterator--) {
        let debugKey = debugKeys[debugKeysIterator];

        debugKey = debugKey.trim();
        if (debugKey.length === 0) {
          continue;
        }

        if (debugKey.charAt(0) === '-') {
          debugKey = debugKey.substring(1);
          this.excluded.push(new RegExp('^' + debugKey.replace(/\*/g, '.*') + '$'));
        } else {
          this.included.push(new RegExp('^' + debugKey.replace(/\*/g, '.*') + '$'));
        }
      }
    }
  }

  /**
   * @param {string} context
   * @returns {boolean}
   */
  isIncluded (context) {
    let included = false;

    this.included.forEach(function isIncludedFn (includeKey) {
      if (includeKey.test(context)) {
        included = true;
      }
    });

    return included;
  }

  /**
   * @param {string} context
   * @returns {boolean}
   */
  isExcluded (context) {
    let excluded = false;

    this.excluded.forEach(function isExcludedFn (excludeKey) {
      if (excludeKey.test(context)) {
        excluded = true;
      }
    });

    return excluded;
  }

  /**
   * @param {string} context
   * @returns {boolean}
   */
  isDebug (context) {
    if (typeof context !== constants.TYPE_OF.STRING) {
      return false;
    }

    return this.isIncluded(context) && !this.isExcluded(context);
  }

}

module.exports = Debug;