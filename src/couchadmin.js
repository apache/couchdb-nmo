import * as config from './config.js';

const commands = [
  'isonline',
  'help',
  'config'
];

const couchadmin = {
  config: null
};

Object.defineProperty(couchadmin, 'commands', {
  get: () => {
    if (couchadmin.config === null) {
      throw new Error('run couchadmin.load before');
    }
    return commandFuncs;
  }
});

const commandFuncs = {};
couchadmin.load = function load () {
  return new Promise((resolve, reject) => {
    config.load()
      .then((config) => {

        couchadmin.config = config;

        commands.forEach((cmd) => {
          commandFuncs[cmd] = require('./' + cmd + '.js');
        });

        resolve(couchadmin);
    });
  });
};

export default couchadmin;
