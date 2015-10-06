import assert from 'assert';
import nock from 'nock';

import Lab from 'lab';
export const lab = Lab.script();

import * as cluster from '../src/cluster.js';
import nmo from '../src/nmo.js';
import {createConfigFile} from './common.js';



const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};
const oldConsole = console.log;

lab.experiment('cluster - get', () => {

  lab.beforeEach((done) => {
    createConfigFile();
    nmo
      .load(nmoconf)
      .then(() => done())
      .catch(() => done());
  });

  lab.test('errors on nmoconf', (done) => {
    cluster
      .get('nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
        done();
      });
  });

  lab.test('returns the clustername', (done) => {
    cluster
      .get('clusterone', 'node0')
      .then((res) => {
        assert.equal(res, 'http://127.0.0.1');
        done();
      });
    });
});

lab.experiment('cluster - add', () => {

  lab.beforeEach((done) => {
    createConfigFile();
    nmo
      .load(nmoconf)
      .then(() => done())
      .catch(() => done());
  });

  lab.test('errors on empty args', (done) => {
    cluster
      .add()
      .catch((err) => {
        assert.ok(/provide/.test(err.message));
        done();
      });
  });

  lab.test('errors on nmoconf', (done) => {
    cluster
      .add('foo', 'bar', 'nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
        done();
      });
  });

  lab.test('adds cluster', (done) => {
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

lab.experiment('cluster - join', () => {

  lab.beforeEach((done) => {
    createConfigFile();
    nmo
      .load(nmoconf)
      .then(() => done())
      .catch(() => done());

  });

  lab.test('errors on empty args', (done) => {
    cluster
      .join()
      .catch((err) => {
        assert.ok(/Usage/.test(err.message));
        done();
      });
  });

  lab.test('errors on nmoconf', (done) => {
    cluster
      .join('nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
        done();
      });
  });

  lab.test('errors on a cluster with no nodes', (done) => {
    cluster
      .join('doesnotexist')
      .catch((err) => {
        assert.ok(/any nodes/.test(err.message));
        done();
      });
  });

  lab.test('errors on cluster with 1 node', (done) => {
    cluster
      .join('onenodecluster')
      .catch((err) => {
        assert.ok(/enough nodes/.test(err.message));
        done();
      });
  });

  lab.test('warns on offline nodes', (done) => {
    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    cluster
      .join('clustervalidurlsbothdown')
      .catch((err) => {
        assert.ok(/nodes are/.test(err.message));
        done();
      });
  });

  lab.test('warns on offline node', (done) => {
    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200);

    cluster
      .join('clustervalidurlsonedown')
      .catch((err) => {
        assert.ok(/node is/.test(err.message));
        done();
      });
  });

  lab.test('succeeds at online nodes with pw', (done) => {
    nock('http://a:b@127.0.0.1:1337')
      .get('/')
      .reply(200);

    nock('http://a:b@127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://a:b@127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://a:b@127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://a:b@127.0.0.1:1338')
      .get('/')
      .reply(200);

    nock('http://a:b@127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://a:b@127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://a:b@127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    cluster
      .join('clustervalidurlswithpw')
      .then((res) => {
        assert.deepEqual(res, { ok: true });
        done();
      });
  });

  lab.test('succeeds at online nodes', (done) => {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200);

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .get('/')
      .reply(200);

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    cluster
      .join('clustervalidurls')
      .then((res) => {
        assert.deepEqual(res, { ok: true });
        done();
      });
  });

  lab.test('succeeds with offline nodes, but --force given', (done) => {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200);

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('neverexists2.neverexists')
      .get('/')
      .reply(500);

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

  lab.beforeEach((done) => {
    createConfigFile();
    nmo
      .load(nmoconf)
      .then(() => done())
      .catch(() => done());

  });

  lab.afterEach((done) => {
    console.log = oldConsole;
    done();
  });

  lab.test('adds cluster', (done) => {
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

  lab.test('gets cluster', (done) => {
    console.log = (...args) => {
      if (/rockbert=artischockbert/.test(args[0])) {
        assert.equal('rockbert=artischockbert\n', args[0]);
        done();
      }
    };

    nmo.load({nmoconf: __dirname + '/fixtures/randomini' }).then(() => {
      cluster
        .cli('add', 'rockbert', 'artischockbert', 'foocluster3')
        .then((res) => {
          cluster
            .cli('get', 'foocluster3');
          });
        });
  });

  lab.test('joins cluster', (done) => {
    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200);

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1337')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .get('/')
      .reply(200);

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    nock('http://127.0.0.1:1338')
      .post('/_cluster_setup')
      .reply(200, {ok: true});

    console.log = (...args) => {
      assert.equal('cluster joined', args[0]);
      done();
    };

    cluster
      .cli('join', 'clustervalidurls');
  });

  lab.test('returns error on wrong usage', (done) => {
    try {
      cluster.cli('lalala');
    } catch(err) {
      assert.ok(err instanceof Error);
      done();
    }
  });

});
