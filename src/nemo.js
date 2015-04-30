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

const commandFuncs = {};
nemo.load = function load () {
  return new Promise((resolve, reject) => {
    config
      .load()
      .then((config) => {

        nemo.config = config;

        commands.forEach((cmd) => {
          commandFuncs[cmd] = require('./' + cmd + '.js');
        });

        resolve(nemo);
      }).catch((err) => {
        reject(err);
      });
  });
};

export default nemo;
