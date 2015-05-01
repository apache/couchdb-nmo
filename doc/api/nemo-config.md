nemo-config(3) - configuration
==============================

### SYNOPSIS

    nemo.commands.config.set(section, key, value)
    nemo.commands.config.get([section], [key])



### DESCRIPTION

Manage the nemo configuration.

  - set:

Sets key/value for sections in the configration file. The file is
automatically saved. Returns a promise.

  - get:

Get the whole config (no argument provided), sections (section
argument provided), or a  key/value pair inside a asection.
Sync!
