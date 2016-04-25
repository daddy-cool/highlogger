'use strict';

let path = require('path'),
    glob = require('glob'),
    transporterFiles = glob.sync('../transporters/*.js', {cwd: __dirname}),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    transporterTypes = {},
    transporters = {};

for (let t in transporterFiles) {
  if (!transporterFiles.hasOwnProperty(t)) {
    continue;
  }

  let transporter = require(path.join(__dirname, transporterFiles[t]));
  transporterTypes[transporter.name.toLocaleLowerCase()] = transporter;
}

class Transporters {

  static write (messages, severity, context) {
    console.log(arguments);
  }

  /**
   * @param {Arguments} messages
   * @param {Object} options
   * @param {number} options.severity
   * @param {boolean} [options.isOriginalMessageTypeObject]
   * @param {AbstractTransporter} transporter
   * @param {boolean} [transporter.json]
   * @param {Function} callback
   */
  static writeToTransporter (messages, options, transporter, callback) {
    if (options.severity < transporter.severity.minimum || options.severity > transporter.severity.maximum) {
      return callback();
    }

    transporter.write(messages, options, callback);
  }

  /**
   * @param {object} [config]
   */
  static addTransporters (config) {
    config = this.validate(config);

    for (let transporterName in config) {
      if (!config.hasOwnProperty(transporterName)) {
        continue;
      }

      this.addTransporter(transporterName, config[transporterName]);
    }
  }

  /**
   * @param {object} [config]
   */
  static validate (config) {
    if (typeof config === constants.TYPE_OF.UNDEFINED) {
      try {
        config = require('config').get('highlogger');
      } catch (e) {
        config = {
          console: {
            type: 'console'
          }
        };
      }
    }

    if (config === null || typeof config === constants.TYPE_OF.UNDEFINED) {
      return;
    }

    if (typeof config !== constants.TYPE_OF.OBJECT || Object.keys(config).length < 1) {
      throw new Error(error.config.invalid());
    }

    for (let transporterName in config) {
      if (!config.hasOwnProperty(transporterName)) {
        continue;
      }

      /**
       * @type {object}
       * @property {string} type
       * @property {string} [fallback]
       */
      let transporterConfig = config[transporterName];

      if (!this.hasTransporterType(transporterConfig.type)) {
        throw new Error(error.config.invalidValue(transporterName, 'type'));
      }

      if (transporterConfig.hasOwnProperty('fallback') && !config.hasOwnProperty(transporterConfig.fallback)) {
        throw new Error(error.config.invalidValue(transporterName, 'fallback'));
      }

      this.getTransporterType(transporterConfig.type).validate(transporterName, transporterConfig);
    }

    return config;
  }

  /**
   * @param {string} name
   * @param {object} config
   * @param {string} config.type
   */
  static addTransporter (name, config) {
    transporters[name] = new (this.getTransporterType(config.type))(config);
  }

  /**
   * @param {string} transporterType
   * @returns {boolean}
   */
  static hasTransporterType (transporterType) {
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