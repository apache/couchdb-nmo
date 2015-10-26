nmo-replicate-to(1) -- replicate a database to the cluster from another CouchDB database url
===========================================

## SYNOPSIS

    nmo replicate-to <cluster> <databasename> <url/dbname> [--continuous] [--create-target] [--json]
    nmo replicate-to <url> <databasename> <url/dbname> [--continuous] [--create-target] [--json]


## DESCRIPTION

Replicate a database to the `cluster` from the supplied CouchDB instance url and database. Or it will replicate from a CouchDB url and database to the supplied CouchDB instance url and database.


Example:

This will replicate the database `hello-database` from the url to database `hlloe-database-replicated` in cluster `mycluster`.
    nmo replicate-to mycluster hello-database-replicated http://192.0.0.1/hello-database

This will replicate the database `hello-database` to the cluster `mycluster` and create the database and make it a continuous replication
    nmo replicate-to mycluster hello-database-replicated http://192.0.0.1/hello-database --create-target --continuous

This will replicate the database `hello-database` to the url `http://my-couchdb-cluster.com` from the supplied url
    nmo replicate-from http://my-couchdb-cluster hello-database-replicated http://192.0.0.1/hello-database
