nmo-import-csv(1) -- Bulk import CSV files
==========================================

## SYNOPSIS

    nmo import-csv <cluster> <database> <file> [--delimiter=','] [--columns=true]
    nmo import-csv <url> <database> <file> [--delimiter=','] [--columns=true]

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


EXAMPLE:

This will import the file `mycsv.csv` into the `mydb` database on the cluster `mycluster`. With the columns parameter set to true.
    nmo import-csv mycluster mydb mycsv.csv --columns=true

This will import the file `mycsv.csv` into the `mydb` database at the couchdb url `http://mycouchdb.com`.
    nmo import-csv http://mycouchdb.com mydb mycsv.csv --columns=true
