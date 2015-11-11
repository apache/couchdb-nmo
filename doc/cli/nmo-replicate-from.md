nmo-replicate-from(1) -- replicate a database from the cluster to another CouchDB database url
===========================================

## SYNOPSIS

    nmo replicate-from <cluster> <databasename> <url/dbname> [--continuous] [--create-target] [--json]
    nmo replicate-from <url> <databasename> <url/dbname> [--continuous] [--create-target] [--json]


## DESCRIPTION

Replicate a database from the `cluster` to the supplied CouchDB instance url and database. Or it will replicate from a CouchDB url and database to the supplied CouchDB instance url and database.


Example:

This will replicate the database `hello-database` from the cluster `mycluster` to the supplied url
    nmo replicate-from mycluster hello-database http://192.0.0.1/hello-database-replicated

This will replicate the database `hello-database` from the cluster `mycluster` to the supplied url and create the target and make it a continuous replication
    nmo replicate-from mycluster hello-database http://192.0.0.1/hello-database-replicated --create-target --continuous

This will replicate the database `hello-database` from the url `http://my-couchdb-cluster.com` to the supplied url
    nmo replicate-from http://my-couchdb-cluster.com hello-database http://192.0.0.1/hello-database-replicated
