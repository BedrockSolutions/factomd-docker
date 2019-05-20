const {capitalize, flow, isArray, isString, join, toLower, upperFirst} = require('lodash/fp')

const DEFAULT_ARG_NAME = toLower

const DEFAULT_OPT_NAME = upperFirst

const SQUELCHED_KEYS = ['networkProfile', 'roleProfile']

const factomdPrefixOptName = (_, key) => `Factomd${upperFirst(key)}`
const networkPrefixOptName = ({network}, key) => `${capitalize(network)}${upperFirst(key)}`

const overrides = {
  apiPort: {
    name: 'PortNumber',
  },
  apiPassword: {
    name: 'FactomdRpcPass',
  },
  apiUser: {
    name: 'FactomdRpcUser',
  },
  bootstrapIdentity: {
    name: networkPrefixOptName,
  },
  broadcastNum: {
    arg: true,
  },
  corsDomains: {
    joinToken: ', ',
  },
  customNet: {
    arg: true
  },
  exclusive: {
    arg: true
  },
  exclusiveIn: {
    arg: true
  },
  faultTimeout: {
    arg: true,
  },
  identityChainId: {
    name: 'IdentityChainID',
  },
  logLevel: {
    arg: true,
    name: 'loglvl',
  },
  network: {
    unquotedString: true,
  },
  networkPort: {
    name: networkPrefixOptName,
  },
  networkProfile: {
    squelched: true,
  },
  nodeName: {
    arg: true
  },
  roleProfile: {
    squelched: true,
  },
  seedUrl: {
    name: ({network}, key) => `${capitalize(network)}SeedURL`,
  },
  specialPeers: {
    name: networkPrefixOptName,
  },
  startDelay: {
    arg: true
  },
  tlsEnabled: {
    name: factomdPrefixOptName,
  },
  tlsPrivateKey: {
    name: factomdPrefixOptName,
    value: '/app/tls/private_key.pem',
  },
  tlsPublicCert: {
    name: factomdPrefixOptName,
    value: '/app/tls/public_cert.pem',
  }
}

const isArg = (values, key) => overrides[key] && !overrides[key].squelched && overrides[key].arg

const isOpt = (values, key) => !overrides[key] || (!overrides[key].squelched && !overrides[key].arg)

const getName = (values, key) => {
  const override = overrides[key]

  if (override) {
    const {arg, name} = override

    if (name) {
      return isString(name) ? name : name(values, key)
    } else if (arg) {
      return DEFAULT_ARG_NAME(key)
    }
  }

  return DEFAULT_OPT_NAME(key)
}

const getValue = (values, key) => {
  const overrideValue = overrides[key] && overrides[key].value

  const value = overrideValue || values[key]

  if (isArray(value)) {
    return `"${join(overrides[key] && overrides[key].joinToken || ' ', value)}"`
  } else if (isString(value)) {
    return `"${value}"`
  } else {
    return `${value}`
  }
}

module.exports = {getName, getValue, isArg, isOpt}