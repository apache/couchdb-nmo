//This needs to go here so that the polyfill
//is used when the cli loads and the tests
require('babel/polyfill');

import * as config from './config.js';
import Promise from 'bluebird';
import pkg from '../package.json';

const commands = [
  'isonline',
  'help',
  'config',
  'cluster',
  'v',
  'import-csv',
  'couch-config',
  'activetasks'
];

const nmo = {
  config: null
};

nmo.version = pkg.version;
const commandFuncs = {}, cliFuncs = {};

Object.defineProperty(nmo, 'commands', {
  get: () => {
    if (nmo.config === null) {
      throw new Error('run nmo.load before');
    }
    return commandFuncs;
  }
});

Object.defineProperty(nmo, 'cli', {
  get: () => {
    if (nmo.config === null) {
      throw new Error('run nmo.load before');
    }
    return cliFuncs;
  }
});

nmo.load = function load (opts) {
  return new Promise((resolve, reject) => {
    config
      .load(opts)
      .then((config) => {
        nmo.config = config;

        commands.forEach((cmd) => {
          const mod = require('./' + cmd + '.js');
          commandFuncs[cmd] = mod.default ? mod.default : mod;
          cliFuncs[cmd] = mod.cli;
        });

        resolve(nmo);
      }).catch((err) => {
        reject(err);
      });
  });
};

export default nmo;
