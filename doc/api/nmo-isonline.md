nmo-isonline(3) -- check if a cluster node is online
====================================================

## SYNOPSIS

    nmo.commands.isonline(url, [url], ...)
    nmo.commands.isonline(cluster,...)


## DESCRIPTION

Check if nodes are online / available on the current network.

url:
The command takes multiple url arguments for checking multiple nodes
at once. The url must be a `String`. The last argument must be an
`Object` providing options.

cluster:
The command looks up the nodes defined in the config file for a given cluster
and will check whether is node is online

The command returns a promise which will return an `Object` where the
keys are the provided urls and the values have the type `Boolean`.
`true` indicates an online, available node.
