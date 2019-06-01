const {assignAll, capitalize, flow, get, isArray, isFunction, isString, join, omit, toLower, upperFirst} = require('lodash/fp')
const ms = require('ms')

const DEFAULT_ARG_NAME = toLower
const DEFAULT_OPT_NAME = upperFirst

const getNetwork = ({network}) => ['MAIN', 'LOCAL'].includes(network) ? network : 'CUSTOM'

const isCustomNetwork = values => getNetwork(values) === 'CUSTOM'

const networkPrefixOptName = suffix => values =>
  `${capitalize(getNetwork(values))}${suffix}`

const durationToSeconds = value => isString(value) ? ms(value) * 1000 : value

const overrides = {
  apiPort: {
    name: 'PortNumber',
  },
  balanceHash: {
    arg: true,
  },
  blockTime: {
    name: 'DirectoryBlockInSeconds',
    value: durationToSeconds,
  },
  bootstrapIdentity: {
    name: 'CustomBootstrapIdentity',
  },
  bootstrapKey: {
    name: 'CustomBootstrapKey',
  },
  controlPanel: {
    name: 'ControlPanelSetting'
  },
  controlPanelName: {
    arg: true,
    name: 'nodename',
  },
  dbFastBoot: {
    name: 'FastBoot',
  },
  faultTimeout: {
    arg: true,
    value: durationToSeconds,
  },
  forceFollower: {
    arg: true,
    name: 'follower',
  },
  identityActivationHeight: {
    name: 'ChangeAcksHeight',
  },
  identityChain: {
    name: 'IdentityChainID',
  },
  identityPrivateKey: {
    name: 'LocalServerPrivKey',
  },
  identityPublicKey: {
    name: 'LocalServerPublicKey',
  },
  logLevel: {
    arg: true,
    name: 'loglvl',
  },
  network: {
    squelched: true,
  },
  networks: {
    squelched: true,
  },
  oracleChain: {
    name: 'ExchangeRateChainId'
  },
  oraclePublicKey: {
    name: 'ExchangeRateAuthorityPublicKey'
  },
  p2pEnable: {
    arg: true,
    name: 'enablenet',
  },
  p2pFanout: {
    arg: true,
    name: 'broadcastnum',
  },
  p2pMode: {
    name: ({p2pMode}) => {
      switch (p2pMode) {
        case 'ACCEPT':
          return 'exclusive'
        case 'REFUSE':
          return 'exclusiveIn'
      }
    },
    squelched: ({p2pMode}) => !['ACCEPT', 'REFUSE'].includes(p2pMode),
    value: value => ['ACCEPT', 'REFUSE'].includes(value),
  },
  p2pPort: {
    name:  networkPrefixOptName('NetworkPort')
  },
  p2pSeed: {
    name: networkPrefixOptName('SeedURL'),
  },
  p2pSpecialPeers: {
    name: networkPrefixOptName('SpecialPeers'),
  },
  p2pTimeout: {
    arg: true,
    name: 'deadline',
    value: durationToSeconds
  },
  pprofExpose: {
    arg: true,
    name: 'exposeprofiler',
  },
  pprofMPR: {
    arg: true,
    name: 'mpr',
  },
  pprofPort: {
    arg: true,
    name: 'logPort',
  },
  role: {
    squelched: true,
  },
  roles: {
    squelched: true
  },
  roundTimeout: {
    arg: true,
    value: durationToSeconds,
  },
  startDelay: {
    arg: true,
    value: durationToSeconds
  },
  webCORS: {
    joinToken: ', ',
    name: 'CorsDomains'
  },
  webPassword: {
    name: 'FactomdRpcPass',
  },
  webTLS: {
    name: 'FactomdTlsEnabled',
  },
  webTLSAddresses: {
    arg: true,
    joinToken: ', ',
    name: 'selfaddr',
  },
  webTLSCertificate: {
    name: 'FactomdTlsPublicCert',
    value: '/app/tls/public_cert.pem',
  },
  webTLSKey: {
    name: 'FactomdTlsPrivateKey',
    value: '/app/tls/private_key.pem',
  },
  webUsername: {
    name: 'FactomdRpcUser',
  }
}

const isArg = (values, key) => {
  const {arg = false, squelched = false} = overrides[key] || {}
  return arg && !(isFunction(squelched) ? squelched(values, key) : squelched)
}

const isOpt = (values, key) => {
  const {arg = false, squelched = false} = overrides[key] || {}
  return !arg && !(isFunction(squelched) ? squelched(values, key) : squelched)
}

const getName = (values, key) => {
  const {arg = false, name} = overrides[key] || {}

  if (name) {
    return isFunction(name) ? name(values, key) : name
  } else {
    return (arg ? DEFAULT_ARG_NAME : DEFAULT_OPT_NAME)(key)
  }
}

const getValue = (values, key) => {
  const {
    arg = false,
    joinToken = ' ',
    unquotedString = false,
    value: overrideValue
  } = overrides[key] || {}

  let value
  if (overrideValue) {
    value = isFunction(overrideValue) ? overrideValue(values[key], key) : overrideValue
  } else {
    value = values[key]
  }

  if (isArray(value)) {
    return `"${join(joinToken, value)}"`
  } else if (isString(value) && !arg && !unquotedString ) {
    return `"${value}"`
  } else {
    return `${value}`
  }
}

let mergedValues
const mergeValues = values => {
  if (!mergedValues) {
    mergedValues = flow([
      assignAll,
      omit(['networks', 'roles']),
    ])([
      {},
      values,
      get(values.network, values.networks),
      get(values.role, values.roles),
    ])
  }
  return mergedValues
}

module.exports = {getName, getNetwork, getValue, isArg, isCustomNetwork, isOpt, mergeValues}