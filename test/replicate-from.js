import assert from 'assert';
import Lab from 'lab';

import replicateFrom, {cli } from '../src/replicate-from.js';

import * as common from './common.js';
import nmo from '../src/nmo.js';

import nock from 'nock';

export let lab = Lab.script();
const oldConsole = console.log;
const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};

common.createConfigFile();

lab.experiment('replicate-from', () => {

  lab.experiment('cli', () => {
    lab.beforeEach((done) => {
      nmo
        .load(nmoconf)
        .then(() => done())
        .catch(() => done());

    });

    lab.afterEach((done) => {
      console.log = oldConsole;
      done();
    });

    lab.test('returns error on no value provided', done => {
      cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });

    lab.test('replicates db given cluster details', done => {
      const doc = {
        "source":{
          "url":"http://127.0.0.1/mydb"
        },
        "target":{
          "url":"https://target-repl.com/new-db"
        },
        "continuous":false,
        "create_target":false
      };

      nock('http://127.0.0.1')
        .post('/_replicator', doc)
        .reply(200, {ok: true, id: '123', rev: '123'});

      cli('clusterone', 'mydb', 'https://target-repl.com/new-db')
      .then(resp => {
        assert.ok(resp.ok);
        done();
      });
    });

    lab.test('replicates db given cluster details with continuous and create_target', done => {
      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', "create-target": true, continuous: true})
        .then(() => {
          const doc = {
            "source":{
              "url":"http://127.0.0.1/mydb"
            },
            "target":{
              "url":"https://target-repl.com/new-db"
            },
            "continuous":true,
            "create_target":true
          };

          nock('http://127.0.0.1')
            .post('/_replicator', doc)
            .reply(200, {ok: true, id: '123', rev: '123'});

          cli('clusterone', 'mydb', 'https://target-repl.com/new-db')
          .then(resp => {
            assert.ok(resp.ok);
            done();
          });
        });
    });
  });
});
