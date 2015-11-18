nmo-query(3) -- Create Mango indexes or query existing ones
====================================================

## SYNOPSIS

    nmo.commands.query.run([<clusterurl> || <cluster>], <database>, selector)
    nmo.commands.query.createIndex([<clusterurl> || <cluster>], <database>, [fields])


## DESCRIPTION

### Query

`nmo.commands.query.run` is used to query against the existing mango indexes. It accepts either a `cluster` name or a url to a cluster. It also requires the name of the database and a selector json object.

e.g

        nmo.commands.query.run('mycluster', 'mydatabase', {selector: {"_id": {$gt: null}}})


### Create Index

`nmo.commands.query.createIndex` creates a new Mango index. It accepts either a `cluster` name or a url to a cluster. It also requires the name of the database and an array with the list of fields for the index

e.g

        nmo.commands.createIndex('mycluster', 'mydatabase', ['name', 'age', 'location'])
