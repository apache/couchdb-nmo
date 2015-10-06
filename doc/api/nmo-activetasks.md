nmo-activetasks(3) -- activetasks
==============================

## SYNOPSIS

    nmo.commands.activetasks([<url> || <cluster>], [filter])


## DESCRIPTION

Get the list of active tasks from a specified url or cluster name and filter it according to
the supplied filter.

The filter can be either the task type e.g replication, view_indexer or a
database name found in either the source, target or database field.
