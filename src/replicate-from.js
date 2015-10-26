import nmo from './nmo.js';
import Promise from 'bluebird';
import { getUrlFromCluster } from './utils';
import {replicate, createReplicatorDoc } from './replicate';


export function cli (cluster, dbname, url) {
  return new Promise((resolve, reject) => {
    if (!cluster || !dbname || !url) {
      const msg = [
        'Usage:',
        '',
        'nmo replicate-from <cluster> <databasename> <url/dbname> [--continuous] [--create-target] [--json]',
        'nmo replicate-from <url> <databasename> <url/dbname> [--continuous] [--create-target] [--json]',
      ].join('\n');

      const err = new Error(msg);
      err.type = 'EUSAGE';
      return reject(err);
    }

    replicateFrom(cluster, dbname, url)
    .then(resp => {
      console.log('Replication started.');
      resolve(resp);
    })
    .catch(err => {
      err.type = 'EUSAGE';
      reject(err);
    });
  });
}

export default function replicateFrom(cluster, dbname, url) {
  return new Promise((resolve, reject) => {
    const clusterUrl = getUrlFromCluster(cluster);
    const replicatorUrl = clusterUrl + '/_replicator';
    const dbUrl = clusterUrl + '/' + dbname;

    const replicator = createReplicatorDoc(dbUrl, url, {
      continuous: !!nmo.config.get('continuous'),
      create_target: !!nmo.config.get('create-target')
    });

    replicate(replicatorUrl, replicator)
    .then(resolve)
    .catch(reject);
  });
}
