import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import * as cluster from '../src/cluster.js';
import nmo from '../src/nmo.js';
import * as common from './common.js';

import fs from 'fs';

const data = `[clusterone]
node0=127.0.0.1
node1=192.168.0.1

[onenodecluster]
node1=iamalonelylnode

[clustervalidurlsbothdown]
node0=http:\/\/neverexists.neverexists
node1=http:\/\/neverexists2.neverexists

[clustervalidurlsonedown]
node1=http:\/\/neverexists2.neverexists
node2=${common.NODE}

[clustervalidurls]
node1=${common.NODE}
node2=${common.NODE_TWO}

[clustervalidurlswithpw]
node1=${common.NODE_WITH_PW}
node2=${common.NODE_TWO_WITH_PW}
`;

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};
const oldConsole = console.log;

lab.experiment('cluster - get', () => {
  fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');

  lab.test('errors on nmoconf', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .get('nmoconfig')
        .catch((err) => {
          assert.ok(/valid/.test(err.message));
          done();
        });
    });
  });

  lab.test('returns the clustername', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .get('clusterone', 'node0')
        .then((res) => {
          assert.equal(res, '127.0.0.1');
          done();
        });
    });
  });
});

lab.experiment('cluster - add', () => {
  fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');

  lab.test('errors on empty args', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .add()
        .catch((err) => {
          assert.ok(/provide/.test(err.message));
          done();
        });
    });
  });

  lab.test('errors on nmoconf', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .add('foo', 'bar', 'nmoconfig')
        .catch((err) => {
          assert.ok(/valid/.test(err.message));
          done();
        });
    });
  });

  lab.test('adds cluster', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .add('rockbert', 'artischockbert', 'foocluster')
        .then((res) => {
          cluster
            .get('foocluster')
            .then((res) => {
              assert.deepEqual(res, {rockbert: 'artischockbert'});
              done();
            });
        });
    });
  });

});

lab.experiment('cluster - join', () => {

  let servers;

  lab.beforeEach((done) => {
    fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
    common.createTestServers().done((s) => {
      servers = s;
      done();
    });
  });

  lab.afterEach((done) => {
    common.stopTestServers(servers).then((res) => {
      done();
    });
  });

  lab.test('errors on empty args', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join()
        .catch((err) => {
          assert.ok(/Usage/.test(err.message));
          done();
        });
    });
  });

  lab.test('errors on nmoconf', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('nmoconfig')
        .catch((err) => {
          assert.ok(/valid/.test(err.message));
          done();
        });
    });
  });

  lab.test('errors on a cluster with no nodes', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('doesnotexist')
        .catch((err) => {
          assert.ok(/any nodes/.test(err.message));
          done();
        });
    });
  });

  lab.test('errors on cluster with 1 node', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('onenodecluster')
        .catch((err) => {
          assert.ok(/enough nodes/.test(err.message));
          done();
        });
    });
  });

  lab.test('warns on offline node', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('clustervalidurlsbothdown')
        .catch((err) => {
          assert.ok(/nodes are/.test(err.message));
          done();
        });
    });
  });

  lab.test('warns on offline nodes', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('clustervalidurlsonedown')
        .catch((err) => {
          assert.ok(/node is/.test(err.message));
          done();
        });
    });
  });

  lab.test('succeeds at online nodes with pw', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('clustervalidurlswithpw')
        .then((res) => {
          assert.deepEqual(res, { ok: true });
          done();
        });
    });
  });

  lab.test('succeeds at online nodes', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .join('clustervalidurls')
        .then((res) => {
          assert.deepEqual(res, { ok: true });
          done();
        });
    });
  });

  lab.test('succeeds with offline nodes, but --force given', (done) => {
    nmo.load({nmoconf: __dirname + '/fixtures/randomini', force: true}).then(() => {
      cluster
        .join('clustervalidurlsonedown')
        .then((res) => {
          assert.deepEqual(res, { ok: true });
          done();
        });
    });
  });

});


lab.experiment('cluster - cli', () => {

  let servers;

  lab.beforeEach((done) => {
    fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
    common.createTestServers().done((s) => {
      servers = s;
      done();
    });
  });

  lab.afterEach((done) => {
    console.log = oldConsole;

    common.stopTestServers(servers).then((res) => {
      done();
    });
  });

  lab.test('adds cluster', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .cli('add', 'rockbert', 'artischockbert', 'foocluster2')
        .then((res) => {
          cluster
            .get('foocluster2')
            .then((res) => {
              assert.deepEqual(res, {rockbert: 'artischockbert'});
              done();
            });
        });
    });
  });

  lab.test('gets cluster', (done) => {
    console.log = (...args) => {
      assert.equal('rockbert=artischockbert\n', args[0]);
      done();
    };

    nmo.load(nmoconf).then(() => {
      cluster
        .cli('add', 'rockbert', 'artischockbert', 'foocluster3')
        .then((res) => {
          cluster
            .cli('get', 'foocluster3');
        });
    });
  });

  lab.test('joins cluster', (done) => {
    console.log = (...args) => {
      assert.equal('cluster joined', args[0]);
      done()
    };

    nmo.load(nmoconf).then(() => {
      cluster
        .cli('join', 'clustervalidurls');
    });
  });

  lab.test('returns error on wrong usage', (done) => {
    nmo.load(nmoconf).then(() => {
      cluster
        .cli('lalala')
    })
    .catch((err) => {
      assert.ok(err instanceof Error);
      done();
    });
  });

});
