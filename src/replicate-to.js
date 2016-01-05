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
        'nmo replicate-to <cluster> <databasename> <url/dbname> [--continuous] [--create-target] [--json]',
        'nmo replicate-to <url> <databasename> <url/dbname> [--continuous] [--create-target] [--json]',
      ].join('\n');

      const err = new Error(msg);
      err.type = 'EUSAGE';
      return reject(err);
    }

    replicateto(cluster, dbname, url)
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

export default function replicateto(cluster, dbname, url) {
  return new Promise((resolve, reject) => {
    const clusterUrl = getUrlFromCluster(cluster);
    const replicatorUrl = clusterUrl + '/_replicator';
    const dbUrl = clusterUrl + '/' + dbname;

    const replicator = createReplicatorDoc(url, dbUrl, {
      continuous: !!nmo.config.get('continuous'),
      'create_target': !!nmo.config.get('create-target')
    });

    replicate(clusterUrl, replicatorUrl, replicator)
    .then(resolve)
    .catch(reject);
  });
}
