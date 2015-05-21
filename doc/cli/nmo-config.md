nmo-config(1) -- manage nmo's configuration
===========================================

## SYNOPSIS

    nmo config get [<section>], [<key>] [--json]
    nmo config set <section>, <key>, <value>


## DESCRIPTION

 - set:

Set a value in nmo's configuration. You must provide a section
(e.g. `config`), a key and a value.

Example:

    nmo config set nmo json true

This will enable json output permanently.


 - get:

Print sections or values inside sections from the configuration file.
JSON output is also supported by passing the `--json` flag.
