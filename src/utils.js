'use strict';

import assert from 'assert';

import {isUri as checkUri} from 'valid-url';
import Wreck from 'wreck';
import Promise from 'bluebird';
import log from 'npmlog';
import url from 'url';

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
  return new Promise((resolve, reject) => {
    assert.equal(typeof json, 'object', 'argument must be an object');

    const cleanedUrl = removeUsernamePw(url);
    log.http('request', 'POST', cleanedUrl);

    Wreck.post(url, {payload: JSON.stringify(json), json: true}, (err, res, body) => {
      if (err) {
        return reject(err);
      }

      log.http(res.statusCode, cleanedUrl);
      if (res.statusCode === 200 || res.statusCode === 201) {
        return resolve(body);
      }

      const er = new Error(body.reason);
      er.type = 'EUSAGE';
      reject(er);
    });
  });
}

export function removeUsernamePw (u) {
  const parsed = url.parse(u);
  parsed.auth = parsed.auth ? parsed.auth.replace(/.*:.*/, 'USER:PW') : parsed.auth;
  return url.format(parsed);
}
