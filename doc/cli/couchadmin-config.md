couchadmin-config(1) - manage couchadmin's configuration
========================================================

### SYNOPSIS

    couchadmin config get [<section>], [<key>] [--json]
    couchadmin config set <section>, <key>, <value>


### DESCRIPTION

 - set:

Set a value in couchadmin's configuration. You must provide a section
(e.g. `config`), a key and a value.

Example:

    couchadmin config set couchadmin json true

This will enable json output permanently.


 - get:

Print sections or values inside sections from the configuration file.

It will print the result as colored output. JSON output is also
supported by passing the `--json` flag.
