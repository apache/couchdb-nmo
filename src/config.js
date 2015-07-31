import cc from 'config-chain';
import ini from 'ini';
import xtend from 'xtend';
import Promise from 'bluebird';

import nmo from './nmo.js';

let cfg;


export function cli (cmd, ...args) {
  if (!cmd) {
    return cliGet();
  }

  if (cmd === 'get') {
    cmd = 'cliGet';
  }

  if (!exports[cmd]) {
    const msg = [
      'Usage:',
      '',
      'nmo config get [<section>], [<key>] [--json]',
      'nmo config set <section>, <key>, <value>'
    ].join('\n');
    const err = new Error(msg);
    err.type = 'EUSAGE';

    throw err;
  }

  return exports[cmd].apply(exports[cmd], args);
};

export const load = function load (nopts = {nmoconf: '.nmorc'}) {
  return new Promise((resolve, reject) => {
    cfg = cc(nopts)
      .addFile(nopts.nmoconf, 'ini', 'config')
      .on('load', () => {
        resolve(cfg);
      }).on('error', reject);
  });
};

export const set = function set (section, key, value) {
  return new Promise((resolve, reject) => {
    if (!section || !key || !value) {
      const err = new Error('please provide a section, key and value');
      err.type = 'EUSAGE';
      return reject(err);
    }

    const newValue = xtend(cfg.get(section, 'config'), {[key]: value});
    cfg.set(section, newValue, 'config');

    cfg.save('config', 'ini', () => {
      resolve();
    });
  });
};

export function get (section, key) {
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
};


export function cliGet (section, key) {
  return new Promise((resolve, reject) => {
    const data = get(section, key),
          res = handleResult(data, key);

    return resolve(res);
  });
};

export function handleResult (data, key) {
  const jsonOut = nmo.config.get('json');

  if (typeof data === 'string') {
    if (jsonOut) {

      data = {[key]: data};
    }

    return data;
  }

  if (jsonOut) {
    console.log(data);

    return data;
  }

  if (!data) {
    return console.log(data);
  }

  const parsed = ini.stringify(data);

  console.log(parsed);

  return data;
};
