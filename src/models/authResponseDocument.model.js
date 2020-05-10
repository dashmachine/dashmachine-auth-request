// imports
const debug = require('debug')('server:debug');
const DataDocument = require('../models/dataDocument.model');

/**
 * AuthResponseDocument class - represents auth response documents sumitted to or retrieved from Dash Platform
 * @class AuthResponseDocument
 * @extends DataDocument
 */
module.exports = class AuthResponseDocument extends DataDocument {
  /**
   * constructor - creates a new AuthResponseDocument
   * @constructs AuthResponseDocument
   * @param contractId {string}
   * @param documentId {string}
   * @param ownerId {string}
   * @param data {Object}
   *
   */
  constructor(dataContractId, id, ownerId, data) {
    debug(`Creating new AuthResponseDocument`);
    super(dataContractId, id, ownerId, data);
  }
};
