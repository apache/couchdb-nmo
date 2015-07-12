# nmo

`nmo` is a cli tool to manage CouchDB clusters and nodes.

## Installation

```
npm install -g nmo
```

## Contributing

It is written in ES6 and is using promises and generators for control
flow. We are aiming for 100% test coverage.

Production dependencies are checked in for multiple reasons:

 - blazing fast installs for our users as they are defined as
   `bundledDependencies` in the `package.json` file and npm just
   downloads one tarball
 - if a package gets deleted on the registry, `nmo` still works for
   new installs
 - every contributor has the same version of a module

## Help

[http://robertkowalski.github.io/nmo/](http://robertkowalski.github.io/nmo/)
