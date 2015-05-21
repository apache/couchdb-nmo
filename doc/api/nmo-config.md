nmo-config(3) -- configuration
==============================

## SYNOPSIS

    nmo.commands.config.set(section, key, value)
    nmo.commands.config.get([section], [key])



## DESCRIPTION

Manage the nmo configuration.

  - set:

Sets key/value for sections in the configration file. The file is
automatically saved. Returns a promise.

  - get:

Get the whole config (no argument provided), sections (section
argument provided), or a  key/value pair inside a asection.
Sync!
