// imports
const Dash = require('dash');
const debug = require('debug')('server:debug');

/**
 * DashConnection class - represents a connection to Dash Platform
 * @class DashConnection
 * @property {string} network Network to connect to i.e. 'testet' (default), mainnet
 * @property {string} mnemonic Account mnemonic  to use for the connection
 * @property {Object} apps named app identities
 * @property {Object} seeds additonal options, overrides other paramaters
 * @property {Object} client the connection instance client
 * @method connect Intialises connection
 */
module.exports = class DashConnection {
  /**
   * Constructor - create an instance of a connection
   * @constructs DashConnection
   */
  constructor(network, mnemonic, apps, seeds) {
    debug(`Creating new connection`);
    this._optionBuilder = {};
    this._network = network || 'testnet';
    this._optionBuilder.network = this._network;
    this._mnemonic = mnemonic;
    this._optionBuilder.mnemonic = this._mnemonic;

    this._apps = apps;
    this._optionBuilder.apps = this._apps;

    this._seeds = seeds;
    this._optionBuilder.seeds = [this._seeds];
    debug(`Contructor parameters: ${this}`);
  }
  /**
   * Intialises connection
   * @method connect
   *
   */
  connect() {
    debug(
      `Intialising connection to network ${
        this._network
      } with options ${JSON.stringify(this._optionBuilder)}`,
    );
    try {
      this._client = new Dash.Client(this._optionBuilder);
      //debug(`Successfully connected ${JSON.stringify(this._client)}` );
      debug(`Successfully connected ${this._client}`);
    } catch (e) {
      debug(`connection error: ${e}`);
      return { error: e };
    }
  }

  /**
   * Closes and disconnect the connection
   * @method disconnect
   *
   */
  disconnect() {
    debug(`Disconnecting connection instance`);
    try {
      this._client.disconnect();
      debug(`Successfully disconnected`);
    } catch (e) {
      debug(`disconnect error: ${e}`);
      return { error: e };
    }
  }

  get network() {
    return this._network;
  }

  /**
   * @param {string} newName
   */
  set network(newNetwork) {
    if (newNetwork) {
      this._network = newNetwork;
    }
  }

  get mnemonic() {
    return this._account;
  }

  /**
   * @param {string} newMnemonic
   */
  set mnemonic(newMnemonic) {
    if (newMnemonic) {
      this._mnemonic = newMnemonic;
    }
  }

  get apps() {
    return this._apps;
  }

  /**
   * @param {Object} newApps
   */
  set apps(newApps) {
    if (newApps) {
      this._apps = newApps;
    }
  }

  get seeds() {
    return this._seeds;
  }

  /**
   * @param {Object} newSeeds
   */
  set options(newSeeds) {
    if (newSeeds) {
      this._seeds = newSeeds;
    }
  }

  get client() {
    return this._client;
  }

  get account() {
    return this._client.account;
  }

  /**
   * @param {any} newClient
   */
  set client(newClient) {
    if (newClient) {
      this._client = newClient;
    }
  }

  connParams() {
    return this._optionBuilder;
  }
};
