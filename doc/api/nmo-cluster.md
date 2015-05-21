nmo-cluster(3) -- manage clusters
=================================

## SYNOPSIS

    nmo.commands.cluster.add(node, url, cluster)
    nmo.commands.cluster.get([clustername], [node])
    nmo.commands.cluster.join(clustername)


## DESCRIPTION

Manage clusters.

  - add:

Add a node to a cluster in the nmo configuration file. Overwrites
nodes with the same name in the same cluster.

Example:

    var node = 'mycustomnodename';
    var url = 'http://user:pw@192.168.1.42';
    var cluster = 'myfirstcluster';
    nmo.commands.cluster.add(node, url, cluster)

  - get:

Get all clusters, one specific cluster or just one node or just one
the values for one node.

Example:

    nmo.commands.cluster.get('myfirstcluster')

  - join:

Join nodes into a fully operational cluster.

Example:

    nmo.commands.cluster.join('myfirstcluster')

