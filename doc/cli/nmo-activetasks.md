nmo-activetasks(1) -- view activetasks
===========================================

## SYNOPSIS

    nmo activetasks cluster [<filter>] [--json]
    nmo activetasks url [<filter>] [--json]


## DESCRIPTION

Get the list of active tasks from a specified url and filter it according to
the supplied filter.

The filter can be either the task type e.g replication, view_indexer or a
database name found in either the source, target or database field.

Example:

This will get all the current activetasks
    nmo activetasks mycluster

This will get the replication active tasks from the CouchDB at the specified url
    nmo activetasks http://127.0.0.1:5984 replication

This will get all the current activetasks related the the datbase 'mydb'
    nmo activetasks mycluster mydb
