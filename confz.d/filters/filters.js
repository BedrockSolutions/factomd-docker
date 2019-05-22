const {capitalize, flow, isArray, isFunction, isString, join, toLower, toUpper, upperFirst} = require('lodash/fp')

const DEFAULT_ARG_NAME = toLower

const DEFAULT_OPT_NAME = upperFirst

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
  bootstrapKey: {
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
    value: toUpper,
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

const isArg = (values, key) => {
  const {arg = false, squelched = false} = overrides[key] || {}
  return arg && !squelched
}

const isOpt = (values, key) => {
  const {arg = false, squelched = false} = overrides[key] || {}
  return !arg && !squelched
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

module.exports = {getName, getValue, isArg, isOpt}