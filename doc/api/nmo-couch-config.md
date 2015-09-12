nmo-couch-config(3) -- configuration of a CouchDB cluster
=========================================================

## SYNOPSIS

    nmo.commands['couch-config'].set(cluster, nodes, section, key, value)
    nmo.commands['couch-config'].get(cluster, nodes, [section])



## DESCRIPTION

Manage the CouchDB configuration.

  - set:

Sets the value for a key of a CouchDB config section for each node in
a cluster.

  - get:

Gets the config for each node in a cluster and displays it for easy
viewing
