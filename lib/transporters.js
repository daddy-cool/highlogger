'use strict';

let path = require('path'),
    glob = require('glob'),
    async = require('async'),
    transporterFiles = glob.sync('../transporters/*.js', {cwd: __dirname}),
    constants = require('../helpers/constants'),
    error = require('../helpers/error'),
    transporterTypes = {};

for (let t in transporterFiles) {
  if (!transporterFiles.hasOwnProperty(t)) {
    continue;
  }

  let transporterType = require(path.join(__dirname, transporterFiles[t]));
  transporterTypes[transporterType.name.toLocaleLowerCase()] = transporterType;
}

class Transporters {

  constructor (config) {
    config = this.validate(config);
    this.transporters = {};

    for (let transporterName in config) {
      if (!config.hasOwnProperty(transporterName)) {
        continue;
      }

      this.addTransporter(transporterName, config[transporterName]);
    }
  }

  write (messages, severity, context) {
    async.each(
      this.transporters,
      this.writeToTransporter.bind(null, messages, severity, context),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   * @param {"@Transporters AbstractTransporter"} transporter
   * @param {Function} callback
   */
  writeToTransporter (messages, severity, context, transporter, callback) {
    if (severity < transporter.severity.minimum || severity > transporter.severity.maximum) {
      return callback();
    }

    transporter.write(messages, severity, context, callback);
  }

  /**
   * @param {object} [config]
   */
  validate (config) {
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
  addTransporter (name, config) {
    this.transporters[name] = new (this.getTransporterType(config.type))(config);
  }

  /**
   * @param {string} transporterType
   * @returns {boolean}
   */
  hasTransporterType (transporterType) {
    return transporterTypes.hasOwnProperty(transporterType);
  }

  /**
   * @param {string} transporterType
   * @returns {"@Transporters AbstractTransporter"}
   */
  getTransporterType (transporterType) {
    return transporterTypes[transporterType];
  }

}

module.exports = Transporters;