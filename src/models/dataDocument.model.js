// imports
const debug = require('debug')('server:debug');

/**
 * DataDocument class - represents data docuemnts sumitted to or retrieved from Dash Platform
 * @class DataDocument
 * @property {string} dataContractId dataContractId the document is validated against
 * @property {string} ownerId identityId of the owner / submitter of the document
 * @property {JSON} data actual data of the document represented as JSON
 * @property {string} signature the signature on the document
 * @method submit instance method to submit the document to the Dash Platform network
 * @static find static method to return document(s) based on query parameters supplied
 */
module.exports = class DataDocument {
  /**
   * constructor - creates a new DataDocument
   * @constructs DataDocument
   * @param dataContractId {string}
   * @param id {string}
   * @param ownerId {Object}
   * @param data {Object}
   *
   */
  constructor(dataContractId, id, ownerId, data) {
    debug(`Creating new data document`);
    this._dataContractId = dataContractId;
    this._id = id;
    this._ownerId = ownerId;
    this._data = data;
  }

  /**
   * submits the document instance using the passed in connection
   * @param connection A DashJS client containing the account and keys for signing the doc
   */
  async submit(connection) {
    debug(`Assemble document`);
    debug(`contract id: ${this._dataContractId}`);
    debug(`ownerIdentity id: ${JSON.stringify(this._ownerId)}`);
    debug(`data: ${JSON.stringify(this._data)}`);
    try {
      const client = connection.client;
      await client.isReady();
      debug(`client ready...`);

      const identity = await client.platform.identities.get(
        this._ownerId,
      );
      debug(`Retrieved identity: ${JSON.stringify(identity)}`);

      const dataDocument = await client.platform.documents.create(
        this._dataContractId,
        identity,
        this._data,
      );
      debug(
        `document prepared for submission: ${JSON.stringify(
          dataDocument,
        )}`,
      );

      const documentBatch = {
        create: [dataDocument],
        replace: [],
        delete: [],
      };

      debug(`document batch: ${JSON.stringify(documentBatch)}`);

      const submitted = await client.platform.documents.broadcast(
        documentBatch,
        identity,
      );
      debug(
        `document successfully submitted with txid: ${JSON.stringify(
          submitted,
        )}`,
      );
      return { success: true, data: submitted };
    } catch (e) {
      debug(`document submit error: ${e}`);
      return { error: true, message: e };
    }
  }

  /**
   * finds one of more documents based on suplied query params
   * @param {string} connection A DashJS connection, with options set for the locator of the docs to be retrieved
   * @param {string} locator  The document name
   * @param {object} query Object containing array of query parameters
   * @returns {Array} array of found docuemnts
   */
  static async find(connection, locator, query) {
    debug(
      `find documents with locator ${locator} matching query ${query}`,
    );
    try {
      const client = connection.client;
      await client.isReady();
      debug(`client ready...`);
      const found = await client.platform.documents.get(
        locator,
        query,
      );
      debug(`doc found response: ${JSON.stringify(found)}`);
      const numDocsFound = found.length;
      if (numDocsFound > 0) {
        debug(`${numDocsFound} docs found`);
        let arrDocs = [];

        found.map((f) => {
          let d = new this(f.dataContractId, f.id, f.ownerId, f);
          arrDocs.push(d);
        });
        return { success: true, data: arrDocs };
      } else {
        debug(`No docs found`);
        return { success: false };
      }
    } catch (e) {
      // TODO: return doffernt error or success:false if docment not found or server error
      debug(`document find error: ${e}`);
      return { error: true, message: e };
    }
  }

  /**
   * Calls find() over specified period at specifed frequency until result tis returned
   * @param {string} connection A DashJS connection, with options set for the locator of the docs to be retrieved
   * @param {string} locator  The document name 
   * @param {Object} query Object containing array of query parameters
   * @param {number} timeout Number of millseconds until rejecting as timed out
   * @param {number} frequency Frequency of calls to find() in millisenconds
   * @returns {Promise<Object>} promise for JSON Object 
      {success:true, data:array of found docuemnts} if resolved {error: true, message:[error message]} if rejected
   */
  static async waitFor(
    connection,
    locator,
    query,
    timeout,
    frequency,
  ) {
    debug(
      `Polling for ${timeout}ms [to call find() every ${frequency}ms - not implemented] for documents with locator ${locator} matching query ${JSON.stringify(
        query,
      )}`,
    );
    try {
      const timeStart = Date.now();
      debug(`Starting at ${timeStart}`);
      const timeEnd = timeStart + timeout;
      debug(`Trying until ${timeEnd} (${timeout}ms)`);
      let lastCall = timeStart;
      let arrDocs = [];
      let calledCount = 0;
      let foundResult;
      while (lastCall < timeEnd) {
        // TODO implement frequency
        calledCount++;
        lastCall = Date.now();
        debug(
          `Calling find attempt number ${calledCount} @ ${lastCall}`,
        );
        foundResult = await this.find(connection, locator, query);
        if (foundResult.success) {
          debug(
            `Got a successful result after ${calledCount} attempts and ${
              Date.now() - timeStart
            }ms`,
          );
          return { success: true, data: foundResult.data };
        }
      }
      //loop completed and did't find the document
      debug(
        `document waitFor() didn't find any documents in specified time`,
      );
      return { error: true, message: 'documents not found' };
    } catch (e) {
      debug(`document waitFor() error: ${e}`);
      return { error: true, message: e };
    }
  }

  // getters & setters

  get dataContractId() {
    return this._dataContractId;
  }

  /**
   * @param {string} newContractId
   */
  set dataContractId(newContractId) {
    if (newContractId) {
      this._dataContractId = newContractId;
    }
  }

  get id() {
    return this._id;
  }

  /**
   * @param {Object} newId
   */
  set id(newId) {
    if (newId) {
      this._id = newId;
    }
  }

  get ownerId() {
    return this._ownerId;
  }

  /**
   * @param {Object} newOwnerId
   */
  set ownerId(newOwnerId) {
    if (newOwnerId) {
      this._ownerId = newOwnerId;
    }
  }

  get data() {
    return this._data;
  }

  /**
   * @param {Object} newData
   */
  set data(newData) {
    if (newData) {
      this._data = newData;
    }
  }
};
