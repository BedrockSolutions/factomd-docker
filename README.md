# factomd-docker

This is a Docker image containing the Factom Protocol daemon.

**Features:**

  * Simple, YAML-based configuration
  * Rigorous JSON Schema validation
  * Kubernetes-ready
  * Runs as non-root user

## The Basics

### Volumes

The container expects two volumes to be mounted at startup:

#### `/app/database`
  * A folder containing either 1) an existing Factom blockchain,
   or 2) nothing.
   
#### `/app/values`
  * A folder containing one or more YAML configuration files.

### Configuration

Configuration is stored in one or more YAML files and injected into the
container under `/app/values`. Most deployments
will simply put all configuration into a single file. This set up works 
for the majority of cases,
but there are times when it makes sense to break the configuration up
into multiple files. For example, when running an authority node, server
keys might be stored in one file while the remainder of the config
is kept in another file.

A couple of points:

  * All config file names must end with either `.yml` or `.yaml` or
  the file will be skipped.
  * A configuration file can be disabled by simply renaming it to a
  different suffix, such as `myconfig.yaml.disabled`.
  * Subfolders within `/app/values` are allowed and will be
  recursively scanned.
  * All config files are merged together to create the final configuration.
  * Both `factomd.conf` and command line arguments are set via the same 
  YAML configuration.
  
### Commands

The container accepts several commands. These commands are passed to the
container as the first and only command argument. Example:
```bash
docker run \
  --name factomd
  -v /path/to/db:/app/database \
  -v /path/to/config:/app/values \
  -p 8108:8108
  bedrocksolutions/factomd:<tag> [command]
```

## Configuration Syntax


#### start

This is the default command. It processes the configuration, establishes
a watcher process to monitor the configuration for changes, and starts
`factomd`.

#### config

Dumps the generated `factomd.conf` and command line parameters to console.
Very useful for debugging.

#### schema

Dumps the JSON Schema used for validating the YAML configuration to
console. Can be useful when debugging validation errors or when trying
to remember the YAML file syntax.

#### shell

For use when a shell into the container is desired.

#### values

Dumps the merged YAML configuration to console.



Extension of the base factomd image. Features: 

  * The factomd process no longer runs as root.
  
  * The server private key can be passed via an environment variable.
  
  * Dovetails nicely with the Helm chart listed below.

## Useful Links

  * [Factomd Helm Chart](https://github.com/BedrockSolutions/helm/tree/master/factomd)
      
  * [Base Image](https://hub.docker.com/r/factominc/factomd)

## Supported tags and Dockerfile links

* [`latest` (*Dockerfile*)](https://github.com/BedrockSolutions/dockerfile/blob/master/factomd/Dockerfile)

* [`0.1.0` (*Dockerfile*)](https://github.com/BedrockSolutions/dockerfile/blob/factomd-0.1.0/factomd/Dockerfile)
  
## Volumes

Two volumes must be attached:

### Database Volume

* **`/home/factomd/.factom/m2`**: Mount a suitable volume here for storage of the blockchain 
database.

### Configuration Volume

* **`/home/factomd/.factom/private`**: Mount a directory here that contains the `factomd.conf`
configuration file.

## Environment variables

The image can accept a single, optional, environment variable:

* **`LOCAL_SERVER_PRIVATE_KEY`**: The server identity's private key 

In order for that environment variable to make its way into the configuration, the `factomd.conf`
configuration file must have the `LocalServerPrivKey` set as follows:
```
LocalServerPrivKey=${LOCAL_SERVER_PRIVATE_KEY}
```
