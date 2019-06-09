const test = require('ava')
const {decode} = require('ini')
const {isArray, mapValues, random, times} = require('lodash/fp')
const ms = require('ms')

const {getFileFromContainer, runConfz} = require('./util')

const DEFAULT_CONFIG = {
  network: 'MAIN',
}

const mergeConfig = config => ({
  ...DEFAULT_CONFIG,
  ...config,
})

const getOptions = async config => {
  const factomdConf = await getFileFromContainer('factomd.conf', mergeConfig(config))
  return mapValues(v => v.toString(), decode(factomdConf).app)
}

const getArgs = async config => {
  const startupScript = await getFileFromContainer('start.sh', mergeConfig(config))
  const regex = /-([a-zA-Z_]+)=("?[^ "]+"?)/g

  let match, args = {}
  while ((match = regex.exec(startupScript)) != null) {
    const [_, key, value] = match
    args[key] = value
  }
  return args
}


const randomInt = (min = 4294967295, max = min) => random(min === max ? 0 : min, max)

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

const createConfig = ({key, value, config = {}}) => ({
  [key]: value,
  ...config,
})

const printVal = val => {
  const str = `${val}`
  return `${str.slice(0, 20)}${str.length > 20 ? '...' : ''}`
}

const createTest = ({addAssertions, continueOnError = false, getTestName}) => ({arg = false, ...params}) =>
  test(getTestName(params), async t => {
    const getArgsOrOptions = arg ? getArgs : getOptions
    try {
      const argsOrOptions = await getArgsOrOptions(createConfig(params))
      addAssertions({t, argsOrOptions, params})
    } catch (error) {
      if (continueOnError) {
        addAssertions({t, params, error})
      } else {
        throw error
      }
    }
  })

const isEqual = createTest({
  addAssertions: ({t, argsOrOptions, params: {name, value, expected}}) =>
    t.is(argsOrOptions[name], (expected !== undefined ? expected : value).toString()),
  getTestName: ({key, value, name, expected}) => {
    expected = (expected !== undefined ? expected : value).toString()
    return `{ ${key}: ${printVal(value)} } --> ${name} = ${printVal(expected)}`
  },
})

const isUndefined = createTest({
  addAssertions: ({t, argsOrOptions, params: {name}}) =>
    t.is(argsOrOptions[name], undefined),
  getTestName: ({key, value, name}) =>
    `{ ${key}: ${printVal(value)} } --> ${name} is not defined`,
})

const throws = createTest({
  addAssertions: ({t, error}) => {
    t.assert(error !== undefined)
    if (isArray(error)) {
      error = error[0]
    }
    t.assert(error instanceof Error)
  },
  continueOnError: true,
  getTestName: ({key, value}) => `{ ${key}: ${printVal(value)} } --> Throws Error`
})

const is256BitHex = params => {
  isEqual({value: randomHexId(), ...params})
  throws({value: null, ...params})
  throws({value: randomHexId().slice(1), ...params})
  throws({value: `${randomHexId()}0`, ...params})
  throws({value: 'abc', ...params})
  throws({value: 123, ...params})
}

const is32BitInteger = params => {
  isEqual({value: randomInt(), ...params})
  throws({value: -1, ...params})
  throws({value: 4294967296, ...params})
  throws({value: 'abc', ...params})
}

const isBlock = params => {
  isEqual({value: randomInt(0, 9999999), ...params})
  throws({value: -1, ...params})
  throws({value: null, ...params})
  throws({value: 10000000, ...params})
  throws({value: 'abc', ...params})
}

const isBoolean = ({inverted = false, ...params}) => {
  isEqual({value: true, expected: !inverted, ...params})
  isEqual({value: false, expected: inverted, ...params})
  throws({value: null, ...params})
  throws({value: 'abc', ...params})
  throws({value: 123, ...params})
}

const isDuration = params => {
  const value = randomInt(0, 9999)
  isEqual({value: `${value}s`, expected: Math.trunc(ms(`${value}s`) / 1000).toString(), ...params})
  isEqual({value: `${value}m`, expected: Math.trunc(ms(`${value}m`) / 1000).toString(), ...params})
  isEqual({value: `${value}h`, expected: Math.trunc(ms(`${value}h`) / 1000).toString(), ...params})
  throws({value: null, ...params})
  isEqual({value: randomSeconds(), ...params})
  throws({value: -1, ...params})
  throws({value: '1x', ...params})
}

const isEnum = ({values, ...params}) => {
  values.forEach(value => isEqual({value, ...params}))
  throws({value: null, ...params})
  throws({value: 'abc', ...params})
  throws({value: 123, ...params})
}

const isHostnameArray = ({separator = ' ', ...params}) => {
  const arr = ['a.com', 'b.net', 'c.org', 'localhost']
  isEqual({value: arr, expected: arr.join(separator), ...params})
  throws({value: null, ...params})
  throws({value: 'abc', ...params})
  throws({value: 123, ...params})
}

const isString = params => {
  isEqual({ value: randomString(), ...params })
  isEqual({ value: 'abc', ...params })
  throws({value: null, ...params})
  throws({value: 123, ...params})
  throws({value: false, ...params})
}

const isUnprivilegedPort = params => {
  isEqual({ value: randomPort(), ...params })
  throws({value: null, ...params})
  throws({value: 1024, ...params})
  throws({value: 65536, ...params})
}

const isURI = params => {
  isEqual({value: 'http://www.foo.com/bar.html', ...params})
  isEqual({value: '../foo/bar.html', ...params})
  isEqual({value: 'file:///foo/bar.html', ...params})
  throws({value: null, ...params})
  throws({value: 123, ...params})
}

isUnprivilegedPort({ key: 'apiPort', name: 'PortNumber' })

isDuration({ key: 'blockTime', name: 'DirectoryBlockInSeconds' })

is256BitHex({key: 'bootstrapIdentity', name: 'CustomBootstrapIdentity'})

is256BitHex({key: 'bootstrapKey', name: 'CustomBootstrapKey'})

isEnum({ key: 'controlPanel', values: ['DISABLED', 'READONLY', 'READWRITE'], name: 'ControlPanelSetting' })

isString({key: 'controlPanelName', name: 'nodename', arg: true})

isUnprivilegedPort({ key: 'controlPanelPort', name: 'ControlPanelPort' })

isBoolean({key: 'dbNoFastBoot', name: 'FastBoot', inverted: true})

isDuration({key: 'faultTimeout', name: 'faulttimeout', arg: true})

isBoolean({key: 'forceFollower', name: 'follower', arg: true})

isBlock({ key: 'identityActivationHeight', name: 'ChangeAcksHeight' })

is256BitHex({key: 'identityChain', name: 'IdentityChainID'})

is256BitHex({key: 'identityPrivateKey', name: 'LocalServerPrivKey', config: {identityPublicKey: randomHexId()}})
throws({key: 'identityPrivateKey', value: randomHexId()})

is256BitHex({key: 'identityPublicKey', name: 'LocalServerPublicKey', config: {identityPrivateKey: randomHexId()}})
throws({key: 'identityPublicKey', value: randomHexId()})

isEnum({key: 'logLevel', values: ['NONE', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'], name: 'loglvl', arg: true})

isEqual({key: 'network', value: 'MAIN', name: 'Network'})
isUndefined({key: 'network', value: 'MAIN', name: 'customnet', arg: true})
isEqual({key: 'network', value: 'LOCAL', name: 'Network'})
isUndefined({key: 'network', value: 'LOCAL', name: 'customnet', arg: true})
isEqual({key: 'network', value: 'custom_network', name: 'Network', expected: 'CUSTOM'})
isEqual({key: 'network', value: 'custom_network', name: 'customnet', arg: true})
throws({key: 'network', value: null})
throws({key: 'network', value: 123})

isBoolean({key: 'noBalanceHash', name: 'balancehash', arg: true, inverted: true})

is256BitHex({key: 'oracleChain', name: 'ExchangeRateChainId'})

is256BitHex({key: 'oraclePublicKey', name: 'ExchangeRateAuthorityPublicKey'})

isBoolean({key: 'p2pDisable', name: 'enablenet', arg: true, inverted: true})

is32BitInteger({ key: 'p2pFanout', name: 'broadcastnum', arg: true})
throws({ key: 'p2pFanout', value: 0})

isEqual({key: 'p2pMode', value: 'NORMAL', name: 'exclusive', expected: 'false', arg: true})
isEqual({key: 'p2pMode', value: 'NORMAL', name: 'exclusive_in', expected: 'false', arg: true})
isEqual({key: 'p2pMode', value: 'ACCEPT', name: 'exclusive', expected: 'true', arg: true})
isEqual({key: 'p2pMode', value: 'ACCEPT', name: 'exclusive_in', expected: 'false', arg: true})
isEqual({key: 'p2pMode', value: 'REFUSE', name: 'exclusive', expected: 'false', arg: true})
isEqual({key: 'p2pMode', value: 'REFUSE', name: 'exclusive_in', expected: 'true', arg: true})

isEqual({key: 'p2pPort', value: 5000, name: 'MainNetworkPort', config: {network: 'MAIN'}})
isEqual({key: 'p2pPort', value: 5000, name: 'LocalNetworkPort', config: {network: 'LOCAL'}})
isEqual({key: 'p2pPort', value: 5000, name: 'CustomNetworkPort', config: {network: 'custom_network'}})
isUnprivilegedPort({key: 'p2pPort', name: 'MainNetworkPort'})

isEqual({key: 'p2pSpecialPeers', value: ['12.34.56.78:1234'], name: 'MainSpecialPeers', expected: '12.34.56.78:1234', config: {network: 'MAIN'}})
isEqual({key: 'p2pSpecialPeers', value: ['12.34.56.78:1234'], name: 'LocalSpecialPeers', expected: '12.34.56.78:1234', config: {network: 'LOCAL'}})
isEqual({key: 'p2pSpecialPeers', value: ['12.34.56.78:1234'], name: 'CustomSpecialPeers', expected: '12.34.56.78:1234', config: {network: 'custom_network'}})
throws({key: 'p2pSpecialPeers', value: null})
throws({key: 'p2pSpecialPeers', value: 'abc'})
throws({key: 'p2pSpecialPeers', value: 123})

isEqual({key: 'p2pSeed', value: 'http://www.bar.com/foo.html', name: 'MainSeedURL', config: {network: 'MAIN'}})
isEqual({key: 'p2pSeed', value: 'http://www.bar.com/foo.html', name: 'LocalSeedURL', config: {network: 'LOCAL'}})
isEqual({key: 'p2pSeed', value: 'http://www.bar.com/foo.html', name: 'CustomSeedURL', config: {network: 'custom_network'}})
isURI({key: 'p2pSeed', name: 'MainSeedURL'})

isDuration({key: 'startDelay', name: 'startdelay', arg: true})

isHostnameArray({key: 'webCORS', name: 'CorsDomains', separator: ', '})

isString({ key: 'webPassword', name: 'FactomdRpcPass', config: {webUsername: randomString()} })
throws({key: 'webPassword', value: randomHexId()})

isBoolean({key: 'webTLS', name: 'FactomdTlsEnabled'})

isString({ key: 'webUsername', name: 'FactomdRpcUser', config: {webPassword: randomString()} })
throws({key: 'webUsername', value: randomHexId()})



// // optEq('tlsPrivateKey', 'FactomdTlsPrivateKey', {tlsPrivateKey: randomPem(), tlsPublicCert: randomPem()}, '/app/tls/private_key.pem')
// // optEq('tlsPublicCert', 'FactomdTlsPublicCert', {tlsPrivateKey: randomPem(), tlsPublicCert: randomPem()}, '/app/tls/public_cert.pem')rt', 'LocalNetworkPort', {localNetworkPort: randomPort()})
