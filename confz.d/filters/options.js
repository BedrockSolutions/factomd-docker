const {flow, join, lowercase, upperCase, upperFirst} = require('lodash/fp')

const networkPrefixOptName = (name, {network}) => `${upperCase(network)}${upperFirst(name)}`

module.exports = {
  arguments: [
    'broadcastNum',
    'customNet',
    'faultTimeout',
    'startDelay',
  ],

  defaults: {
    identityChainID: 'FA1E000000000000000000000000000000000000000000000000000000000000',
    startDelay: 600,
  },

  defaultArgName: lowercase,

  defaultOptName: upperFirst,

  defaultOptValue: (name, values) => values[name],

  profiles: {
    mainnet: {
      network: 'main',
      networkPort: 8108,
      specialPeers: [
        "52.17.183.121:8108",
        "52.17.153.126:8108",
        "52.19.117.149:8108",
        "52.18.72.212:8108",
      ],
    },
    none: {},
    testnet: {
      customNet: 'fct_community_test',
      network: 'custom',
      networkPort: 8110,
    },
  },

  overrides: {
    bootstrapIdentity: {
      optName: networkPrefixOptName,
    },
    networkPort: {
      optName: networkPrefixOptName,
    },
    seedUrl: {
      optName: networkPrefixOptName,
    },
    specialPeers: {
      optName: networkPrefixOptName,
    }
  }
}
