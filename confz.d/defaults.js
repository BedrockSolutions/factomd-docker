const {get, mergeAll} = require('lodash/fp')

const GLOBAL_DEFAULTS = {
  identityChainId: 'FA1E000000000000000000000000000000000000000000000000000000000000',
  startDelayInSeconds: 0,
}

const NETWORK_PROFILES = {
  mainnet: {
    network: 'main',
  },
  testnet: {
    customBootstrapIdentity: '8888882f5002ff95fce15d20ecb7e18ae6cc4d5849b372985d856b56e492ae0f',
    customBootstrapKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae',
    customExchangeRateAuthorityPublicKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae',
    customNetworkId: 'fct_community_test',
    customNetworkPort: 8110,
    customSeedUrl: 'https://raw.githubusercontent.com/FactomProject/communitytestnet/master/seeds/testnetseeds.txt',
    directoryBlockInSeconds: 600,
    network: 'custom',
  },
}

const ROLE_PROFILES = {
  authority: {
    startDelayInSeconds: 600,
  },
}

const NETWORK_ROLE_PROFILES = {
  mainnet: {
    authority: {
      mainSpecialPeers: [
        '52.17.183.121:8108',
        '52.17.153.126:8108',
        '52.19.117.149:8108',
        '52.18.72.212:8108',
      ],
    }
  }
}

module.exports = ({networkProfile, roleProfile}) =>
  mergeAll([
    {},
    GLOBAL_DEFAULTS,
    get(networkProfile, NETWORK_PROFILES),
    get(roleProfile, ROLE_PROFILES),
    get(`${networkProfile}.${roleProfile}`, NETWORK_ROLE_PROFILES)
  ])
