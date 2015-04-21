nemo-is-online(3) - check if a cluster node is online
=====================================================

### SYNOPSIS

    nemo.commands.isonline(url, [url], ..., opts)


### DESCRIPTION

Check if nodes are online / available on the current network.

The command takes multiple url arguments for checking multiple nodes
at once. The url must be a `String`. The last argument must be an
`Object` providing options.

The command returns a promise which will return an `Object` where the
keys are the provided urls and the values have the type `Boolean`.
`true` indicates an online, available node.

### Options

#### json

If `json` is `true` the output is logged to stdout console as json
output.

#### silent

If the option `silent` is `true`, no output will be logged to stdout.
