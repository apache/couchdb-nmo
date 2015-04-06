'use strict';

import assert from 'assert'

import {isUri as checkUri} from 'valid-url';
import request from 'request';
import Promise from 'bluebird';
import {log as log} from './log.js'

export function isUri (url) {
  return !!checkUri(url);
};

export function isNodeOnline (url) {
  return new Promise(function (resolve, reject) {

    log.http('request', 'GET', url);

    request(url, (err, res, body) => {
      if (err && err.code === 'ECONNREFUSED') {
        return resolve(false);
      }

      if (err) {
        return reject(err);
      }

      resolve(res.statusCode < 300);
    });
  });
};

export function sendJsonToNode (url, json) {
  return new Promise(function (resolve, reject) {
    assert.equal(typeof json, 'object', 'argument must be an object');

    log.http('request', 'POST', url);

    request({
      uri: url,
      json: true,
      body: json
    }, (err, res, body) => {
      if (err) {
        return reject(err);
      }

      resolve(body);
    });
  });
};
