nemo-config(1) - manage nemo's configuration
============================================

### SYNOPSIS

    nemo config get [<section>], [<key>] [--json]
    nemo config set <section>, <key>, <value>


### DESCRIPTION

 - set:

Set a value in nemo's configuration. You must provide a section
(e.g. `config`), a key and a value.

Example:

    nemo config set nemo json true

This will enable json output permanently.


 - get:

Print sections or values inside sections from the configuration file.

It will print the result as colored output. JSON output is also
supported by passing the `--json` flag.
