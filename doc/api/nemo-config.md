nemo-config(3) - configuration
==============================

### SYNOPSIS

    nemo.commands.set(section, key, value)
    nemo.commands.get([section], [key], [opts])



### DESCRIPTION

Manage the nemo configuration.

  - set:

Sets key/value for sections in the configration file. The file is
automatically saved.

  - get:

Get the whole config (no argument provided), sections (section
argument provided), or a  key/value pair inside a asection. The promise
returns always JSON.


### Options

#### json

If `json` is `true` the output is logged to stdout console as json
output.

#### silent

If the option `silent` is `true`, no output will be logged to stdout.
