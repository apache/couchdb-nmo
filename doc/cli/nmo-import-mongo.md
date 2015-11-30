nmo-import-mongo(1) -- Bulk import a MongoDB collection
===========================================

## SYNOPSIS

    nmo import-mongo <clustername> <database> <MongoDB-url> <collection>
    nmo import-mongo <url> <database> <MongoDB-url> <collection>


## DESCRIPTION

Import a MongoDB collection into CouchDB.

Example:

This will import the collection `restaurants` from the MongoDB url `mongodb://localhost:27017/test` into the database
`mydatabase` in the cluster `mycluster`.

    nmo import-mongo mycluster mydatabase mongodb://localhost:27017/test restaurants

This will import the collection `restaurants` from the MongoDB url `mongodb://localhost:27017/test` into the database
`mydatabase` at the url `http://127.0.0.1:15984`.

    nmo import-mongo http://127.0.0.1:15984 mydatabase mongodb://localhost:27017/test restaurants
