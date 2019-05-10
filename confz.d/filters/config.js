module.exports = {

  apiPort: {
    default: 8088,
    name: 'PortNumber',
  },

  changeAcksHeight: {
    default: 0,
    name: 'ChangeAcksHeight',
  },

  controlPanelPort: {
    default: 8090,
    name: 'ControlPanelPort',
  },

  controlPanelSetting: {
    default: 'readonly',
    name: 'ControlPanelSetting',
  },

  directoryBlockInSeconds: {
    name: 'DirectoryBlockInSeconds',
  },

exchangeRateAuthorityPublicKey:
  name: ExchangeRateAuthorityPublicKey

homeDir:
  name: homeDir

identityChainID:
  default
:
FA1E000000000000000000000000000000000000000000000000000000000000
name: IdentityChainID

localServerPrivateKey:
  name: LocalServerPrivKey

localServerPublicKey:
  name: LocalServerPublicKey

network:
  name: Network
defaults:
  mainnet: MAIN
testnet: CUSTOM

seedUrl:
  defaults:
    testnet: https://raw.githubusercontent.com/FactomProject/communitytestnet/master/seeds/testnetseeds.txt
      names:
        mainnet: MainSeedURL
testnet: CustomSeedURL

specialPeers:
  defaults:
    mainnet: '"52.17.183.121:8108 52.17.153.126:8108 52.19.117.149:8108 52.18.72.212:8108"'
names:
  mainnet: MainSpecialPeers
testnet: CustomSpecialPeers
}