import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();
import nock from 'nock';
import nmo from '../src/nmo.js';
import {cli, setConfig, getClusterNodes, buildConfigUrl, getConfig, get, set} from '../src/couch-config.js';

lab.experiment('couch-config', () => {
  lab.beforeEach((done) => {
    nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'})
      .then(() => done())
      .catch(() => done());
  });

  lab.experiment('cli', () => {

    lab.test('no arguments', (done) => {

      cli().catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });

    });

    lab.test('non-existing command', (done) => {

      cli('wrong', 'command').catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });

    });

    lab.test('error on missing cluster', (done) => {

      cli('get').catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });

    });

    lab.test('error on non-existing cluster', (done) => {

      cli('get', 'not-exist').catch(err => {
        assert.ok(/Cluster/.test(err.message));
        done();
      });

    });

  });

  lab.experiment('api', () => {

    lab.test('getClusterNodes returns existing nodes', (done) => {
      const nodes = getClusterNodes('clusterone');

      assert.deepEqual(nodes, {
        node0: 'http://127.0.0.1',
        node1: 'http://192.168.0.1'
      });

      done();
    });

    lab.test('buildConfigUrl builds correctly with node and url', (done) => {
      const url = buildConfigUrl('node', 'http://127.0.0.1');
      assert.deepEqual(url, 'http://127.0.0.1/_node/node/_config');
      done();
    });

    lab.test('buildConfigUrl builds correctly with node, url and section', (done) => {
      const url = buildConfigUrl('node', 'http://127.0.0.1', 'a-section');
      assert.deepEqual(url, 'http://127.0.0.1/_node/node/_config/a-section');
      done();
    });

    lab.test('getConfig throws error on bad url', (done) => {
      getConfig('node1', 'bad-url')
      .catch(err => {
        assert.ok(/not a valid url/.test(err.message));
        done();
      });
    });

    lab.test('getConfig throws error on invalid protocol', (done) => {
      getConfig('node1', 'ftp://bad-url')
      .catch(err => {
        assert.ok(/invalid protocol/.test(err.message));
        done();
      });
    });

    lab.test('gets config bad url returns false', (done) => {
      getConfig('node1', 'http://127.0.0.2/')
      .catch(err => {
        assert.ok(/Could not find node/.test(err.message));
        done();
      });
    });

    lab.test('gets config for node', (done) => {
      const resp = {
        config1: 'hello',
        config2: 'boom'
      };

      nock('http://127.0.0.1')
        .get('/_node/node1/_config/uuid')
        .reply(200, resp);

      getConfig('node1', 'http://127.0.0.1/_node/node1/_config/uuid')
      .then(config => {
        assert.deepEqual(config, {
          node: 'node1',
          config: resp
        });
        done();
      });
    });

  });

  lab.experiment('get cmd', () => {
    let oldConsole = console.log;

    lab.afterEach(done => {
      console.log = oldConsole;
      done();
    });

    lab.test('get returns config', (done) => {
      const nodes = {
        node1: 'http://127.0.0.1'
      };

      const resp = {
        config1: 'hello',
        config2: 'boom'
      };

      nock('http://127.0.0.1')
        .get('/_node/node1/_config/uuid')
        .reply(200, resp);

      get('cluster', nodes, 'uuid')
      .then(config => {
        assert.deepEqual(config, {
          node1: {
          config1: 'hello',
          config2: 'boom'
        }
       });
       done();
      });
    });

    lab.test('get returns json if set', done => {
      const nodes = {
        node1: 'http://127.0.0.100'
      };

      const resp = {
        config1: 'hello',
        config2: 'boom'
      };

      nock('http://127.0.0.100')
        .get('/_node/node1/_config/uuid')
        .reply(200, resp);

      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {

          get('cluster', nodes, 'uuid')
          .then(jsonresp => {
            assert.deepEqual({node1: resp}, jsonresp);
            done();
          });
        });
    });

    lab.test('get prints config', done => {
      const nodes = {
        node1: 'http://127.0.0.1'
      };

      const resp = {
        config1: 'hello',
        config2: 'boom'
      };

      nock('http://127.0.0.1')
        .get('/_node/node1/_config/uuid')
        .reply(200, resp);

      console.log = (msg) => {
        if (/NODE:/.test(msg)) {
          return;
        }

        assert.ok(/config1/.test(msg));
        assert.ok(/config2/.test(msg));

        done();
      };

      get('cluster', nodes, 'uuid');
    });
  });

  lab.experiment('set cmd', () => {

    lab.test('returns error if all nodes are not online', done => {
      nock('http://127.0.0.1')
      .get('/')
      .reply(500);

      nock('http://192.168.0.1')
      .get('/')
      .reply(500);

      set('clusterone', 'nodes', 'section', 'key', 'value')
      .catch(err => {
        console.log('ERR', err);
        assert.ok(/is offline/.test(err.message));
        done();
      });

    });

    lab.test('sets config on all nodes for cluster', done => {
      //isonline
      nock('http://127.0.0.1')
      .get('/')
      .reply(200);

      nock('http://192.168.0.1')
      .get('/')
      .reply(200);

      //config update
      nock('http://127.0.0.1')
      .put('/_node/node0/_config/section/key', JSON.stringify('value'))
      .reply(200, JSON.stringify("oldvalue"));

      nock('http://192.168.0.1')
      .put('/_node/node1/_config/section/key', JSON.stringify('value'))
      .reply(200, JSON.stringify("oldvalue"));

      set('clusterone', getClusterNodes('clusterone'), 'section', 'key', 'value')
      .then(resp => {
        assert.deepEqual(resp, [
          { node: 'node0', oldvalue: 'oldvalue', newvalue: 'value' },
          { node: 'node1', oldvalue: 'oldvalue', newvalue: 'value' } ]);
        done();
      });

    });

    lab.test('sets config throws error', done => {
      //isonline
      nock('http://127.0.0.1')
      .get('/')
      .reply(200);

      nock('http://192.168.0.1')
      .get('/')
      .reply(200);

      //config update
      nock('http://127.0.0.1')
      .put('/_node/node0/_config/section/key', JSON.stringify('value'))
      .reply(200, JSON.stringify("oldvalue"));

      set('clusterone', getClusterNodes('clusterone'), 'section', 'key', 'value')
      .catch(err => {
        assert.ok(/Error on set config for node/.test(err.message));
        done();
      });

    });

    lab.test('setsConfig warns on incorrect url', done => {

      setConfig('node1', 'ftp://127.0.0.1', 'section', 'key', 'value')
      .catch(err => {
        assert.ok(/invalid protocol/.test(err.message));
        done();
      });

    });

  });
});
