'use strict';

let path = require('path'),
    glob = require('glob'),
    async = require('async'),
    transporterFiles = glob.sync('./transporters/*.js', {cwd: __dirname}),
    constants = require('./helpers/constants'),
    error = require('./helpers/error');

/**
 * @class Transporters
 */
class Transporters {
  /**
   * @name Transporters#config
   * @type object
   */
  /**
   * @name Transporters#transporterTypes
   * @type object
   */
  /**
   * @name Transporters#transporterList
   * @type Array
   */

  /**
   * @param {object} [config]
   */
  constructor (config) {
    this.transporterTypes = {};
    this.transporterList = [];
    this.errors = [];

    this.initTransporterTypes()
        .initConfig(config)
        .initTransporters();

    let self = this;
    this.errors.forEach(function internalErrorLog (err) {
      self.write(err, 2, 'config');
    });
  }

  /**
   * @returns {Transporters}
   */
  initTransporterTypes () {
    let transporterFilesKeys = Object.keys(transporterFiles),
        transporterFilesKeysIterator = transporterFilesKeys.length;

    while (transporterFilesKeysIterator--) {
      let transporterType = require(path.join(__dirname, transporterFiles[transporterFilesKeys[transporterFilesKeysIterator]]));
      this.transporterTypes[transporterType.name.toLocaleLowerCase()] = transporterType;
    }

    return this;
  }

  /**
   * @returns {Transporters}
   */
  initTransporters () {
    let configKeys = Object.keys(this.config),
        configKeysIterator = configKeys.length;

    while (configKeysIterator--) {
      try {
        this.transporterList.push(this.initTransporter(this.config[configKeys[configKeysIterator]]));
      } catch (err) {
        this.errors.push(err);
      }
    }

    return this;
  }

  /**
   * @param {*} message
   * @param {number} severity
   * @param {string} context
   */
  write (message, severity, context) {
    async.each(
      this.transporterList,
      this.writeToTransporter.bind(this, message, severity, context)
    );
  }

  /**
   * @param {*} message
   * @param {number} severity
   * @param {string} context
   * @param {Abstract} transporter
   * @param {object} transporter.severity
   * @param {number} transporter.severity.minimum
   * @param {number} transporter.severity.maximum
   * @param {function} callback
   */
  writeToTransporter (message, severity, context, transporter, callback) {
    if (severity < transporter.severity.minimum || severity > transporter.severity.maximum) {
      return callback();
    }

    transporter.log(message, severity, context, callback);
  }

  /**
   * @param {object} [config]
   * @returns {Transporters}
   */
  initConfig (config) {
    if (config === null || typeof config === constants.TYPE_OF.UNDEFINED) {
      try {
        //noinspection NpmUsedModulesInstalled
        config = require('config').get('highlogger');
      } catch (e) {
        //do nothing
      }
    }

    if (typeof config !== constants.TYPE_OF.OBJECT || Object.keys(config).length < 1) {
      config = {
        console: {
          type: 'console'
        }
      };
    }

    this.config = config;

    return this;
  }

  /**
   * @param {object} config
   * @returns {Abstract}
   */
  initTransporter (config) {
    if (!this.hasTransporterType(config.type)) {
      throw new Error(error.config.invalidValue('type'));
    }

    if (config.hasOwnProperty('fallback')) {
      config.fallbackTransporter = this.initTransporter(config.fallback);
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
   * @returns {Abstract}
   */
  getTransporterType (transporterType) {
    return this.transporterTypes[transporterType];
  }

}

module.exports = Transporters;