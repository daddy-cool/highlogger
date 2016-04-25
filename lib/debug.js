'use strict';

let includeKeys = [],
    excludeKeys = [],
    debug = process.env.DEBUG;

class Debug {

}


function setupDebugKeys () {


  if (debug) {
    let debugKeys = debug.split(','),
      debugKeysIterator = debugKeys.length;

    while (debugKeysIterator--) {
      let debugKey = debugKeys[debugKeysIterator];

      debugKey = debugKey.trim();
      if (debugKey.length === 0) {
        continue;
      }

      if (debugKey.charAt(0) === '-') {
        debugKey = debugKey.substring(1);
        excludeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      } else {
        includeKeys.push(new RegExp('^' + debugKey.replace(/\*/g, '.*?') + '$'));
      }
    }
  }

  return {include: includeKeys, exclude: excludeKeys};
}

module.exports = Debug;