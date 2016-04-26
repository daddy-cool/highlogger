'use strict';

let debugEnv = process.env.DEBUG;

class Debug {

  constructor () {
    this.included = [];
    this.excluded = [];

    if (debugEnv) {
      let debugKeys = debugEnv.split(','),
          debugKeysIterator = debugKeys.length;

      while (debugKeysIterator--) {
        let debugKey = debugKeys[debugKeysIterator];

        debugKey = debugKey.trim();
        if (debugKey.length === 0) {
          continue;
        }

        if (debugKey.charAt(0) === '-') {
          debugKey = debugKey.substring(1);
          this.excluded.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
        } else {
          this.included.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
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
    return !this.isExcluded(context) && this.isIncluded(context);
  }

}

module.exports = Debug;