# factomd-docker

This is a Docker image containing the Factom Protocol daemon.

**Features:**

  * Simple, YAML-based configuration
  * Rigorous JSON Schema validation
  * Kubernetes-ready
  * Runs as non-root user

## Image Name and Tags

The basename of the image is:
```
bedrocksolutions/factomd
```

The following tags are available:

* `6.3.1`: The current mainnet version of `factomd`.
* `6.3.1-rc1`: The current testnet version of `factomd`.

## Volumes

The container expects two volumes to be mounted at startup:

### `/app/config`
  * A directory containing one or more YAML configuration files.

### `/app/database`
  * A directory containing either 1) an existing Factom blockchain,
   or 2) nothing.
   
## Configuration

Configuration is stored in one or more YAML files and injected into the
container under `/app/config`. Most deployments will simply put all 
configuration into a single file. This set up works for the majority of 
cases, but there are times when it makes sense to break the configuration 
up into multiple files. For example, when running an authority node, 
server keys might be stored in one file while the remainder of the config
is kept in another file.

### Key points

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

## Network Presets

Configuration related to a specific network can be stored as a named preset
under the `networks` key. To activate the preset, simply set the `network`
key to match. For example, the following:
```yaml
network: MAIN

networks:
  MAIN:
    controlPanelName: Mainnet
  fct_community_test:
    controlPanelName: Testnet
```
would set `controlPanelName` to `Mainnet`.

Settings activated under the `networks` key take precedence over settings
at the top level. The following:
```yaml
network: fct_community_test
faultTimeout: 15m

networks:
  MAIN:
    faultTimeout: 5m
  fct_community_test:
    faultTimeout: 10m
```
would set `faultTimeout` to 10 minutes.

### Predefined network presets

There is a single, predefined network preset: `fct_community_test`.
It is defined as:
```yaml
networks:
  fct_community_test:
    blockTime: 600
    bootstrapIdentity: '8888882f5002ff95fce15d20ecb7e18ae6cc4d5849b372985d856b56e492ae0f'
    bootstrapKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae'
    identityChain: 'FA1E000000000000000000000000000000000000000000000000000000000000'
    oraclePublicKey: '58cfccaa48a101742845df3cecde6a9f38037030842d34d0eaa76867904705ae'
    p2pPort: 8110
    p2pSeed: 'https://raw.githubusercontent.com/FactomProject/communitytestnet/master/seeds/testnetseeds.txt'
```
This means that a testnet follower can be configured with only the following
config file:
```yaml
network: fct_community_test
```

## Role Presets

Configuration related to a specific server role can be stored as a named 
preset under the `roleDefinitions` key. To activate the preset, add an element to the
`roles` array that matches the name of the preset. Here is an example:
```yaml
network: fct_community_test

roles: 
  - serverIdentity1

roleDefinitions:
  serverIdentity1:
    identityChain: XXXX
    identityPrivateKey: YYYY
    identityPublicKey: ZZZZ
```

### Predefined role presets

There are two predefined role presets, defined as:
```yaml
roleDefinitions:
  MAINNET_AUTHORITY:
    p2pSpecialPeers:
      - 52.17.183.121:8108
      - 52.17.153.126:8108
      - 52.19.117.149:8108
      - 52.18.72.212:8108
    startDelay: 600
  TESTNET_AUTHORITY:
    startDelay: 600
```
This means that a mainnet authority node can be configured with only the following config file:
```yaml
network: MAIN
roles: 
  - MAINET_AUTHORITY
identityChain: XXXX
identityPrivateKey: YYYY
identityPublicKey: ZZZZ
```
An even slicker way to do it would be as follows:
```yaml
network: MAIN
roles: 
  - MAINET_AUTHORITY
  - serverIdentity1
identityActivationHeight: 12345
roleDefinitions:
  serverIdentity1:
    identityChain: XXXX
    identityPrivateKey: YYYY
    identityPublicKey: ZZZZ
```
because now the pieces are in place to do an easy brain swap.

## Commands

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

### start

This is the default command. It processes the configuration, establishes
a watcher process to monitor the configuration for changes, and starts
`factomd`.

### config

Displays the merged YAML configuration.

### files

Displays the generated start script, `factomd.conf`, and any other
generated files.

### help

Displays a help message that lists the various commands.

### schema

Displays the JSON Schema used for validating the YAML configuration. 
Useful when debugging validation errors or when trying to remember 
the YAML file syntax.

### shell

For use when a shell into the container is desired.

## Configuration Schema

All configuration passed to the container is validated against a rigorous
schema. Validation failure during container start results in immediate
failure. Validation failure during runtime logs the errors to STDOUT and
retains the previous configuration.

> Note: A subset of factomd configuration options and command line arguments are 
currently supported. If there is a needed setting missing, please
[open an issue](https://github.com/BedrockSolutions/factomd-docker/issues).

### Custom Data Types

The following custom data types are used within the YAML config file(s), in addition to the
usual standard types:

* `256BitHex`: A 64-character hexadecimal string. Example:
  * `38bab1455b7bd7e5efd15c53c777c79d0c988e9210f1da49a99d95b3a6417be9`
* `32BitInteger`: An integer between 0 and 4294967295. Example:
  * `4096`
* `block`: An integer between 0 and 9999999. Example:
  * `194142`
* `duration`: A length of time. Can be specified as either a `32BitInteger`
number of seconds, or as a string. String values have a single character
suffix that specifies the units. Allowed suffixes are `[s, m, h, d]`.
Examples:
  * `600`
  * `600s`
  * `10m`
* `hostname`: A standard Internet hostname. Example:
  * `www.foo.com`
* `ipAddressAndPort`: A IPv4 address and port, separated by a `:`. 
Example:
  * `12.34.56.78:9000`
* `pemData`: Standard Privacy Enhanced Mail format data. Example:
  * ```
    -----BEGIN CERTIFICATE-----
    MIIDXjCCAkYCCQCcHTMVrEHBczANBgkqhkiG9w0BAQsFADBxMQswCQYDVQQGEwJV
    UzETMBEGA1UECAwKV2FzaGluZ3RvbjETMBEGA1UEBwwKQmVsbGluZ2hhbTEaMBgG
    A1UECgwRQmVkcm9jayBTb2x1dGlvbnMxHDAaBgNVBAMME2JlZHJvY2tzb2x1dGlv
    bnMuaW8wHhcNMTkwNTIxMTczNTEyWhcNMjAwNTIwMTczNTEyWjBxMQswCQYDVQQG
    EwJVUzETMBEGA1UECAwKV2FzaGluZ3RvbjETMBEGA1UEBwwKQmVsbGluZ2hhbTEa
    -----END CERTIFICATE-----
  ```
* `unprivilegedPort`: Unprivileged TCP or UDP port in the range 1025-65535
  * Example: `8080`
* `uri`: An absolute URI, with protocol. Example:
  * `https://api.bar.com/foo`
* `uri-reference`: A relative path, fragment, or any other style of URI 
reference. Examples:
  * `https://foo.com`
  * `/foo/bar.html`
  * `../foo.html`

### Options

Currently, the best way to learn about the options is to 
[look at the schema](./confz.d/schema.yaml). Once things settle down, the various options
will be fully documented here.
