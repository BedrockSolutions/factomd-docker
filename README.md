# factomd-docker

This is a Docker image containing the Factom Protocol daemon.

**Features:**

  * Simple, YAML-based configuration
  * Rigorous JSON Schema validation
  * Kubernetes-ready
  * Runs as non-root user

## Installation

The basename of the image is:
```
bedrocksolutions/factomd
```

The following tags are available:

* `mainnet`: Contains the current version of `factomd` running on the
mainnet.
* `testnet`: Contains the current version of `factomd` running on the
testnet.

## The Basics

### Volumes

The container expects two volumes to be mounted at startup:

#### `/app/config`
  * A directory containing one or more YAML configuration files.

#### `/app/database`
  * A directory containing either 1) an existing Factom blockchain,
   or 2) nothing.
   
### Configuration Files

Configuration is stored in one or more YAML files and injected into the
container under `/app/config`. Most deployments will simply put all 
configuration into a single file. This set up works for the majority of 
cases, but there are times when it makes sense to break the configuration 
up into multiple files. For example, when running an authority node, 
server keys might be stored in one file while the remainder of the config
is kept in another file.

A couple of points:

  * All config file names must end with either `.yml` or `.yaml` or
  the file will be skipped.
  * Attach the directory containing the config files to `/app/config`.
  Do not attach the individual files.
  * A config file can be disabled by simply renaming it to a
  different suffix, such as `myconfig.yaml.disabled`.
  * Subdirectories within `/app/config` are allowed and will be
  recursively scanned.
  * All config files are merged together to create the final configuration.
  * Both `factomd.conf` and command line arguments are set via the same 
  YAML configuration. One config to rule them all!

### Runtime configuration updates

All active configuration files mounted under `/app/config` are monitored 
for changes. When a change is detected, the new configuration will be 
validated and a fresh `start.sh` script and `factomd.conf` will be 
generated as necessary.

### Commands

The container accepts several commands. These commands are passed to the
container as the first and only command argument. Example:
```bash
docker run \
  --name factomd
  -v /path/to/config:/app/config \
  -v /path/to/db:/app/database \
  -p 8108:8108
  bedrocksolutions/factomd:<tag> [command]
```

#### start

This is the default command. It processes the configuration, establishes
a watcher process to monitor the configuration for changes, and starts
`factomd`.

#### config

Displays the merged YAML configuration.

#### files

Displays the generated start script, `factomd.conf`, and any other
generated files.

#### help

Displays a help message that lists the various commands.

#### schema

Displays the JSON Schema used for validating the YAML configuration. 
Useful when debugging validation errors or when trying to remember 
the YAML file syntax.

#### shell

For use when a shell into the container is desired.

## Configuration Schema

All configuration passed to the container is validated against a rigorous
schema. Validation failure during container start results in immediate
failure. Validation failure during runtime logs the errors to STDOUT and
retains the previous configuration.

> Note: A subset of factomd configuration options and command line arguments are 
currently supported. If there is a setting missing, please
[open an issue](https://github.com/BedrockSolutions/factomd-docker/issues).

### Custom Data Types

The following custom data types have been created, in addition to the
usual standard types:

* `16BitInteger`: An integer between 0-65535
  * Example: `4096`
* `block`: An integer between 0-9999999
  * Example: `194142`
* `hexId`: A 64-character hexadecimal string
  * Example: `38bab1455b7bd7e5efd15c53c777c79d0c988e9210f1da49a99d95b3a6417be9`
* `hostname`: A standard Internet hostname
  * Example: `www.foo.com`
* `ipAddressAndPort`: A IPv4 address and port, separated by a `:`
  * Example: `12.34.56.78:9000`
* `pemData`: Standard Privacy Enhanced Mail format data
  * Example:
```
  -----BEGIN CERTIFICATE-----
  MIIDXjCCAkYCCQCcHTMVrEHBczANBgkqhkiG9w0BAQsFADBxMQswCQYDVQQGEwJV
  UzETMBEGA1UECAwKV2FzaGluZ3RvbjETMBEGA1UEBwwKQmVsbGluZ2hhbTEaMBgG
  A1UECgwRQmVkcm9jayBTb2x1dGlvbnMxHDAaBgNVBAMME2JlZHJvY2tzb2x1dGlv
  bnMuaW8wHhcNMTkwNTIxMTczNTEyWhcNMjAwNTIwMTczNTEyWjBxMQswCQYDVQQG
  EwJVUzETMBEGA1UECAwKV2FzaGluZ3RvbjETMBEGA1UEBwwKQmVsbGluZ2hhbTEa
  -----END CERTIFICATE-----
```
* `tcpPort`: Unprivileged TCP port in the range 1025-65535
  * Example: `8080`
* `uri`: A standard Internet URI
  * Example: `https://api.bar.com/foo`

### Options

#### `apiPassword`

* The password for the API and Control Panel ports' basic 
authentication.
* Type: `string`
* Factomd option: `FactomdRpcPass`

#### `apiPort`

* The port the API server should listen on.
* Type: `tcpPort`
* Factomd option: `PortNumber`

#### `apiUser`

* The username for the API and Control Panel ports' basic 
authentication.
* Type: `string`
* Factomd option: `FactomdRpcUser`

#### `authorityServerPrivateKey`

* An authority server identity private key
* Type: `hexId`
* Factomd option: `LocalServerPrivKey`

#### `authorityServerPublicKey`

* An authority server identity public key
* Type: `hexId`
* Factomd option: `LocalServerPublicKey`

#### `brainSwapHeight`

* The block height at which a brain swap will occur.
* Type: `block`
* Factomd option: `ChangeAcksHeight`

#### `broadcastNumber`

* Number of peers to broadcast to in the peer to peer networking.
* Type: `16BitInteger`
* Minimum: 1
* Factomd argument: `broadcastnum`

#### `controlPanelMode`

* Controls the behavior of the control panel.
* Type: `string`
* Enum: `disabled`, `readonly`, `readwrite`
* Factomd option: `ControlPanelSetting`

#### `controlPanelPort`

* The port the control panel server should listen on.
* Type: `tcpPort`
* Factomd option: `ControlPanelPort`

#### `corsDomains`

* Configures CORS for the API port. Accepts one or more allowed hostnames
or a single wildcard `*`.
* Type: `array`
* Items:
  * Type: `hostname`
* Factomd option: `CorsDomains`

#### `customBootstrapIdentity`

* The custom bootstrap identity used when `network: custom` is enabled.
* Type: `hexId`
* Factomd option: `CustomBootstrapIdentity`

#### `customBootstrapKey`

* The custom bootstrap key used when `network: custom` is enabled.
* Type: `hexId`
* Factomd option: `CustomBootstrapKey`

#### `customExchangeRateAuthorityPublicKey`

* The exchange rate key used when `network: custom` is enabled.
* Type: `hexId`
* Factomd option: `ExchangeRateAuthorityPublicKey`

#### `customNetworkId`

* The custom network id used when `network: custom` is enabled.
* Type: `string`
* Max length: 20
* Factomd argument: `customnet`

#### `customNetworkPort`

* The peer-to-peer port used when `network: custom` is enabled.
* Type: `tcpPort`
* Factomd option: `CustomNetworkPort`

#### `customSeedUrl`

* The seed URL used when `network: custom` is enabled.
* Type: `uri`
* Factomd option: `CustomSeedURL`

#### `customSpecialPeers`
* The special peers list used when `network: custom` is enabled.
* Type: `array`
* Items:
  * Type: `ipAddressAndPort`
* Factomd option: `CustomSpecialPeers`

#### `directoryBlockInSeconds`

* The duration of the directory block in seconds.
* Type: `16BitInteger`
* Factomd option: `DirectoryBlockInSeconds`

#### `fastBoot`

* Enable/disable fast boot functionality.
* Type: `boolean`
* Factomd option: `FastBoot`

#### `faultTimeoutInSeconds`

* Seconds before Federated servers are considered at-fault.
* Type: `16BitInteger`
* Factomd argument: `faulttimeout`

#### `identityChainId`

* Identification chain for the server.
* Type: `hexId`
* Factomd option: `IdentityChainID`

#### `localNetworkPort`

* The peer-to-peer port used when `network: local` is enabled.
* Type: `tcpPort`
* Factomd option: `LocalNetworkPort`

#### `localSeedUrl`

* The seed URL used when `network: local` is enabled.
* Type: `uri`
* Factomd option: `LocalSeedURL`

#### `localSpecialPeers`

* The special peers list used when `network: local` is enabled.
* Type: `array`
* Items:
  * Type: `ipAddressAndPort`
* Factomd option: `LocalSpecialPeers`

#### `logLevel`

* Controls the verbosity of log output.
* Type: `string`
* Enum: `none`, `debug`, `info`, `warning`, `error`, `fatal`, `panic`
* Factomd argument: `loglvl`

#### `mainNetworkPort`

* The peer-to-peer port used when `network: main` is enabled.
* Type: `tcpPort`
* Factomd option: `MainNetworkPort`

#### `mainSeedUrl`

* The seed URL used when `network: main` is enabled.
* Type: `uri`
* Factomd option: `MainSeedURL`

#### `mainSpecialPeers`

* The special peers list used when `network: main` is enabled.
* Type: `array`
* Items:
  * Type: `ipAddressAndPort`
* Factomd option: `MainSpecialPeers`

#### `network`

* The network to connect to.
* Type: `string`
* Enum: `custom`, `local`, `main`, `test`

#### `networkProfile`

* Selects a predefined group of network-specific settings.
* Type: `string`
* Enum: `mainnet`, `testnet`

#### `nodeName`

* The name of the node. Displayed in the control panel.
* Type: `string`
* Factomd argument: `nodename`

#### `roleProfile`

* Selects a predefined group of role-specific settings.
* Type: `string`
* Enum: `authority`

#### `specialPeersDialOnly`

* Only dial out to nodes on the special peers list.
* Type: `boolean`
* Factomd argument: `exclusive`

#### `specialPeersOnly`

* Only communicate with nodes on the special peers list.
* Type: `boolean`
* Factomd argument: `exclusiveIn`

#### `startDelayInSeconds`

* Seconds before message processing is started.
* Type: `16BitInteger`
* Factomd argument: `startdelay`

#### `testNetworkPort`

* The peer-to-peer port used when `network: test` is enabled.
* Type: `tcpPort`
* Factomd option: `TestNetworkPort`

#### `testSeedUrl`

* The seed URL used when `network: test` is enabled.
* Type: `uri`
* Factomd option: `TestSeedURL`

#### `testSpecialPeers`

* The special peers list used when `network: test` is enabled.
* Type: `array`
* Items:
  * Type: `ipAddressAndPort`
* Factomd option: `TestSpecialPeers`

#### `tlsEnabled`

* Enables TLS on both the API and Control Panel ports.
* Type: `boolean`
* Factomd option: `FactomdTlsEnabled`

#### `tlsPrivateKey`

* Private key used to enable TLS on the API and Control Panel ports.
* Type: `pemData`
* Factomd option: `FactomdTlsPrivateKey`

#### `tlsPublicCert`

* Public certificate used to enable TLS on the API and Control Panel ports.
* Type: `pemData`
* Factomd option: `FactomdTlsPublicCert`
