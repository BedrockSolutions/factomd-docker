const {merge} = require('lodash')

const GLOBAL_DEFAULTS = {
  identityChainID: 'fa1e000000000000000000000000000000000000000000000000000000000000',
  startDelay: 600,
}

const PROFILES = {
  mainnet: {
    network: 'MAIN',
    networkPort: 8108,
    specialPeers: [
      '52.17.183.121:8108',
      '52.17.153.126:8108',
      '52.19.117.149:8108',
      '52.18.72.212:8108',
    ],
  },
  testnet: {
    bootstrapIdentity: '8888882f5002ff95fce15d20ecb7e18ae6cc4d5849b372985d856b56e492ae0f',
    bootstrapKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae',
    customNet: 'fct_community_test',
    exchangeRateAuthorityPublicKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae',
    network: 'CUSTOM',
    networkPort: 8110,
    seedUrl: 'https://raw.githubusercontent.com/FactomProject/communitytestnet/master/seeds/testnetseeds.txt',
  },
}

module.exports = values => merge({}, GLOBAL_DEFAULTS, PROFILES[values.profile], values)
