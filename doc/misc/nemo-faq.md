nemo-faq(7) - Frequently Asked Questions
========================================

## Where are my clusters and config stored?

We store them in a file called .nemorc in your $HOME. My config is in:

    /Users/robert/.nemorc

Never expose your nemoconf to untrusted persons, as it contains your
node passwords (if your nodes are not in party mode).

## How does setting up a cluster work?

First, add your nodes to the cluster (assuming your user/pw is
foo/bar) and you want to name your cluster `mycluster`:

    nemo cluster add node1 http://foo:bar@example.com mycluster
    nemo cluster add node2 http://foo:bar@example.org mycluster
    nemo cluster add node3 http://foo:bar@node3.example.org mycluster

Then join them to a cluster:

    nemo cluster join mycluster
