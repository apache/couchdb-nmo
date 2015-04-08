'use strict';

import * as utils from './utils.js';
import log from 'npmlog';
import request from 'request';
import Promise from 'bluebird';

export const isnodeonline = function isNodeOnline (url) {
  return new Promise(function (resolve, reject) {
    const er = utils.checkUrl(url);
    if (er) {
      return reject(er);
    }

    log.http('request', 'GET', url);

    request(url, (err, res, body) => {
      if (err && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND')) {
        log.info('nodestatus', 'NOT OK', 'node is probably offline');
        return resolve(false);
      }

      if (err) {
        return reject(err);
      }

      const online = res.statusCode < 300;

      if (online) {
        log.info('nodestatus', 'OK', 'node seems to be online');
        return resolve(online);
      }
      log.info('nodestatus', 'NOT OK', 'node is probably offline');
      resolve(online);
    });
  });
}
