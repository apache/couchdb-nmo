## how to use nmo?

Take a look at the video:

<iframe width="560" height="315" src="//www.youtube.com/embed/V_nChYFPixc" frameborder="0" allowfullscreen></iframe>

### Content from the video

```
# check if node is online
nmo isonline http://foo:bar@localhost:15984

# create a cluster config for the cluster anemone
nmo cluster add node1 http://foo:bar@localhost:15984 anemone
nmo cluster add node2 http://foo:bar@localhost:25984 anemone
nmo cluster add node3 http://foo:bar@localhost:35984 anemone

# check config
nmo cluster

# we support json!
nmo cluster --json
nmo isonline http://foo:bar@localhost:15984 --json

# join cluster
nmo cluster join anemone

# try again
nmo cluster join anemone
```
