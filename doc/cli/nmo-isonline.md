nmo-isonline(1) -- check if a cluster node is online
====================================================

## SYNOPSIS

    nmo isonline <url> [<url>, <url> ...] [--json]
    nmo isonline <cluster> [--json]


## DESCRIPTION

  <url>:
Check if one or several nodes are currently online or available.

  <cluster>:
If a cluster is defined in the nmo config file it will then check that each node
in that cluster is online

It will print the result as colored output. JSON output is also
supported by passing the `--json` flag.
