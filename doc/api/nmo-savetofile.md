nmo-savetofile(3) -- activetasks
==============================

## SYNOPSIS

    nmo.commands.savetofile([<url> || <cluster>], [database], [filename])


## DESCRIPTION

Save the database found at the specified `database` found at `url` or `cluster` to the `filename`.
If `compress` is true in the config it will gzip the file as well.
