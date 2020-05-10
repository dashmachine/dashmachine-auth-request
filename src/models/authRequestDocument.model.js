// imports
const debug = require('debug')('server:debug');
const DataDocument = require('./dataDocument.model');

/**
 * AuthRequestDocument class - represents login documents sumitted to or retrieved from Dash Platform
 * @class AuthRequestDocument
 * @extends DataDocument
 */
module.exports = class AuthRequestDocument extends DataDocument {
  /**
   * constructor - creates a new AuthRequestDocument
   * @constructs AuthRequestDocument
   * @param contractId {string}
   * @param documentId {string}
   * @param ownerId {string}
   * @param data {Object}
   *
   */
  constructor(dataContractId, id, ownerId, data) {
    debug(`Creating new auth request document`);
    super(dataContractId, id, ownerId, data);
  }
};
