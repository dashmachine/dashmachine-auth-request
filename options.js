exports.options = {
  connection: {
    apps: {
      loginContract: {
        contractId: '9GHRxvyYDmWz7pBKRjPnxjsJbbgKLngtejWWp3kEY1vB',
      },
      dpnsContract: {
        contractId: '295xRRRMGYyAruG39XdAibaU9jMAzxhknkkAxFE7uVkW',
      },
    },
    network: 'testnet',
    seeds: { service: '34.215.175.142:3000' },
  },
  polling: {
    responsePollingTimeout: 30000,
    responsePollingFrequency: 5000,
    reponsePollingDelay: 3000,
  },
};
