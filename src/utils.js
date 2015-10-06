'use strict';

import assert from 'assert';

import {isUri as checkUri} from 'valid-url';
import Wreck from 'wreck';
import Promise from 'bluebird';
import log from 'npmlog';
import url from 'url';
import nmo from './nmo';

export function validUrl (url) {
  let er = checkUrl(url);

  if (!er && !/^(http:|https:)/.test(url)) {
    er = new Error('invalid protocol, must be https or http');
  }

  return er;
}

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

    const opts = {
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(json),
      json: true,
    };

    Wreck.post(url, opts, (err, res, body) => {
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

export function getUrlFromCluster(clusterName) {
  const err = validUrl(clusterName);

  if (err === null) {
    return clusterName;
  }

  return getClusterUrls(clusterName)[0];
}

export function getClusterUrls (clusterName) {
  const nodes = nmo.config.get(clusterName);
  if (!nodes) {
    const err = new Error('Cluster does not exist');
    err.type = 'EUSAGE';
    throw err;
  }
  return Object.keys(nodes).map(key => nodes[key]);
}
