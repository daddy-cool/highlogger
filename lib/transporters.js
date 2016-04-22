'use strict';

let path = require('path'),
    glob = require('glob'),
    transporterFiles = glob.sync('transporters/*.js', {cwd: __dirname}),
    transporterTypes = {};

for (let t in transporterFiles) {
  if (!transporterFiles.hasOwnProperty(t)) {
    continue;
  }

  let transporter = require(path.join(__dirname, transporterFiles[t]));
  transporterTypes[transporter.name.toLocaleLowerCase()] = transporter;
}

class Transporters {

  /**
   * @param {string} transporterType
   * @returns {boolean}
   */
  static isTransporterType (transporterType) {
    return transporterTypes.hasOwnProperty(transporterType);
  }

  /**
   * @param {string} transporterType
   * @returns {"@Transporters AbstractTransporter"}
   */
  static getTransporterType (transporterType) {
    return transporterTypes[transporterType];
  }

}

module.exports = Transporters;