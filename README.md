# factomd-docker

This is a Docker image containing the Factom Protocol daemon.

**Features:**

  * Simple, YAML-based configuration
  * Rigorous JSON Schema validation
  * Restarting container refreshes all config
  * Kubernetes-ready
  * Runs as non-root user

## Image Name and Tags

The basename of the image is:
```
bedrocksolutions/factomd
```

The following tags are available:

* `v6.3.2`
* `v6.3.2-rc3`
* `v6.3.1-rc1-anchors`
* `v6.3.1`
* `v6.3.1-rc2`
* `v6.3.1-rc1`

## Volumes

The container expects two volumes to be mounted at startup:

### `/app/config`
  * A directory containing one or more YAML configuration files.

### `/app/database`
  * A directory containing either 1) an existing Factom blockchain database,
   or 2) nothing.
   
These volumes can be bind mounted or docker volumes can be used.
   
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

## `network`

The `network` setting is special, and works differently from the `Network` setting in
`factomd.conf`. It combines the functionality of the following factomd settings:

* `Network` config file option / `network` command line argument
* `customnet` command line argument

To specify the mainnet or local networks, set `network` to `MAIN` or `LOCAL`
respectively. To enable a custom network, such as the testnet network, set
`network` to the name of the custom network. For testnet, that would be
`fct_community_test`.

## Presets

The purpose of a preset is to group settings together and give that group a name. There are
two broad categories of presets:

  * Presets created by the user
  * Presets included in this image
  
User-created presets allow users to simplify and clarify their configuration. Predefined-presets
eliminate common, community-wide configuration errors. Both categories enable easy toggling 
of the presets on and off, and both categories are used in exactly the same way.

There are also two different types of presets: 

  * Network presets
  * Role presets

### Network Presets

Network presets provide a way to assign settings to a given Factom network, such as `MAIN`,
`LOCAL`, or a `CUSTOM` network, such as the testnet network, `fct_community_test`.

Network presets involve the use of two configuration options: `network` and `networkDefinitions`:
  * Presets are defined under the `networkDefinitions` object.
  * Setting the `network` to match a name listed under `networkDefinitions` activates 
  the preset.

```yaml
network: MAIN

networkDefinitions:
  MAIN:
    controlPanelName: Mainnet Node
  fct_community_test:
    controlPanelName: Testnet Node
```
would result in `controlPanelName` being set to `Mainnet Node`.

Settings activated under the `networkDefinitions` key take precedence over settings
at the top level. The following:
```yaml
network: fct_community_test
faultTimeout: 15m

networkDefinitions:
  MAIN:
    faultTimeout: 5m
  fct_community_test:
    faultTimeout: 10m
```
would result in `faultTimeout` being set to 10 minutes.

#### Predefined network presets

There is a single, predefined network preset: `fct_community_test`.
It is defined as:
```yaml
networkDefinitions:
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

### Role Presets

Role presets allow groups of settings to be defined, and then zero or more of those
groups can be activated at the same time. In other words, more than one role preset may
be active at once. This is in contrast to network presets, where only one preset at a time
may be activated.

Role presets involve the use of two configuration options: `roles` and `roleDefinitions`:
  * Presets are defined under the `roleDefinitions` object.
  * Roles are activated by adding them to the `roles` array.

```yaml
network: fct_community_test

roles: 
  - longBoot
  - serverIdentity1

roleDefinitions:
  quickBoot:
    startDelay: 30s
  longBoot:
    startDelay: 10m
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
container as the first and only command line argument. Example:
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
* `uriReference`: A relative path, fragment, or any other style of URI 
reference. Examples:
  * `https://foo.com`
  * `/foo/bar.html`
  * `../foo.html`

### Options

Currently, the best way to learn about the options is to 
[look at the schema](./confz.d/schema.yaml). Once things settle down, the various options
will be fully documented here.

## Examples

### Brain swap

For this example, assume there are three testnet nodes. Two of them are authority
nodes, and the third is a backup used for brainswapping. The first step is to create
a config file that all three will use:
```yaml
network: fct_community_test
identityActivationHeight: 0
roles:
  - TESTNET_AUTHORITY
#  - cantaloupeIdentity
#  - watermellonIdentity 
roleDefinitions:
  cantaloupeIdentity:
    identityChain: 0cc8f0ed06079f800763f806cf180735da8f16adcad25e2efb541d2ed5bf0e19
    identityPrivateKey: 6284249f0b043e20eab4fa3d6e475e552b878414cee1a0d69d41a84912246a21
    identityPublicKey: a3ee2142374c0b3568a469a936898e489fbf24a18daa65d8ae551186c1288f44
  watermellonIdentity:
    identityChain: e797706c2e59c15d341745d61937f51b885b16ec55a81cc2e43842d3dead8de6
    identityPrivateKey: d945cdd82b75f89502cc18e47afaa130eca56a7d29bff144fa0c2715773dbba1
    identityPublicKey: c2ee8f46785d8d73dc468cfea80246ba0949f75aea7451cd89d83af7bab1d629
```
This config file can now be copied onto all three servers. On each authority server, the file
should be edited and the appropriate identity role should be uncommented. For example, on
`cantaloupe-server`, edit the `roles` setting:
```yaml
roles:
  - TESTNET_AUTHORITY
  - cantaloupeIdentity
#  - watermellonIdentity 
```
Do the same on the `watermellon-server` and start all three servers. The
start command would look similar to the following:
```
docker run \
-p 8110:8110 -p 8090:8090 \
-v /path/to/config/dir:/app/config \
-v /path/to/db/dir:/app/database
bedrocksolutions/factomd:v6.3.2
```

#### Initiating the brain swap

A brain swap will involve commenting or uncommenting the correct role, and setting the
`identityActivationHeight` to an upcoming block height. To move the `cantaloupe` identity
from the leader to the backup at block 12345 would require two files be edited. On the 
leader, the config should be:
```yaml
identityActivationHeight: 12345
roles:
  - TESTNET_AUTHORITY
#  - cantaloupeIdentity
#  - watermellonIdentity 
```
The backup config should become:
```yaml
identityActivationHeight: 12345
roles:
  - TESTNET_AUTHORITY
  - cantaloupeIdentity
#  - watermellonIdentity 
```
At block 12345 the identity will move from the leader to the backup.

### Multi-file configuration

Splitting the configuration up into multiple files often makes sense.
For example, having a `common.yaml` file that contains configuration
that is shared between multiple servers, and a `local.yaml` file that
has server-specific configuration, can make things easier to understand.

An example `common.yaml` might contain all of the identities and other
shared config:
```yaml
# common.yaml
network: MAIN
roleDefinitions:
  authority1:
    identityChain: 0cc8f0ed06079f800763f806cf180735da8f16adcad25e2efb541d2ed5bf0e19
    identityPrivateKey: 6284249f0b043e20eab4fa3d6e475e552b878414cee1a0d69d41a84912246a21
    identityPublicKey: a3ee2142374c0b3568a469a936898e489fbf24a18daa65d8ae551186c1288f44
  authority2:
    identityChain: e797706c2e59c15d341745d61937f51b885b16ec55a81cc2e43842d3dead8de6
    identityPrivateKey: d945cdd82b75f89502cc18e47afaa130eca56a7d29bff144fa0c2715773dbba1
    identityPublicKey: c2ee8f46785d8d73dc468cfea80246ba0949f75aea7451cd89d83af7bab1d629
```
The `local.yaml` would then only need to contain the part of the config that
differs between servers:
```yaml
# local.yaml on authority1
identityActivationHeight: 0
roles:
  - MAINNET_AUTHORITY # built-in role
  - authority1 # role defined in common.yaml
```
All programmatic file editing, using tools such as Ansible and Terraform, can
then target just the `local.yaml` file, and leave the `common.yaml` file
untouched.