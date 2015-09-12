nmo-import-csv(1) -- Bulk import CSV files
==========================================

## SYNOPSIS

    nmo import-csv <file> <couchdb-url> [--delimiter=','] [--columns=true]

## DESCRIPTION

Imports a csv file into CouchDB.

## CONFIGURATION:

  delimiter
    * Default: ','
    * Type: String

    The csv delimiter

  columns
    * Default: true
    * Type: Boolean

    Whether to use the first row of the csv to define the key fields for
    each document


## EXAMPLE

    nmo import-csv /path/to/csv http://couch-url --columns=true
