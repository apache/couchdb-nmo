nemo-cluster(3) - manage clusters
=================================

### SYNOPSIS

    nemo.commands.cluster.add(node, url, cluster)
    nemo.commands.cluster.get([clustername], [node])
    nemo.commands.cluster.join(clustername)


### DESCRIPTION

Manage clusters.

  - add:

Add a node to a cluster in the nemo configuration file. Overwrites
nodes with the same name in the same cluster.

Example:

    var node = 'mycustomnodename';
    var url = 'http://user:pw@192.168.1.42';
    var cluster = 'myfirstcluster';
    nemo.commands.cluster.add(node, url, cluster)

  - get:

Get all clusters, one specific cluster or just one node or just one
the values for one node.

Example:

    nemo.commands.cluster.get('myfirstcluster')

  - join:

Join nodes into a fully operational cluster.

Example:

    nemo.commands.cluster.join('myfirstcluster')

