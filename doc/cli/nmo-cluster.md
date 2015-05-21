nmo-cluster(1) -- manage clusters
=================================

## SYNOPSIS

    nmo cluster get [<clustername>], [<nodename>] [--json]
    nmo cluster add <node>, <url>, <clustername>
    nmo cluster join <clustername>


## DESCRIPTION

 - add:

Add a node to a cluster in the nmo configuration file. Overwrites
nodes with the same name in the same cluster.

Example:

    nmo cluster add newnode http://user:pw@192.168.1.172 anemone

This will add a node called `newnode` available at
http://user:pw@192.168.1.172 to the cluster `anemone`.


 - get:

Print sections or values inside sections from the configuration file.
JSON output is also supported by passing the `--json` flag.


Example:

    nmo cluster get anemone --json

Will print all nodes in the cluster named anemone as JSON output.


 - join:

Joins nodes in a defined cluster-section to create a cluster


Example:

    nmo cluster join anemone

Will try to join all nodes defined in the anemone section to create a
new cluster.
