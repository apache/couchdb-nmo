nmo-query(1) -- Query Mango
===========================================

## SYNOPSIS

    nmo query cluster <database> create <fields> [--json]
    nmo query cluster <database> <selector> [--json]

## DESCRIPTION

Create and query CouchDB Mango indexes.

This will create an index with three fields
    nmo query mycluster database create name,surname,age

This will query an index
    nmo query mycluster database '{"selector": {"_id": {"$gt":null}}}'
