const {capitalize, flow, isArray, isString, join, toLower, upperFirst} = require('lodash/fp')

const networkPrefixOptName = ({network}, key) => `${capitalize(network)}${upperFirst(key)}`

const defaultArgName = toLower

const defaultOptName = upperFirst

const SQUELCHED_KEYS = ['profile']

const overrides = {
  apiPort: {
    name: 'PortNumber'
  },
  bootstrapIdentity: {
    name: networkPrefixOptName,
  },
  broadcastNum: {
    arg: true,
  },
  customNet: {
    arg: true
  },
  faultTimeout: {
    arg: true,
  },
  networkPort: {
    name: networkPrefixOptName,
  },
  seedUrl: {
    name: networkPrefixOptName,
  },
  specialPeers: {
    name: networkPrefixOptName,
  },
  startDelay: {
    arg: true
  },
  tlsPrivateKey: {
    value: '/home/app/tls/private.key'
  },
  tlsPublicCert: {
    value: '/home/app/tls/public.cert'
  }
}

const isArg = (values, key) => !SQUELCHED_KEYS.includes(key) && !!(overrides[key] && overrides[key].arg)

const isOpt = (values, key) => !SQUELCHED_KEYS.includes(key) && !(overrides[key] && overrides[key].arg)

const getName = (values, key) => {
  const override = overrides[key]

  if (override) {
    const {arg, name} = override

    if (name) {
      return isString(name) ? name : name(values, key)
    } else if (arg) {
      return defaultArgName(key)
    }
  }

  return defaultOptName(key)
}

const getValue = (values, key) => {
  const overrideValue = overrides[key] && overrides[key].value

  const value = overrideValue || values[key]

  if (isArray(value)) {
    return `"${join(' ', value)}"`
  } else if (isString(value)) {
    return `"${value}"`
  } else {
    return `${value}`
  }
}

module.exports = {getName, getValue, isArg, isOpt}