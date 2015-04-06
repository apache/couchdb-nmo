# isNodeOnline


### SYNOPSIS

    couchadmin.commands.isNodeOnline(url)


### DESCRIPTION

Check if a given node is online / available on the current network.

The command takes one argument: `url` - the url of the node to check as
a `String`.

The command returns a promise which will return a `Boolean` once the
promise is resolved after making the request to the node. `true`
indicates an online, available node.
