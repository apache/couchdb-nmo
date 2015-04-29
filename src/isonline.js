import * as utils from './utils.js';
import log from 'npmlog';
import request from 'request';
import Promise from 'bluebird';
import assert from 'assert';
import xtend from 'xtend';

export default isonline;

function isonline (...args) {
  let opts = {silent: false, json: false};
  if (typeof args[args.length - 1] === 'object') {
    opts = xtend(opts, args.pop());
  }

  return new Promise((resolve, reject) => {
    if (!args.length) {
      const err = new Error('Please enter an url.');
      return reject(er);
    }
    const urlPromises = args.map((url) => {
      return isNodeOnline(url);
    });

    Promise.all(urlPromises).then((results) => {
      results = results.reduce((acc, el) => {
        const key = Object.keys(el)[0];
        acc[key] = el[key];
        return acc;
      }, {});

      if (opts.silent && opts.json) {
        let msg = 'silent and json are not supported at the same time';
        const err = new Error(msg);
        return reject(err);
      }

      if (opts.silent) {
        return resolve(results);
      }

      if (opts.json) {
        console.log(results);
        return resolve(results);
      }

      Object.keys(results).forEach((entry) => {
        let msg = 'seems to be offline';
        if (results[entry]) {
          msg = 'seems to be online';
        }

        console.log(entry, msg);
      });
      return resolve(results);
    }, reject);
  });
};

function isNodeOnline (url) {
  return new Promise((resolve, reject) => {
    const er = utils.checkUrl(url);
    if (er) {
      return reject(er);
    }

    log.http('request', 'GET', url);

    request(url, (err, res, body) => {
      if (err && (err.code === 'ECONNREFUSED'
        || err.code === 'ENOTFOUND')) {
        return resolve({[url]: false});
      }

      if (err) {
        return reject(err);
      }

      resolve({[url]: res.statusCode < 300});
    });
  });
}
