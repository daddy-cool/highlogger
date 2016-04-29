'use strict';

let path = require('path'),
    glob = require('glob'),
    async = require('async'),
    transporterFiles = glob.sync('../transporters/*.js', {cwd: __dirname}),
    constants = require('../helpers/constants'),
    error = require('../helpers/error');

class Transporters {

  /**
   * @param {object} [config]
   */
  constructor (config) {
    this.transporterTypes = {};

    for (let t in transporterFiles) {
      if (!transporterFiles.hasOwnProperty(t)) {
        continue;
      }

      let transporterType = require(path.join(__dirname, transporterFiles[t]));
      this.transporterTypes[transporterType.name.toLocaleLowerCase()] = transporterType;
    }

    this.transporterList = [];
    config = this.validate(config);

    for (let t in config) {
      if (!config.hasOwnProperty(t)) {
        continue;
      }

      this.transporterList.push(this.initializeTransporter(config[t]));
    }
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   */
  write (messages, severity, context) {
    async.each(
      this.transporterList,
      this.writeToTransporter.bind(this, messages, severity, context)
    );
  }

  /**
   * @param {Array} messages
   * @param {number} severity
   * @param {string} context
   * @param {AbstractTransporter} transporter
   * @param {object} transporter.severity
   * @param {number} transporter.severity.minimum
   * @param {number} transporter.severity.maximum
   * @param {function} callback
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
    if (config === null || typeof config === constants.TYPE_OF.UNDEFINED) {
      try {
        config = require('config').get('highlogger');
      } catch (e) {
        //do nothing
      }
    }

    if (config === null || typeof config === constants.TYPE_OF.UNDEFINED) {
      config = {
        console: {
          type: 'console'
        }
      };
    }

    if (typeof config !== constants.TYPE_OF.OBJECT || Object.keys(config).length < 1) {
      throw new Error(error.config.invalid());
    }

    for (let t in config) {
      if (!config.hasOwnProperty(t)) {
        continue;
      }

      this.validateTransporter(config[t]);
    }

    return config;
  }

  /**
   * @param {object} config
   * @param {string} config.type
   * @param {object} [config.fallback]
   */
  validateTransporter (config) {
    if (!this.hasTransporterType(config.type)) {
      throw new Error(error.config.invalidValue('type'));
    }

    if (config.hasOwnProperty('fallback')) {
      this.validateTransporter(config.fallback);
    }
  }

  initializeTransporter (config) {
    if (config.hasOwnProperty('fallback')) {
      config.fallback = this.initializeTransporter(config.fallback);
    }

    return new (this.getTransporterType(config.type))(config);
  }

  /**
   * @param {string} transporterType
   * @returns {boolean}
   */
  hasTransporterType (transporterType) {
    return this.transporterTypes.hasOwnProperty(transporterType);
  }

  /**
   * @param {string} transporterType
   * @returns {AbstractTransporter}
   */
  getTransporterType (transporterType) {
    return this.transporterTypes[transporterType];
  }

}

module.exports = Transporters;