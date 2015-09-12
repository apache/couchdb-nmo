nmo-couch-config(1) -- Set/Get CouchDB configuration for a cluster
==================================================================

## SYNOPSIS

    nmo couch-config get <cluster> [<key>][--json]
    nmo couch-config set <cluster> <section> <key> <value>

## DESCRIPTION

- get:

Gets the set configuration for the whole cluster or a specified node.
If a key is specified it will only get the configuration for that section

- set:

Set the value for a given key of a section of the config. This will update
the config for all nodes in a cluster. The cluster must be specified in the
.nmorc file.

## EXAMPLE

    nmo couch-config get mycluster
    nmo couch-config get mycluster couch_httpd_auth

    nmo couch-config set mycluster uuids max_count 2000
