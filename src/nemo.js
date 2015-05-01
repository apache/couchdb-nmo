import * as config from './config.js';

const commands = [
  'isonline',
  'help',
  'config'
];

const nemo = {
  config: null
};

Object.defineProperty(nemo, 'commands', {
  get: () => {
    if (nemo.config === null) {
      throw new Error('run nemo.load before');
    }
    return commandFuncs;
  }
});

Object.defineProperty(nemo, 'cli', {
  get: () => {
    if (nemo.config === null) {
      throw new Error('run nemo.load before');
    }
    return cliFuncs;
  }
});

const commandFuncs = {}, cliFuncs = {};
nemo.load = function load (opts) {
  return new Promise((resolve, reject) => {
    config
      .load(opts)
      .then((config) => {
        nemo.config = config;

        commands.forEach((cmd) => {
          const mod = require('./' + cmd + '.js');
          commandFuncs[cmd] = mod.default ? mod.default : mod;
          cliFuncs[cmd] = mod.cli;
        });

        resolve(nemo);
      }).catch((err) => {
        reject(err);
      });
  });
};

export default nemo;
