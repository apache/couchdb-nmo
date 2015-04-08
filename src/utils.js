'use strict';

import assert from 'assert';

import {isUri as checkUri} from 'valid-url';
import request from 'request';
import Promise from 'bluebird';
import log from 'npmlog';

export function isUri (url) {
  return !!checkUri(url);
}

export function checkUrl (url) {
  if (!url) {
    return new Error('please provide a url');
  }
  if (!isUri(url)) {
    return new Error(`${url} is not a valid url`);
  }
  return null;
}

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
}
