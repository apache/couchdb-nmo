## how to use nemo?

Take a look at our video

<iframe>

</iframe>

### Content from the video

```
# check if node is online
nemo isonline http://foo:bar@localhost:15984

# create a cluster config for the cluster anemone
nemo cluster add node1 http://foo:bar@localhost:15984 anemone
nemo cluster add node2 http://foo:bar@localhost:25984 anemone
nemo cluster add node3 http://foo:bar@localhost:35984 anemone

# check config
nemo cluster

# we support json!
nemo cluster --json
nemo isonline http://foo:bar@localhost:15984 --json

# join cluster
nemo cluster join anemone

# try again
nemo cluster join anemone
```
