import cc from 'config-chain';
import ini from 'ini';
import fs from 'fs';
import xtend from 'xtend';
import Promise from 'bluebird';

import nemo from './nemo.js';

const readFile = Promise.promisify(fs.readFile);
let cfg;


export const cli = configCli;
function configCli (cmd, ...args) {
  if (!cmd) {
    return cliGet();
  }

  if (cmd === 'get') {
    cmd = 'cliGet';
  }

  return exports[cmd].apply(exports[cmd], args);
}

export const load = function load (nopts = {nemoconf: '.nemorc'}) {
  return new Promise((resolve, reject) => {
    const confFile = cc.find(nopts.nemoconf || '.nemorc');

    cfg = cc(nopts)
      .addFile(confFile, 'ini', 'config')
      .on('load', () => {
        resolve(cfg);
      });
  });
};

export const set = function set (section, key, value) {
  return new Promise((resolve, reject) => {
    if (!section || !key || !value) {
      return reject(new Error('please provide a section, key and value'));
    }
    const newValue = xtend(cfg.get(section, 'config'), {[key]: value});
    cfg.set(section, newValue, 'config');
    cfg.save('config', 'ini', () => {
      resolve();
    });
  });
};

export const get = getConf;
function getConf (section, key) {
  let res;
  if (!section && !key) {
    res = cfg.sources.config.data;
  }

  if (section && !key) {
    res = cfg.sources.config.data[section];
  }

  if (section && key) {
    res = cfg.sources.config.data[section][key];
  }
  return res;
}


export const cliGet = function cliGet (section, key) {
  return new Promise((resolve, reject) => {
    let data = getConf(section, key);
    const jsonOut = nemo.config.get('json');

    if (typeof data === 'string') {
      if (jsonOut) {
        data = {[key]: data};
      }
      console.log(data);

      return resolve(data);
    }

    if (jsonOut) {
      console.log(data);

      return resolve(data);
    }

    if (!data) {
      return console.log(data);
    }

    const parsed = ini.stringify(data);

    console.log(parsed);

    return resolve(data);
  });
};
