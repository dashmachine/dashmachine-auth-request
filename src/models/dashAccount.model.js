// imports
const Dash = require('dash');
const debug = require('debug')('server:debug');

/**
 * DashAccount class - represents a Dash Platform Account
 * @class DashAccount
 * @property {string} mnemonic The account mnemonic
 */
module.exports = class DashAccount {
  /**
   * Empty constructor
   * @constructs DashAccount
   */
  constructor() {
    debug(`Creating new account`);
  }

  get mnemonic() {
    return this._mnemonic;
  }

  /**
   * @param {string} newMnemonic
   */
  set mnemonic(newMnemonic) {
    if (newMnemonic) {
      this._mnemonic = newMnemonic;
    }
  }
};
