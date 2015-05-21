nmo-faq(7) -- Frequently Asked Questions
========================================

## Where are my clusters and config stored?

We store them in a file called .nmorc in your $HOME. My config is in:

    /Users/robert/.nmorc

Never expose your nmoconf to untrusted persons, as it contains your
node passwords (if your nodes are not in party mode).

## How does setting up a cluster work?

First, add your nodes to the cluster (assuming your user/pw is
foo/bar) and you want to name your cluster `mycluster`:

    nmo cluster add node1 http://foo:bar@example.com mycluster
    nmo cluster add node2 http://foo:bar@example.org mycluster
    nmo cluster add node3 http://foo:bar@node3.example.org mycluster

Then join them to a cluster:

    nmo cluster join mycluster
