import assert from 'assert';
import nock from 'nock';

import * as cluster from '../src/cluster.js';
import nmo from '../src/nmo.js';
import {createConfigFile} from './common.js';
import { consoleMock } from './helpers';

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};

describe('cluster - get', () => {

  beforeEach(() => {
    createConfigFile();
    return nmo
      .load(nmoconf)
  });

  it('errors on nmoconf', () => {
    return cluster
      .get('nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
      });
  });

  it('returns the clustername', () => {
    return cluster
      .get('clusterone', 'node0')
      .then((res) => {
        assert.equal(res, 'http://127.0.0.1');
      });
    });
});

describe('cluster - add', () => {

  beforeEach(() => {
    createConfigFile();
    return nmo
      .load(nmoconf);
  });

  it('errors on empty args', () => {
    return cluster
      .add()
      .catch((err) => {
        assert.ok(/provide/.test(err.message));
      });
  });

  it('errors on nmoconf', (done) => {
    cluster
      .add('foo', 'bar', 'nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
        done();
      });
  });

  it('adds cluster', (done) => {
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

describe('cluster - join', () => {

  beforeEach(() => {
    createConfigFile();
    return nmo
      .load(nmoconf);
  });

  it('errors on empty args', () => {
    return cluster
      .join()
      .catch((err) => {
        assert.ok(/Usage/.test(err.message));
      });
  });

  it('errors on nmoconf', () => {
    return cluster
      .join('nmoconfig')
      .catch((err) => {
        assert.ok(/valid/.test(err.message));
      });
  });

  it('errors on a cluster with no nodes', () => {
    return cluster
      .join('doesnotexist')
      .catch((err) => {
        assert.ok(/any nodes/.test(err.message));
      });
  });

  it('errors on cluster with 1 node', () => {
    return cluster
      .join('onenodecluster')
      .catch((err) => {
        assert.ok(/enough nodes/.test(err.message));
      });
  });

  it('warns on offline nodes', () => {
    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    return cluster
      .join('clustervalidurlsbothdown')
      .catch((err) => {
        assert.ok(/nodes are/.test(err.message));
      });
  });

  it('warns on offline node', () => {
    nock('http://neverexists.neverexists')
      .get('/')
      .reply(500);

    nock('http://127.0.0.1:1337')
      .get('/')
      .reply(200);

    return cluster
      .join('clustervalidurlsonedown')
      .catch((err) => {
        assert.ok(/node is/.test(err.message));
      });
  });

  it('succeeds at online nodes with pw', () => {
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

    return cluster
      .join('clustervalidurlswithpw')
      .then((res) => {
        assert.deepEqual(res, { ok: true });
      });
  });

  it('succeeds at online nodes', () => {
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

    return cluster
      .join('clustervalidurls')
      .then((res) => {
        assert.deepEqual(res, { ok: true });
      });
  });

  it('succeeds with offline nodes, but --force given', () => {
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

    return nmo.load({nmoconf: __dirname + '/fixtures/randomini', force: true}).then(() => {
      return cluster
        .join('clustervalidurlsonedown')
        .then((res) => {
          assert.deepEqual(res, { ok: true });
        });
    });
  });
});


describe('cluster - cli', () => {

  beforeEach(() => {
    createConfigFile();
    return nmo
      .load(nmoconf)
  });

  it('adds cluster', () => {
    return cluster
      .cli('add', 'rockbert', 'artischockbert', 'foocluster2')
      .then((res) => {
        return cluster
          .get('foocluster2')
          .then((res) => {
            assert.deepEqual(res, {rockbert: 'artischockbert'});
          });
      });
  });

  it('gets cluster', (done) => {
    console.log = consoleMock((...args) => {
      if (/rockbert=artischockbert/.test(args[0])) {
        assert.equal('rockbert=artischockbert\n', args[0]);
        done();
      }
    });

    return nmo.load({nmoconf: __dirname + '/fixtures/randomini' }).then(() => {
      return cluster
        .cli('add', 'rockbert', 'artischockbert', 'foocluster3')
        .then((res) => {
          return cluster
            .cli('get', 'foocluster3');
          });
        });
  });

  it('joins cluster', () => {
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

    console.log = consoleMock((...args) => {
      assert.equal('cluster joined', args[0]);
    });

    return cluster
      .cli('join', 'clustervalidurls');
  });

  it('returns error on wrong usage', (done) => {
    try {
      cluster.cli('lalala');
    } catch(err) {
      assert.ok(err instanceof Error);
      done();
    }
  });

});
