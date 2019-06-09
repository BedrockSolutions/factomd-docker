const {
  assignAll,
  capitalize,
  filter,
  flow,
  fromPairs,
  get,
  isArray,
  isFunction,
  isString,
  join,
  map,
  omit,
  sortBy,
  toLower,
  toPairs,
  upperFirst,
} = require('lodash/fp')

const ms = require('ms')

const DEFAULT_ARG_NAME = toLower
const DEFAULT_OPT_NAME = upperFirst

const getNetwork = ({network}) => ['MAIN', 'LOCAL'].includes(network) ? network : 'CUSTOM'

const isCustomNetwork = values => getNetwork(values) === 'CUSTOM'

const networkPrefixOptName = suffix => values =>
  `${capitalize(getNetwork(values))}${suffix}`

const durationToSeconds = value => isString(value) ? Math.trunc(ms(value) / 1000) : value

const not = value => !value

const overrides = {
  apiPort: {
    name: 'PortNumber',
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
  dbNoFastBoot: {
    name: 'FastBoot',
    value: not,
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
  noBalanceHash: {
    arg: true,
    name: 'balancehash',
    value: not,
  },
  oracleChain: {
    name: 'ExchangeRateChainId'
  },
  oraclePublicKey: {
    name: 'ExchangeRateAuthorityPublicKey'
  },
  p2pDisable: {
    arg: true,
    name: 'enablenet',
    value: not,
  },
  p2pFanout: {
    arg: true,
    name: 'broadcastnum',
  },
  p2pMode: {
    arg: true,
    custom: (_, value) => {
      switch (value) {
        case 'ACCEPT':
          return {exclusive: true, exclusive_in: false}
        case 'NORMAL':
          return {exclusive: false, exclusive_in: false}
        case 'REFUSE':
          return {exclusive: false, exclusive_in: true}
        default:
          return {}
      }
    },
  },
  p2pPeerFileSuffix: {
    name: 'PeersFile',
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

const getName = (key, values) => {
  const {arg = false, name: overrideName} = overrides[key] || {}

  if (overrideName) {
    return isFunction(overrideName) ? overrideName(values, key) : overrideName
  } else {
    return (arg ? DEFAULT_ARG_NAME : DEFAULT_OPT_NAME)(key)
  }
}

const getValue = (key, value) => {
  const {
    arg = false,
    joinToken = ' ',
    unquotedString = false,
    value: overrideValue
  } = overrides[key] || {}

  if (overrideValue) {
    value = isFunction(overrideValue) ? overrideValue(value, key) : overrideValue
  }

  if (isArray(value)) {
    return `"${join(joinToken, value)}"`
  } else if (isString(value) && !arg && !unquotedString ) {
    return `"${value}"`
  } else {
    return `${value}`
  }
}

const mergeValues = values => {
  return flow([
    assignAll,
    omit(['networks', 'roles']),
  ])([
    {},
    values,
    get(values.network, values.networks),
    get(values.role, values.roles),
  ])
}

const createValueFilter = selectArgs => ([key]) => {
  const {arg = false, squelched = false} = overrides[key] || {}
  return selectArgs === arg && !squelched
}

const defaultAdaptor = (key, value, values) => ({
  [getName(key, values)]: getValue(key, value),
})

const createAdaptKeyValuePair = values => keyValuePair => {
  const [key, value] = keyValuePair
  const adaptor = get(`${key}.custom`, overrides) || defaultAdaptor
  return adaptor(key, value, values)
}

const sortObjectKeys = flow([
  toPairs,
  sortBy(0),
  fromPairs,
])

const adaptConfiguration = (values, selectArgs) => {
  const mergedValues = mergeValues(values)
  const valueFilter = createValueFilter(selectArgs)
  const adaptKeyValuePair = createAdaptKeyValuePair(mergedValues)

  return flow([
    toPairs,
    filter(valueFilter),
    map(adaptKeyValuePair),
    assignAll,
    sortObjectKeys,
  ])(mergedValues)
}


module.exports = {adaptConfiguration, getNetwork, isCustomNetwork}