'use strict';

let constants = require('./constants');

const NIL = '-';
const EMPTY = '';
const FILTER_PRINT_US_ASCII = /([\x21-\x7e])+/g;

/**
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function filterPrintUsASCII (str, maxLength) {
  if (typeof str === constants.TYPE_OF.NUMBER || typeof str === constants.TYPE_OF.BOOLEAN) {
    str = EMPTY + str;
  }

  if (typeof str === constants.TYPE_OF.STRING && str.length > 0) {
    let strArray = str.match(FILTER_PRINT_US_ASCII);
    if (strArray && strArray.length) {
      return strArray.join(EMPTY).substring(0, maxLength);
    }
  }

  return NIL;
}

module.exports = {
  filterPrintUsASCII: filterPrintUsASCII
};