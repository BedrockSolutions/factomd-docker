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
