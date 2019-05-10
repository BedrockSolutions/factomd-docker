const {mergeAll} = require('lodash/fp')

const GLOBAL_DEFAULTS = {
  identityChainID: 'FA1E000000000000000000000000000000000000000000000000000000000000',
  startDelay: 600,
}

const PROFILES = {
  mainnet: {
    network: 'MAIN',
    networkPort: 8108,
    specialPeers: [
      "52.17.183.121:8108",
      "52.17.153.126:8108",
      "52.19.117.149:8108",
      "52.18.72.212:8108",
    ],
  },
  testnet: {
    customNet: 'fct_community_test',
    network: 'CUSTOM',
    networkPort: 8110,
  },
}

module.exports = values => mergeAll([{}, GLOBAL_DEFAULTS, PROFILES[values.profile], values])