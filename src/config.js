import cc from 'config-chain';
import ini from 'ini';
import fs from 'fs';
import xtend from 'xtend';
import Promise from 'bluebird';

import nemo from './nemo.js';

const readFile = Promise.promisify(fs.readFile);
let cfg;

export default function config (cmd, ...args) {
  if (!cmd) {
    return get();
  }

  if (cmd === 'set') {
    return exports[cmd].apply(exports[cmd], args);
  }

  let opts = {silent: false, json: false};
  if (typeof args[args.length -1] === 'object') {
    opts = xtend(opts, args.pop());
  }

  let [section, key] = args;
  opts.silent = false;

  return exports[cmd].apply(exports[cmd], [section, key, opts]);
}

export const load = function load (conf = '.nemorc', nopts = {}) {
  const confFile = cc.find(conf);
  return new Promise((resolve, reject) => {
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

export const get = function get (section, key, opts = {silent: false, json: false}) {

  return new Promise((resolve, reject) => {
    let data;

    if (!section && !key) {
      data = cfg.sources.config.data;
    }

    if (section && !key) {
      data = cfg.sources.config.data[section];
    }

    if (section && key) {
      data = cfg.sources.config.data[section][key];
    }

    if (typeof data === 'string') {
      if (opts.json) {
        data = {[key]: data};
      }
      if (!opts.silent) {
        console.log(data);
      }

      return resolve(data);
    }

    if (opts.json) {
      if (!opts.silent) {
        console.log(data);
      }

      return resolve(data);
    }

    if (!data) {
      return console.log(data);
    }

    const parsed = ini.stringify(data);

    if (!opts.silent) {
      console.log(parsed);
    }

    return resolve(data);
  });
};
