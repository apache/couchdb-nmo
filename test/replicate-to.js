import assert from 'assert';

import { cli } from '../src/replicate-to.js';
import {mockNodeIsOnline} from './helpers.js';

import * as common from './common.js';
import nmo from '../src/nmo.js';

import nock from 'nock';

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};

common.createConfigFile();

describe('replicate-to', () => {

  describe('cli', () => {
    beforeEach(() => {
      return nmo
        .load(nmoconf);
    });

    it('returns error on no value provided', () => {
      return cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });

    it('replicates db given cluster details', () => {
      const doc = {
        'target':{
          'url':'http://127.0.0.1/mydb'
        },
        'source':{
          'url':'https://target-repl.com/new-db'
        },
        'continuous':false,
        'create_target':false
      };

      const url = 'http://127.0.0.1';
      mockNodeIsOnline(url);
      nock(url)
        .post('/_replicator', doc)
        .reply(200, {ok: true, id: '123', rev: '123'});

      return cli('clusterone', 'mydb', 'https://target-repl.com/new-db')
      .then(resp => {
        assert.ok(resp.ok);
      });
    });

    it('replicates db given cluster details with continuous and create_target', () => {
      return nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', 'create-target': true, continuous: true})
        .then(() => {
          const doc = {
            'target':{
              'url':'http://127.0.0.1/mydb'
            },
            'source':{
              'url':'https://target-repl.com/new-db'
            },
            'continuous':true,
            'create_target':true
          };

          const url = 'http://127.0.0.1';
          mockNodeIsOnline(url);

          nock(url)
            .post('/_replicator', doc)
            .reply(200, {ok: true, id: '123', rev: '123'});

          return cli('clusterone', 'mydb', 'https://target-repl.com/new-db')
          .then(resp => {
            assert.ok(resp.ok);
          });
        });
    });
  });
});
