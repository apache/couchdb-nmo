import prettyjson from 'prettyjson';
import nmo from './nmo.js';
import Promise from 'bluebird';
import { getUrlFromCluster, sendJsonToNode } from './utils';

export function cli (cluster, dbname, ...args) {
  return new Promise((resolve, reject) => {
    if (!cluster || !dbname || args.length === 0) {
      const msg = [
        'Usage:',
        '',
        'nmo query <cluster> <database> create <fields> [--json]',
        'nmo query <cluster> <database> <selector> [--json]',
      ].join('\n');

      const err = new Error(msg);
      err.type = 'EUSAGE';
      return reject(err);
    }

    let promise;

    if (args[0] === 'create') {
      if (!args[1] || !args[1].length === 0) {
        const err = new Error('Please supply one or more fields to be indexed');
        err.type = 'EUSAGE';
        reject(err);
        return;
      }

      const fields = args[1].split(',').map(f => f.trim());
      promise = createIndex(cluster, dbname, fields)
    } else {
      let selector;
      try {
        eval('selector = ' + args[0]);
      } catch (e) {
        if (/Unexpected token/.test(e.message)) {
          const err = new Error('Incorrect selector, it could be you used \" instead of \' for your selector');
          err.type = 'EUSAGE';
          return reject(err);
        }
      }

      if(!selector) {
        const msg = [
          'You have to wrap the selector in single quotes',
          'e.g nmo query anemone restaurants \'{"selector": {"_id": {"$gt":null}}}\''
        ].join('\n');
        const err = new Error(msg);
        err.type = 'EUSAGE';
        return reject(err);
      }

      promise = run(cluster, dbname, selector);
    }

    promise
    .then(resp => {
      const jsonOut = nmo.config.get('json');

      if (jsonOut) {
        console.log(resp);
      } else {
        if (resp.result) {
          if (resp.result === 'created') {
            console.log('Index has been created.')
          } else if (resp.result === 'exists') {
            console.log('Index already exists.')
          } else {
            console.log(resp);
          }
        } else {
          console.log(prettyjson.render(resp.docs));
        }
      }
      resolve(resp);
    })
    .catch(err => {
      reject(err);
    });
  });
}

export function run (cluster, dbname, selector) {
  return new Promise((resolve, reject) => {
    const url = getUrlFromCluster(cluster) + '/' + dbname + '/_find';
    sendJsonToNode(url, selector)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

export function createIndex(cluster, dbname, fields) {
  return new Promise((resolve, reject) => {
    const index = {
      index: {
        fields: fields
      },
      type: 'json'
    };

    const url = getUrlFromCluster(cluster) + '/' + dbname + '/_index';
    sendJsonToNode(url, index)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}
