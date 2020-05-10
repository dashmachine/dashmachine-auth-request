/**
 * Tweet class - represents a user tweet
 * @class Tweet
 * @property {string} username The registered username
 * @property {string} message tweet content
 * @property {string} date date of the tweet
 */
module.exports = class Tweet {
  /**
   * Constructor for a tweet instance
   * @constructs Tweet
   */
  constructor(username, message, date) {
    debug(`Creating new tweet`);
    this._username = username;
    this._message = message;
    this._date = date;
  }

  //getters & setters
  get username() {
    return this._username;
  }

  /**
   * @param {string} newUsername
   */
  set username(newUsername) {
    if (newUsername) {
      this._username = newUsername;
    }
  }

  get message() {
    return this._message;
  }

  /**
   * @param {string} newMessage
   */
  set message(newMessage) {
    if (newMessage) {
      this._username = newMessage;
    }
  }

  get date() {
    return this._message;
  }

  /**
   * @param {string} newDate
   */
  set date(newDate) {
    if (newDate) {
      this._date = newDate;
    }
  }
};
