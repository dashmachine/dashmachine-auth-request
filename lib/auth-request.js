// imports
const debug = require('debug')('server:debug');
const DashAccount = require('../src/models/dashAccount.model');
const DashConnection = require('../src/services/dashConnection.service');
const DashUser = require('../src/models/dashUser.model');
const AuthRequestDocument = require('../src/models/authRequestDocument.model');
const AuthResponseDocument = require('../src/models/authResponseDocument.model');

const DashmachineCrypto = require('dashmachine-crypto');

/**
 * AuthRequest class - A request for authorisation
 * @class AuthRequest
 * 
 * @example 
 * const AuthRequest = require('./lib/auth-request');
const Options = require('./options');

(async () => {
  try {
    const req = new AuthRequest(
      1,
      'bob',
      '1234',
      'alice',
      'uniform analyst paper father soldier toe lesson fetch exhaust jazz swim response',
      'Web dApp Sample',
      Options.options,
      'Tweets are greets',
    );

    req.vendor = {
      name: 'alice',
      id: 'Aobc5KKaA4ZqzP7unc6WawQXQEK2S3y6EwrmvJLLn1ui',
      identityId: 'CheZBPQHztvLNqN67i4KxcTU1XmDz7qG85X1XeJbc7K5',
      identity: {
        id: 'CheZBPQHztvLNqN67i4KxcTU1XmDz7qG85X1XeJbc7K5',
        publicKeys: [
          {
            id: 0,
            type: 0,
            data: 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz',
            isEnabled: true,
          },
        ],
        balance: 9686447,
      },
      publicKey: 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz',
      privateKey:
        '40148175614f062fb0b4e5c519be7b6f57b872ebb55ea719376322fd12547bff',
    };

    let createdDoc,
      submittedDoc,
      mockResponse,
      foundResponses,
      verifiedRequest;
    try {
      createdDoc = await req.create();
      console.log(`createdDoc:${JSON.stringify(createdDoc)}`);
    } catch (e) {
      console.log(`createdDoc ERROR:${e}`);
    }
    if (createdDoc.success) {
      try {
        submittedDoc = await req.submit();
        console.log(`submittedDoc:${JSON.stringify(submittedDoc)}`);
      } catch (e) {
        console.log(`submittedDoc ERROR:${e}`);
      }
    }

    if (submittedDoc.success) {
      try {
        req.test_enduserMnemonic =
          'liar fee island situate deal exotic flat direct save bag fiscal news';
        req.test_enduserPrivateKey =
          '219c8a8f9376750cee9f06e0409718f2a1b88df4acc61bf9ed9cf252c8602768';
        mockResponse = await req.mockReponse();
        console.log(`mockResponse:${JSON.stringify(mockResponse)}`);
      } catch (e) {
        console.log(`mockResponse ERROR:${e}`);
      }
    }
    if (mockResponse.success) {
      try {
        foundResponses = await req.findResponses();
        console.log(
          `foundResponses:${JSON.stringify(foundResponses)}`,
        );
      } catch (e) {
        console.log(`foundResponses ERROR:${e}`);
      }
    }
    if (foundResponses.success) {
      try {
        verifiedRequest = await req.verify();
        console.log(
          `verifiedRequest:${JSON.stringify(verifiedRequest)}`,
        );
      } catch (e) {
        console.log(`verifiedRequest ERROR:${e}`);
      }
    }
  } catch (e) {
    console.log(`errors: ${e}`); ////
  }
})();
 * 
 * 
 */
module.exports = class AuthRequest {
  /**
   * @constructs AuthRequest
   * @param {number} requestType signup/login/message
   * @param {string} enduserName DPNS username of the requesting user
   * @param {string} pin A client generated pin number for the request
   * @param {string} vendorName DPNS username of the vendor
   * @param {string} vendorMnemonic Account nemonic for the vendor
   * @param {string} dappName Value passed by the vendor to indicate dappname (not secure!)
   * @param {Object} options config options for the request
   * @method findEnduser() returns this.enduser, finding it on the network if the property is null 
   */
  constructor(
    requestType,
    enduserName,
    pin,
    vendorName,
    vendorMnemonic,
    dappname,
    options,
    messageData,
  ) {
    //required properties
    debug(`Creating new auth request`);
    this._requestType = requestType;
    this._enduserName = enduserName;
    this._pin = pin.length ? pin : new Error('Pin Not supplied');
    this._vendorName = vendorName;
    this._vendorMnemonic = vendorMnemonic;
    this._dappname = dappname;
    this._options = options;

    //message data willbe required if this is a Submit request
    this._messageData = messageData || '';
    this._messageData =
      this._requestType == 3 && !this._messageData.length
        ? new Error(
            'No message has beed provided for a MessageRequest',
          )
        : this._messageData;

    //connection options
    this._network = options.connection.network || 'testnet';
    this._apps = options.connection.apps;

    //polling options
    this._responsePollingTimeout =
      options.polling.responsePollingTimeout || 30000;
    this._responsePollingFrequency =
      options.polling.responsePollingFrequency || 5000;
    this._reponsePollingDelay =
      options.polling.reponsePollingDelay || 3000;

    //validate all required properties
    const anError = new Error();
    let arrErrors = [];
    for (let [key, value] of Object.entries(this)) {
      if (
        Object.getPrototypeOf(value) ===
        Object.getPrototypeOf(anError)
      ) {
        arrErrors.push({ property: key, error: value.message });
      }
    }
    if (arrErrors.length > 0) {
      debug(
        `AuthRequest constructor errors: ${JSON.stringify(
          arrErrors,
        )}`,
      );
      throw new Error(JSON.stringify(arrErrors));
    }

    //optional properties
    this._seeds = options.connection.seeds;

    //properties with getters and setters for testing purposes
    this._requestDoc = null;
    this._responseDocType = null;

    //netwrok docs - getters only
    this._submittedRequestDoc = null; //the request successfully submitted to the network
    this._verifiedResponseDoc = null; //the succefully verified request retrived from the network

    this._userResponses = [];

    this._temp_timestamp = null;

    this._entropy = null;

    this._test_enduserPrivateKey = null;

    this._test_enduserMnemonic = null;

    // uninitialised propertries not set in the constructor

    this._enduser = null;
    this._vendor = null;

    //debug(`Create account instance for vendor`);
    //this._vendorAccount = new DashAccount();

    //create a connection
    this._dashConnection = new DashConnection(
      this._network,
      this._vendorMnemonic,
      this._apps,
      this._seeds,
    );
  }

  /**
   * 
   * Call connect() on dash connection object  
   */
  async connect(){
    try{
      await this._dashConnection.connect()
      return;
    }
    catch(e){
      debug('error calling connect on dash connection object')
      throw new Error(e.message);
    }
  }

  /**
   * 
   * Call disconnect() on dash connection object  
   */
  async disconnect(){
    try{
      await this._dashConnection.disconnect()
      return;
    }
    catch(e){
      debug('error calling dicconnect on dash connection object')
      throw new Error(e.message);
    }
  }

  /**
   * if this._enduser==null looks up user details from the network using the supplied connection details 
   * @param {boolean} asObject If true, returns an object which can be assigned to a dashUser, else returns user object  as JSION string 
   * @returns {JSON} | {Object} this._enduser
   */
  async findEnduser(asObject) {
    try {
      debug(`Current value of  this._enduser: ${ this._enduser}`);
      if (this._enduser != null) {
        debug(`Returning already set enduser`);
        return { success: true, data: asObject ? this._enduser : this._enduser.toJSON() };
      } else {
        debug(`Retrieving enduser from the network`);
        //await this._dashConnection.connect();
        let founduser = await DashUser.find(
          this._enduserName,
          this._dashConnection,
        );

        if (founduser.success) {
          this._enduser = founduser.data;
          debug(`Found registered username ${this._enduserName}`);
          debug(`appUserId: ${this._enduser.id}`);
          debug(`Associated idenityId: ${this._enduser.identityId}`);
          debug(`appUserPublicKey: ${this._enduser.publicKey}`);
          debug(`returning endUser ${asObject ? 'as Object': 'as JSON string'}`);
          //this._dashConnection.disconnect();
          return { success: true, data: asObject ? this._enduser : this._enduser.toJSON() };
        } else {
          return { success: false, data: {} };
        }
      }
    } catch (e) {
      //return { error: true, message: e.message };
      throw new Error(e.message)
    }
  }

  /**
   * if this.vendor==null looks up user details from the network using the supplied connection details
   *
   *
   * @returns {Object} this._vendor
   */
  async findVendor() {
    try {
      if (this._vendor != null) {
        return { success: true, data: this._vendor };
      } else {
        //await this._dashConnection.connect();
        const founduser = await DashUser.find(
          this._vendorName,
          this._dashConnection,
        );

        if (founduser.success) {
          this._vendor = founduser.data;
          debug(`Found registered username ${this._vendorName}`);
          debug(`vendor userId: ${this._vendor.id}`);
          debug(`Associated identityId: ${this._vendor.identityId}`);
          debug(`vendor PublicKey: ${this._vendor.publicKey}`);
          //get the account information / keys
          this._vendor.privateKey = await this._dashConnection.account.getIdentityHDKey(
            0,
            'user',
          ).privateKey;
          debug(`vendor PrivateKey: ${this._vendor.privateKey}`);
          //this._dashConnection.disconnect();

          return { success: true, data: this._vendor };
        } else {
          return { success: false, data: {} };
        }
      }
    } catch (e) {
      //return { error: true, message: e.message };
      throw new Error(e.message);
    }
  }

  /**
   * creates a request document of the required type if the username, pin and other options are valid ////
   *
   * @returns {Object} the prepared request document
   */
  async create() {
    try {
      const foundEnduser = await this.findEnduser();
      debug(`foundEnduser ${foundEnduser}`);
      const foundVendor = await this.findVendor();
      debug(`foundVendor ${JSON.stringify(foundVendor)}`);
      if (foundEnduser.success && foundVendor.success) {
        //create hashed and encrypted doc fields ///
        //await this._dashConnection.connect();
        const concatUIDPIN = this._vendor.id.concat(
          this._enduser.id,
          this._pin.toString(),
        );
        debug(`concat uid_pin ${concatUIDPIN}`);
        const hashedUIDPIN = DashmachineCrypto.hash(concatUIDPIN)
          .data;
        debug(`hashed concat uid_pin ${hashedUIDPIN}`);
        debug(`*START EN 1*`);
        const encryptedUIDPIN = await DashmachineCrypto.encrypt(
          this._vendor.privateKey,
          hashedUIDPIN,
          this._enduser.publicKey,
        );
        debug(`*FINISH EN 1*`);
        debug(`*FINISH 1 RESULT ${encryptedUIDPIN.data}`);

        debug(`encrypted concat uid_pin.data ${encryptedUIDPIN}`);

        this._entropy = DashmachineCrypto.generateEntropy();
        debug(`generated entropy ${this._entropy}`);
        debug(`*START EN 2*`);
        const encryptedEntropy = await DashmachineCrypto.encrypt(
          this._vendor.privateKey,
          this._entropy,
          this._enduser.publicKey,
        );
        debug(`*FINISH*`);
        debug(`encryptedEntropy.data ${encryptedEntropy.data}`);

        this._temp_timestamp = Date.now()
          .toString()
          .concat(this._enduser.id);

        const commonRequestData = {
          reference: this._enduser.id,
          uid_pin: encryptedUIDPIN.data,
          nonce: encryptedEntropy.data,
          temp_timestamp: this._temp_timestamp,
          temp_dappname: this._dappname,
        };

        switch (this._requestType) {
          case 1:
            // SignupRequest
            debug(`creating SignupRequest`);
            let signupRequestData = commonRequestData;
            this._requestDoc = new AuthRequestDocument(
              'loginContract.SignupRequest',
              null,
              this._vendor.identityId,
              signupRequestData,
            );
            break;
          case 2:
            // LoginRequest
            debug(`creating LoginRequest`);
            let loginRequestData = commonRequestData;
            this._requestDoc = new AuthRequestDocument(
              'loginContract.LoginRequest',
              null,
              this._vendor.identityId,
              loginRequestData,
            );
            break;
          case 3:
            //MessageRequest /
            debug(`creating MessageRequest`);
            let messageRequestData = commonRequestData;
            messageRequestData.tweet = this._messageData;
            this._requestDoc = new AuthRequestDocument(
              'loginContract.TweetRequest',
              null,
              this._vendor.identityId,
              messageRequestData,
            );
            break;

          default:
            // incorrect doctype
            return {
              error: true,
              message: `Incorrect requestType supplied: ${this._requestType} is not a valid requestType.`,
            };
        }
        //this._dashConnection.disconnect();
        return { success: true, data: this._requestDoc };
      } 
      
      /*
      else {
        let errString = '';
        if (!foundEnduser.success && !foundEnduser.error) {
          errString += 'Enduser not found';
        }
        if (!foundVendor.success && !foundVendor.error) {
          errString +=
            errString.length > 0 ? ', ' : '' + 'Vendor not found\n';
        }
        if (foundEnduser.error) {
          errString +=
            errString.length > 0 ? ', ' : '' + foundEnduser.message;
        }
        if (foundVendor.error) {
          errString +=
            errString.length > 0 ? ', ' : '' + foundVendor.message;
        }
        //return { error: true, message: errString };
        throw new Error (errString);
      }
      */
    } catch (e) {
      //return { error: true, message: e.message };
      throw new Error (e.message);
    }
  }

  /**
   * Submits the document set as the value of this._requestDoc returns this._submittedRequestDoc if successful
   * 
   * @returns Promise<{
        success: boolean;
        data: any;
        error?: undefined;
        message?: undefined;
    } | {
        error: boolean;
        message: any;
        success?: undefined;
        data?: undefined;
    }>
   */
  async submit() {
    try {
      if (this._requestDoc === null) {
        //return { error: true, message: 'No request document is set' };
        throw new Error('No request document is set')
      }
      //await this._dashConnection.connect();
      const submitted = await this._requestDoc.submit(
        this._dashConnection,
      );
      //this._dashConnection.disconnect();

      if (submitted.success) {
        this._submittedRequestDoc = submitted.data.create[0];
        debug(`submitted document: ${JSON.stringify(submitted)}`);
        return { success: true, data: this._submittedRequestDoc };
      } 

    } catch (e) {
      debug(`submit error ${e}`);
      //return { error: true, message: e.message };
      throw new Error( e.message);
    }
  }

  /**
   * Mock Reponse with known user private keys
   */
  async mockReponse() {
    debug(`mocking response`);
    try {
      //vid_pin: Encrypted Hash of [Vendor nonce + Vendor userID + CW Pin)
      const plainVID_PIN = this._entropy.concat(
        this._vendor.id,
        this._pin.toString(),
      );
      debug(`plainVID_PIN ${plainVID_PIN}`);

      //hash then encrypt for the vendors PK
      //hash
      const hashedVID_PIN = await DashmachineCrypto.hash(plainVID_PIN)
        .data;
      debug(`hashedVID_PIN ${hashedVID_PIN}`);

      //CW gets the wallet user's own private key
      //CW looks up the vendors public key from their userid
      //encrypt hashedVID_PIN
      debug(
        `encrypting vid_pin:  await DashmachineCrypto.encrypt(${this._test_enduserPrivateKey},${hashedVID_PIN}, ${this._vendor.publicKey})`,
      );
      const encryptedVID_PIN = await DashmachineCrypto.encrypt(
        this._test_enduserPrivateKey,
        hashedVID_PIN,
        this._vendor.publicKey,
      ).data;
      debug('encryptedVID_PIN: ' + encryptedVID_PIN);

      //status: Encrypted [status+entropy] (0 = valid)
      const statusCode = 0;
      const status = statusCode
        .toString()
        .concat(DashmachineCrypto.generateEntropy());
      debug('status: ' + status);
      const encryptedStatus = await DashmachineCrypto.encrypt(
        this._test_enduserPrivateKey,
        status,
        this._vendor.publicKey,
      ).data;
      debug('encryptedStatus: ' + encryptedStatus);

      //LoginResponse DocData
      const authResponseDocOpts = {
        reference: this._vendor.id,
        vid_pin: encryptedVID_PIN,
        status: encryptedStatus,
        temp_timestamp: this._temp_timestamp,
      };
      debug('authResponseDocOpts: ' + authResponseDocOpts);

      debug(`Connect as enduser...`);
      const enduserConnection = new DashConnection(
        'testnet',
        this._test_enduserMnemonic,
        this._apps,
        this._seeds,
      );
      await enduserConnection.connect();

      //create a new response  document

      switch (this._requestType) {
        case 1:
          // SignupRequest
          debug(`mocking a SignupResponse`);
          this._responseDocType = 'loginContract.SignupResponse';
          break;
        case 2:
          // LoginRequest
          debug(`mocking a LoginResponse`);
          this._responseDocType = 'loginContract.LoginResponse';
          break;
        case 3:
          //MessageRequest /
          debug(`mocking a MessageResponse`);
          this._responseDocType = 'loginContract.TweetResponse';
          break;

        default:
          // incorrect doctype
          throw new Error(`Incorrect requestType supplied: ${this._requestType} is not a valid requestType.`)
          /*
          return {
            error: true,
            message: `Incorrect requestType supplied: ${this._requestType} is not a valid requestType.`,
          };
          */
      }

      const authResponseDocument = new AuthResponseDocument(
        this._responseDocType,
        null,
        this._enduser.identityId,
        authResponseDocOpts,
      );

      debug('authResponseDocument: ' + authResponseDocument);

      const submittedResponse = await authResponseDocument.submit(
        enduserConnection,
      );

      debug(`sending test response doc...`);

      //TODO: check for submnitted error
      const submittedResDoc = submittedResponse.data.create[0];
      debug(`submitted document id: ${submittedResDoc}`);

      const submittedDocId = submittedResDoc.id;
      debug(`submitted document id: ${submittedDocId}`);
      enduserConnection.disconnect();

      return { success: true, data: submittedResDoc };
    } catch (e) {
      debug(`submitted test response error: ${e}`);
      //return { error: e.message };
      throw new Error(e.message)
    }
  }

  /**
   * poll for responses matching criteria
   *
   * @returns {Object} this._enduser
   */
  async findResponses() {
    try {
      const getResponseQueryOpts = {
        where: [
          ['$ownerId', '==', this._enduser.identityId],
          ['reference', '==', this._vendor.id],
          ['temp_timestamp', '==', this._temp_timestamp],
        ],
      };

      let wait = (ms) => new Promise((r, j) => setTimeout(r, ms));
      const reponsePollingWaitStart = Date.now();
      debug(
        `waiting ${this._reponsePollingDelay}ms from ${reponsePollingWaitStart} before polling...`,
      );
      await wait(this._reponsePollingDelay);
      debug(
        `Done: waited  ${
          Date.now() - reponsePollingWaitStart
        }ms before polling`,
      );

      switch (this._requestType) {
        case 1:
          // SignupRequest
          debug(`looking for SignupResponse`);
          this._responseDocType = 'loginContract.SignupResponse';
          break;
        case 2:
          // LoginRequest
          debug(`looking for LoginResponse`);
          this._responseDocType = 'loginContract.LoginResponse';
          break;
        case 3:
          //MessageRequest /
          debug(`looking for MessageResponse`);
          this._responseDocType = 'loginContract.TweetResponse';
          break;

        default:
          // incorrect doctype
          /*
          return {
            error: true,
            
            //message: `Incorrect requestType supplied: ${this._requestType} is not a valid requestType.`,
          };
          */
          throw new Error(`Incorrect requestType supplied: ${this._requestType} is not a valid requestType.`)
      }

      //await this._dashConnection.connect();
      const gotResponse = await AuthResponseDocument.waitFor(
        this._dashConnection,
        this._responseDocType,
        getResponseQueryOpts,
        this._responsePollingTimeout,
        this._responsePollingFrequency,
      );
      //this._dashConnection.disconnect();
      if (gotResponse.success) {
        const numResponseDocs = gotResponse.data.length;

        // create AuthResponseDocument(s)
        // not strictly necceary but for future use...?
        debug(`casting reponses to LoginResponseDoc`);
        let arrAuthResponseDocs = [];
        gotResponse.data.map((d) => {
          let doc = new AuthResponseDocument();
          Object.assign(doc, d);
          arrAuthResponseDocs.push(doc);
        });

        debug(`arrAuthResponseDocs: ${arrAuthResponseDocs}`);

        debug(
          `Checking for responses from  user *Identity id* ${this._enduser.identityId}`,
        );
        this._userResponses = arrAuthResponseDocs.filter(
          (d) => d.ownerId == this._enduser.identityId,
        );

        debug(
          `found ${this._userResponses.length} reponses from user Identity id ${this._enduser.identityId}`,
        );

        return { success: true, data: this._userResponses };
      } else {
        // TODO: Check for server error or just time out
        debug(
          `Unable to find reponse document in specified time (or possible server error)`,
        );
        throw new Error('Unable to find reponse document in specified time')
       /*
        return {
          error: true,
          message:
            'Unable to find reponse document in specified time',
        };
        */
      }
    } catch (e) {
      debug(`Find response error ${e}`);
      throw new Error (e.message);
      //return { error: true, message: e.message };
    }
  }

  /**
   * Verifies all found responses to deternine if loginis successful
   *
   */
  async verify() {
    try {
      //decrypt all responses
      debug(`decrypting user responses`);
      let decryptedResponses = [];
      let decryptedVID_PIN, decryptedStatus;

      decryptedResponses = await Promise.all(
        this._userResponses.map(async (r) => {
          return {
            responseDocId: r.id,
            decryptedVID_PIN: await DashmachineCrypto.decrypt(
              this._vendor.privateKey,
              r.data.data.vid_pin,
              this._enduser.publicKey,
            ).data,
            //debug(`decryptedVID_PIN: ${JSON.stringify(decryptedVID_PIN)}`);
            decryptedStatus: await DashmachineCrypto.decrypt(
              this._vendor.privateKey,
              r.data.data.status,
              this._enduser.publicKey,
            ).data,
            //debug(`decryptedStatus: ${JSON.stringify(decryptedStatus)}`);
          };
        }),
      );

      debug(
        `decryptedResponses: ${JSON.stringify(decryptedResponses)}`,
      );

      //verify vid_pin hash
      debug(`verifying responses for vid_pin hash`);
      const expectedPlainVID_PIN = this._entropy.concat(
        this._vendor.id,
        this._pin.toString(),
      );
      debug(`expectedPlainVID_PIN ${expectedPlainVID_PIN}`);

      //hash
      const expectedHashedVID_PIN = await DashmachineCrypto.hash(
        expectedPlainVID_PIN,
      ).data;
      debug(`expectedHashedVID_PIN ${expectedHashedVID_PIN}`);
      // TODO: could use verify function here
      const verifiedResponses = decryptedResponses.filter(
        (d) => d.decryptedVID_PIN == expectedHashedVID_PIN,
      );
      const numVerifiedResponses = verifiedResponses.length;

      debug(
        `found ${numVerifiedResponses} verified reponse(s) from user Identity id ${this._enduser.identityId}`,
      );

      //THERE SHOULD ONLY BE ONE, BECAUSE OF THE ENTROPY
      if (numVerifiedResponses != 1) {
        //could (likely) be because we didn't wait long enough for the response document
        //try again

        debug(`incorrect number of verified responses`);

        //ALSO POSSIBLE THERE'S A FAKE/DUPLICATE RESPONSE!!!!
        /*
        return {
          error: true,
          message: 'Verified response not found',
        };
        */
        throw new Error('Verified response not found');
      } else {
        debug(
          `Check the status of the verifed response (left character = 0)`,
        );
        const verifiedResponseStatus = verifiedResponses[0].decryptedStatus.substring(
          0,
          1,
        );
        debug(`verifiedResponseStatus: ${verifiedResponseStatus}`);

        if (verifiedResponseStatus == '0') {
          this._verifiedResponseDoc = verifiedResponses[0];
          debug(`****AUTH SUCCESS!****`);
          return {
            success: true,
            data: {
              submittedDoc: this._submittedRequestDoc,
              validResponseData: this._verifiedResponseDoc,
            },
          };
        } else {
          debug(`Auth request verified but status not 0`);
          /*
          return {
            error: true,
            message: 'Auth Request was verified but status not set to 0, so not valid',
          };
          */
          throw new Error('Auth Request was verified but status not set to 0, so not valid')
        }
      }
    } catch (e) {
      debug(`verify error ${e}`);
     // return { error: true, message: e.message };
     throw new Error(e.message);
    }
  }

  //getters & setters
  get vendor() {
    return this._vendor;
  }

  /**
   * @param {Object} newVendor
   */
  set vendor(newVendor) {
    if (newVendor) {
      this._vendor = newVendor;
    }
  }

  get enduser() {
    return this._enduser;
  }

  get enduserToJSON() {
    return this._enduser != null ? this._enduser.toJSON : null;
  }

  /**
   * @param {Object} newVendor
   */
  set enduser(newEnduser) {
    if (newEnduser) {
      this._enduser = newEnduser;
    }
  }

  get requestDoc() {
    return this._requestDoc;
  }

  /**
   * @param {Object} newRequestDoc
   */
  set requestDoc(newRequestDoc) {
    if (newRequestDoc) {
      this._requestDoc = newRequestDoc;
    }
  }

  get responseDocType() {
    return this._responseDocType;
  }

  /**
   * @param {string} newResponseDocType
   */
  set responseDocType(newResponseDocType) {
    if (newResponseDocType) {
      this._responseDocType = newResponseDocType;
    }
  }

  get userResponses() {
    return this._userResponses;
  }

  /**
   * @param {Array<Object>} newUserResponses
   */
  set userResponses(newUserResponses) {
    if (newUserResponses) {
      this._userResponses = newUserResponses;
    }
  }

  get temp_timestamp() {
    return this._temp_timestamp;
  }

  /**
   * @param {string} newTemp_timestamp
   */
  set temp_timestamp(newTemp_timestamp) {
    if (newTemp_timestamp) {
      this._temp_timestamp = newTemp_timestamp;
    }
  }

  get entropy() {
    return this._entropy;
  }

  /**
   * @param {string} newEntropy
   */
  set entropy(newEntropy) {
    if (newEntropy) {
      this._entropy = newEntropy;
    }
  }

  get test_enduserPrivateKey() {
    return this._test_enduserPrivateKey;
  }

  /**
   * @param {string} newTest_enduserPrivateKey
   */
  set test_enduserPrivateKey(newTest_enduserPrivateKey) {
    if (newTest_enduserPrivateKey) {
      this._test_enduserPrivateKey = newTest_enduserPrivateKey;
    }
  }

  get test_enduserMnemonic() {
    return this._test_enduserMnemonic;
  }

  /**
   * @param {string} newTest_enduserMnemonic
   */
  set test_enduserMnemonic(newTest_enduserMnemonic) {
    if (newTest_enduserMnemonic) {
      this._test_enduserMnemonic = newTest_enduserMnemonic;
    }
  }

  //getters only - network proof docs
  get verifiedResponseDoc() {
    return this._verifiedResponseDoc;
  }

  get submittedRequestDoc() {
    return this._submittedRequestDoc;
  }
};
