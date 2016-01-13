import assert from 'assert';

import nock from 'nock';
import { createConfigFile } from './common';
import nmo from '../src/nmo.js';
import {cli, setConfig, getClusterNodes, buildConfigUrl, getConfig, get, set} from '../src/couch-config.js';
import { consoleMock } from './helpers';

describe('couch-config', () => {
  createConfigFile();

  beforeEach(() => {
    return nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  describe('cli', () => {

    it('no arguments', () => {
      return cli()
        .catch(err => {
          assert.ok(/Usage/.test(err.message));
        });
    });

    it('non-existing command', () => {

      return cli('wrong', 'command')
        .catch(err => {
          assert.ok(/Usage/.test(err.message));
        });

    });

    it('error on missing cluster', () => {

      return cli('get')
        .catch(err => {
        assert.ok(/Usage/.test(err.message));
        });

    });

    it('error on non-existing cluster', () => {

      return cli('get', 'not-exist')
        .catch(err => {
          assert.ok(/Cluster/.test(err.message));
        });
    });

  });

  describe('api', () => {

    it('getClusterNodes returns existing nodes', () => {
      const nodes = getClusterNodes('clusterone');

      assert.deepEqual(nodes, {
        node0: 'http://127.0.0.1',
        node1: 'http://192.168.0.1'
      });
    });

    it('buildConfigUrl builds correctly with node and url', () => {
      const url = buildConfigUrl('node', 'http://127.0.0.1');
      assert.deepEqual(url, 'http://127.0.0.1/_node/node/_config');
    });

    it('buildConfigUrl builds correctly with node, url and section', () => {
      const url = buildConfigUrl('node', 'http://127.0.0.1', 'a-section');
      assert.deepEqual(url, 'http://127.0.0.1/_node/node/_config/a-section');
    });

    it('getConfig throws error on bad url', () => {
      return getConfig('node1', 'bad-url')
        .catch(err => {
          assert.ok(/not a valid url/.test(err.message));
        });
    });

    it('getConfig throws error on invalid protocol', () => {
      return getConfig('node1', 'ftp://bad-url')
        .catch(err => {
          assert.ok(/invalid protocol/.test(err.message));
        });
    });

    it('gets config bad url returns false', () => {
      return getConfig('node1', 'http://badurl.invalid')
        .catch(err => {
          assert.ok(/Could not find node/.test(err.message));
        });
    });

    it('gets config for node', () => {
      const resp = {
        config1: 'hello',
        config2: 'boom'
      };

      nock('http://127.0.0.1')
        .get('/_node/node1/_config/uuid')
        .reply(200, resp);

      return getConfig('node1', 'http://127.0.0.1/_node/node1/_config/uuid')
        .then(config => {
          assert.deepEqual(config, {
            node: 'node1',
            config: resp
          });
        });
    });

  });

  describe('get cmd', () => {
    it('get returns config', () => {
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

      return get('cluster', nodes, 'uuid')
        .then(config => {
          assert.deepEqual(config, {
            node1: {
            config1: 'hello',
            config2: 'boom'
          }
         });
      });
    });

    it('get returns json if set', () => {
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

      return nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          return get('cluster', nodes, 'uuid');
        })
        .then(jsonresp => {
          assert.deepEqual({node1: resp}, jsonresp);
        });
    });

    it('get prints config', (done) => {
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

      console.log = consoleMock(msg => {
        assert.ok(/config1/.test(msg));
        assert.ok(/config2/.test(msg));

        done();
      });

      get('cluster', nodes, 'uuid');
    });
  });

  describe('set cmd', () => {

    it('returns error if all nodes are not online', () => {
      nock('http://127.0.0.1')
      .get('/')
      .reply(500);

      nock('http://192.168.0.1')
      .get('/')
      .reply(500);

      return set('clusterone', 'nodes', 'section', 'key', 'value')
        .catch(err => {
          assert.ok(/is offline/.test(err.message));
        });
    });

    it('sets config on all nodes for cluster', () => {
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
      .reply(200, JSON.stringify('oldvalue'));

      nock('http://192.168.0.1')
      .put('/_node/node1/_config/section/key', JSON.stringify('value'))
      .reply(200, JSON.stringify('oldvalue'));

      return set('clusterone', getClusterNodes('clusterone'), 'section', 'key', 'value')
      .then(resp => {
          assert.deepEqual(resp, [
            { node: 'node0', oldvalue: 'oldvalue', newvalue: 'value' },
            { node: 'node1', oldvalue: 'oldvalue', newvalue: 'value' } ]);
        });
    });

    it('sets config throws error', () => {
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
      .reply(200, JSON.stringify('oldvalue'));

      return set('clusterone', getClusterNodes('clusterone'), 'section', 'key', 'value')
      .catch(err => {
        assert.ok(/Error on set config for node/.test(err.message));
      });

    });

    it('setsConfig warns on incorrect url', () => {

      return setConfig('node1', 'ftp://127.0.0.1', 'section', 'key', 'value')
      .catch(err => {
        assert.ok(/invalid protocol/.test(err.message));
      });

    });

  });
});
