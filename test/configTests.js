const test = require('ava')
const {decode} = require('ini')
const {random, times} = require('lodash/fp')

const {getFileFromContainer, runConfz} = require('./util')

const DEFAULT_CONFIG = {
  network: 'main',
}

const mergeConfig = config => ({
  ...DEFAULT_CONFIG,
  ...config,
})

const getOptions = async config => {
  const factomdConf = await getFileFromContainer('factomd.conf', mergeConfig(config))
  return decode(factomdConf).app
}

const getArgs = async config => {
  const startupScript = await getFileFromContainer('start.sh', mergeConfig(config))
  const regex = /-([a-zA-Z]+)=("?[^ "]+"?)/g

  let match, args = {}
  while ((match = regex.exec(startupScript)) != null) {
    const [_, key, value] = match
    args[key] = value
  }
  return args
}


const randomInt = (min = 100000, max = min) => random(min === max ? 0 : min, max)

const randomSeconds = () => randomInt(0, 1000)

const randomPort = () => randomInt(1025, 65535)

const randomHexId = (len = 64) => times( () => random(0, 15).toString(16), len).join('')

const randomString = (len = 10) => times( () => random(10, 35).toString(36), len).join('')

const randomPem = () => {
  const name = randomString().toUpperCase()

  return `-----BEGIN ${name}-----
${randomHexId()}
-----END ${name}-----`
}

const optEq = (yamlName, optionName, config, valueOverride) => test(`${yamlName} should map to ${optionName}`, async t => {
  const options = await getOptions(config)
  t.is(valueOverride || config[yamlName].toString(), options[optionName].toString())
})

const argEq = (yamlName, argName, config, valueOverride) => test(`${yamlName} should map to ${argName}`, async t => {
  const args = await getArgs(config)
  t.is(valueOverride || config[yamlName].toString(), args[argName])
})

const badCfg = (config, desc) => test(desc, async t => {
  try {
    await runConfz(mergeConfig(config))
    t.fail('No exception was thrown')
  } catch (err) {
    t.pass()
  }
})

optEq('apiPassword', 'FactomdRpcPass', {apiPassword: randomString(), apiUser: randomString()})
badCfg({apiPassword: randomString()}, 'API password but no username should fail')

optEq('apiPort', 'PortNumber', {apiPort: randomPort()})
badCfg({apiPort: 1024}, 'API privileged port should fail')

optEq('apiUser', 'FactomdRpcUser', {apiPassword: randomString(), apiUser: randomString()})
badCfg({apiUser: randomString()}, 'API user but no password should fail')
badCfg({apiPassword: randomString(), apiUser: randomInt()}, 'API user is int should fail')

optEq('authorityServerPrivateKey', 'LocalServerPrivKey', {authorityServerPrivateKey: randomHexId(), authorityServerPublicKey: randomHexId()})
badCfg({authorityServerPrivateKey: randomHexId()}, 'Auth server private key but no public key should fail')
badCfg({authorityServerPrivateKey: randomString(), authorityServerPublicKey: randomHexId()}, 'Auth server private key is not PEM should fail')

optEq('authorityServerPublicKey', 'LocalServerPublicKey', {authorityServerPrivateKey: randomHexId(), authorityServerPublicKey: randomHexId()})
badCfg({authorityServerPublicKey: randomHexId()}, 'Auth server public key but no private key should fail')
badCfg({authorityServerPrivateKey: randomHexId(), authorityServerPublicKey: randomString()}, 'Auth server public key is not PEM should fail')

optEq('brainSwapHeight', 'ChangeAcksHeight', {brainSwapHeight: randomInt(10000, 20000)})
badCfg({brainSwapHeight: randomString()}, 'Brain swap height is a string should fail')

argEq('broadcastNumber', 'broadcastnum', {broadcastNumber: randomInt(1, 10000)})
badCfg({broadcastNumber: 0}, 'Broadcast number is zero should fail')
badCfg({broadcastNumber: -randomInt(1, 10000)}, 'Broadcast number is negative should fail')

optEq('controlPanelMode', 'ControlPanelSetting', {controlPanelMode: 'disabled'})
optEq('controlPanelMode', 'ControlPanelSetting', {controlPanelMode: 'readonly'})
optEq('controlPanelMode', 'ControlPanelSetting', {controlPanelMode: 'readwrite'})
badCfg({controlPanelMode: randomString()}, 'Control panel mode is random string should fail')

optEq('controlPanelPort', 'ControlPanelPort', {controlPanelPort: randomPort()})
badCfg({controlPanelPort: randomInt(1, 1024)}, 'Control panel port is privileged should fail')

optEq('corsDomains', 'CorsDomains', {corsDomains: ['foo.com', 'bar.com']}, 'foo.com, bar.com')
optEq('customBootstrapIdentity', 'CustomBootstrapIdentity', {customBootstrapIdentity: randomHexId()})
optEq('customBootstrapKey', 'CustomBootstrapKey', {customBootstrapKey: randomHexId()})
optEq('customExchangeRateAuthorityPublicKey', 'ExchangeRateAuthorityPublicKey', {customExchangeRateAuthorityPublicKey: randomHexId()})
argEq('customNetworkId', 'customnet', {customNetworkId: randomString()})
optEq('customNetworkPort', 'CustomNetworkPort', {customNetworkPort: randomPort()})
optEq('customSeedUrl', 'CustomSeedURL', {customSeedUrl: 'http://foo.com'})
optEq('customSpecialPeers', 'CustomSpecialPeers', {customSpecialPeers: ['1.2.3.4:1025', '6.7.8.9:5000']}, '1.2.3.4:1025 6.7.8.9:5000')
optEq('directoryBlockInSeconds', 'DirectoryBlockInSeconds', {directoryBlockInSeconds: randomSeconds()})
optEq('fastBoot', 'FastBoot', {fastBoot: true})
argEq('faultTimeoutInSeconds', 'faulttimeout', {faultTimeoutInSeconds: randomSeconds()})
optEq('identityChainId', 'IdentityChainID', {identityChainId: randomHexId()})
optEq('localNetworkPort', 'LocalNetworkPort', {localNetworkPort: randomPort()})
optEq('localSeedUrl', 'LocalSeedURL', {localSeedUrl: 'http://foo.com'})
optEq('localSpecialPeers', 'LocalSpecialPeers', {localSpecialPeers: ['1.2.3.4:1025', '6.7.8.9:5000']}, '1.2.3.4:1025 6.7.8.9:5000')
argEq('logLevel', 'loglvl', {logLevel: 'panic'})
optEq('mainNetworkPort', 'MainNetworkPort', {mainNetworkPort: randomPort()})
optEq('mainSeedUrl', 'MainSeedURL', {mainSeedUrl: 'http://foo.com'})
optEq('mainSpecialPeers', 'MainSpecialPeers', {mainSpecialPeers: ['1.2.3.4:1025', '6.7.8.9:5000']}, '1.2.3.4:1025 6.7.8.9:5000')
optEq('network', 'Network', {network: 'test'}, 'TEST')
argEq('nodeName', 'nodename', {nodeName: randomString()})
argEq('specialPeersDialOnly', 'exclusive', {specialPeersDialOnly: true})
argEq('specialPeersOnly', 'exclusiveIn', {specialPeersOnly: true})
argEq('startDelayInSeconds', 'startdelay', {startDelayInSeconds: randomSeconds()})
optEq('testNetworkPort', 'TestNetworkPort', {testNetworkPort: randomPort()})
optEq('testSeedUrl', 'TestSeedURL', {testSeedUrl: 'http://foo.com'})
optEq('testSpecialPeers', 'TestSpecialPeers', {testSpecialPeers: ['1.2.3.4:1025', '6.7.8.9:5000']}, '1.2.3.4:1025 6.7.8.9:5000')
optEq('tlsEnabled', 'FactomdTlsEnabled', {tlsEnabled: false})
optEq('tlsPrivateKey', 'FactomdTlsPrivateKey', {tlsPrivateKey: randomPem(), tlsPublicCert: randomPem()}, '/app/tls/private_key.pem')
optEq('tlsPublicCert', 'FactomdTlsPublicCert', {tlsPrivateKey: randomPem(), tlsPublicCert: randomPem()}, '/app/tls/public_cert.pem')

