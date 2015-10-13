nmo-savetofile(1) -- save database to file
===========================================

## SYNOPSIS

    nmo savetofile cluster database file [--compress]
    nmo activetasks url database file [--compress]


## DESCRIPTION

Save a database's _all_docs to disk. If `--compress` is added the file will be gzipped.

Example:

This will save the database named `my-db` to the file named `my-data-dump.json`
    nmo save mycluster my-db my-data-dump.json

This will save the database and compress it.
    nmo save mycluster my-db my-data-dump.json --compress
