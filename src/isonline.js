import * as utils from './utils.js';
import log from 'npmlog';
import request from 'request';
import Promise from 'bluebird';
import nmo from './nmo.js';


export const cli = isOnlineCli;
function isOnlineCli (...urls) {
  return new Promise((resolve, reject) => {

    if (!urls.length) {
      const err = new Error('Usage: nmo isonline <url>, [<url>] ...');
      err.type = 'EUSAGE';
      return reject(err);
    }

    isonline.apply(isonline, urls)
      .then((results) => {
        const jsonOut = nmo.config.get('json');

        if (jsonOut) {
          console.log(results);
          return resolve(results);
        }

        Object.keys(results).forEach((entry) => {
          let msg = 'seems to be offline';
          if (results[entry]) {
            msg = 'seems to be online';
          }

          console.log(entry, msg);
          resolve(results);
        });
      }, reject);
  });
}


export default isonline;
function isonline (...args) {
  return new Promise((resolve, reject) => {

    const urlPromises = args.map((url) => {
      return isNodeOnline(url);
    });

    Promise.all(urlPromises).then((results) => {
      results = results.reduce((acc, el) => {
        const key = Object.keys(el)[0];
        acc[key] = el[key];
        return acc;
      }, {});

      resolve(results);
    }, reject);
  });
}

function isNodeOnline (url) {
  return new Promise((resolve, reject) => {
    const er = utils.checkUrl(url);

    if (er) {
      return reject(er);
    }
    const cleanedUrl = utils.removeUsernamePw(url);
    log.http('request', 'GET', cleanedUrl);

    request(url, (err, res, body) => {

      if (err && (err.code === 'ECONNREFUSED'
        || err.code === 'ENOTFOUND')) {
        return resolve({[url]: false});
      }

      if (err) {
        return reject(err);
      }

      log.http(res.statusCode, cleanedUrl);
      resolve({[url]: res.statusCode < 300});
    });
  });
}
