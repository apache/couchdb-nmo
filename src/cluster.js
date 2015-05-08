import * as config from './config.js';
import nemo from './nemo.js';
import isonline from './isonline.js';

import xtend from 'xtend';
import Promise from 'bluebird';
import log from 'npmlog';

import * as utils from './utils';
import url from 'url';

const cmdCommands = {
  add: add,
  get: getCli,
  join: joinCli
};

export function cli (cmd, ...args) {

  if (!cmdCommands[cmd]) {
    const msg = [
      'Usage:',
      '',
      'nemo cluster get [<clustername>], [<nodename>]',
      'nemo cluster add <nodename>, <url>, <clustername>',
      'nemo cluster join <clustername>'
    ].join('\n');
    const err = new Error(msg);
    err.type = 'EUSAGE';

    throw err;
  }

  return cmdCommands[cmd].apply(exports[cmd], args);
};

function joinCli (cluster) {
  return new Promise((resolve, reject) => {
    join(cluster)
      .then((data) => {
        console.log('cluster joined');
        resolve(data);
      })
      .catch(reject);
  });
}

export function join (cluster) {
  return new Promise((resolve, reject) => {
    testClusterConf(cluster);
    const clusterConf = config.get(cluster);

    const urls = Object.keys(clusterConf).reduce((acc, el) => {
      acc.push(clusterConf[el]);
      return acc;
    }, []);

    isonline.apply(isonline, urls).then((res) => {
      const downNodes = Object.keys(res).reduce((acc, el) => {
        if (!res[el]) {
          acc.push(el);
        }
        return acc;
      }, []);

      const downNodesCount = downNodes.length;
      var force = nemo.config.get('force');
      if (downNodesCount && !force) {
        const nodeNodes = downNodesCount > 1 ? 'nodes are' : 'node is';
        const msg = [
          `it seems that ${downNodesCount} ${nodeNodes} offline.`,
          `if you really want to continue, use:`,
          `nemo join ${cluster} --force`
        ].join('\n');

        const err = new Error(msg);
        err.type = 'EUSAGE';
        return reject(err)
      }

      const onlineNodes = Object.keys(res).reduce((acc, el) => {
        if (res[el]) {
          acc.push(el);
        }
        return acc;
      }, []);

      const nodePromisesEnableCluster = onlineNodes.map((u) => {
        const auth = url.parse(u).auth,
              match = auth ? auth.match(/(.*):(.*)/) : ['', '', ''],
              [_, user, pw] = match;

        const json = {
          action: 'enable_cluster',
          username: user,
          password: pw,
          bind_address: '0.0.0.0'
        };

        return utils.sendJsonToNode(u + '/_cluster_setup', json);
      });

      Promise.all(nodePromisesEnableCluster).then((results) => {
        add();
      }, reject);

      function add () {
        const target = onlineNodes.shift(),
              setupEndpoint = target + '/_cluster_setup';

        const partyCrowd = onlineNodes.reduce((acc, el) => {
          const parsed = url.parse(el),
                auth = parsed.auth,
                match = auth ? auth.match(/(.*):(.*)/) : ['', '', ''],
                [_, user, pw] = match;

          acc.push({
            action: 'add_node',
            username: user,
            password: pw,
            host: parsed.hostname,
            port: +parsed.port
          });

          return acc;
        }, []);

        const nodePromisesAddNodes = partyCrowd.map((json) => {
          return utils.sendJsonToNode(setupEndpoint, json);
        });

        Promise.all(nodePromisesEnableCluster).then((results) => {
          utils.sendJsonToNode(setupEndpoint, {action: 'finish_cluster'})
            .then((res) => {
              resolve(res);
            });
        }, reject);
      }
    }, reject);
  });
}

function testClusterConf (cluster) {
  if (!cluster) {
    const err = new Error('Usage: nemo cluster join <clustername>');
    err.type = 'EUSAGE';
    throw err;
  }
  // config
  if (cluster === 'nemoconfig') {
    const err = new Error('nemoconfig is not a valid clustername');
    err.type = 'EUSAGE';
    throw err;
  }

  let msg;
  if (!config.get(cluster)) {
    msg = [
      'Cluster does not have any nodes.',
      'You can add nodes using:',
      '',
      'nemo cluster add <nodename>, <url>, <clustername>'
    ].join('\n');
    throwUp();
  }

  if (Object.keys(config.get(cluster)).length <= 1) {
    msg = [
      'Cluster does not have enough nodes.',
      'You need at least two nodes in a cluster',
      'You can add nodes using:',
      '',
      'nemo cluster add <nodename>, <url>, <clustername>'
    ].join('\n');
    throwUp();
  }

  function throwUp () {
    let err = new Error(msg);
    err.type = 'EUSAGE';
    throw err;
  }
}


export function add (node, url, cluster) {
  return new Promise((resolve, reject) => {
    // config
    if (cluster === 'nemoconfig') {
      const err = new Error('nemoconf is not a valid clustername');
      err.type = 'EUSAGE';
      return reject(err);
    }

    config.set(cluster, node, url).then(() => {
      resolve();
    }).catch((er) => {
      reject(er);
    });
  });
}

function getCli (cluster, node) {
  return new Promise((resolve, reject) => {
    get(cluster, node)
      .then((data) => {
        config.handleResult(data, node);
        resolve(data);
      })
      .catch(reject);
  });
}

export function get (cluster, node) {
  return new Promise((resolve, reject) => {
    // config
    if (cluster === 'nemoconfig') {
      const err = new Error('nemoconf is not a valid clustername');
      err.type = 'EUSAGE';
      return reject(err);
    }

    const data = config.get(cluster, node);
    delete data.nemoconfig;

    return resolve(data);
  });
}
