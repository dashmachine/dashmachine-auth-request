exports.options = {
  connection: {
    apps: {
      loginContract: {
        //contractId: '3K27igwzJDffCoKZVRGi5KRLb95rhd5psLDUXejDZcTq',
        contractId: 'DBVuaTbU8PY9weNrg8RZPerNnv4oEdRWwSa4qXUG7ji4',
      },
      dpnsContract: {
        contractId: '7PBvxeGpj7SsWfvDSa31uqEMt58LAiJww7zNcVRP1uEM',
      },
    },
    network: 'testnet',
    seeds: [
      { service: 'seed-1.evonet.networks.dash.org:3000' },
      { service: 'seed-2.evonet.networks.dash.org:3000' },
      { service: 'seed-3.evonet.networks.dash.org:3000' },
      { service: 'seed-4.evonet.networks.dash.org:3000' },
      { service: 'seed-5.evonet.networks.dash.org:3000' },
     ],
  },
  polling: {
    responsePollingTimeout: 30000,
    responsePollingFrequency: 5000,
    reponsePollingDelay: 3000,
  },
};
