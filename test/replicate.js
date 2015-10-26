import assert from 'assert';
import Lab from 'lab';
import nock from 'nock';

import {createReplicatorDoc, replicate} from '../src/replicate.js';
export let lab = Lab.script();


lab.experiment('replicate', () => {

  lab.experiment('createReplicatorDoc', () => {
    lab.test('creates correctly defined doc', (done) => {
      var doc = createReplicatorDoc('source-url', 'target-url', {continuous: true, "create_target": true});

      assert.deepEqual({
        source: {
          url: 'source-url'
        },

        target: {
          url: 'target-url'
        },
        continuous: true,
        "create_target": true
      }, doc);

      done();
    });
  });

  lab.experiment('replicate', () => {

    lab.it('returns json response', done => {
      var data = {ok: true};
      var payload = {
        source: {
          url: 'source-url'
        },

        target: {
          url: 'target-url'
        },
        continuous: true,
        "create_target": true
      };

      nock('http://127.0.0.1')
        .post('/_replicator')
        .reply(200, data);

      replicate('http://127.0.0.1/_replicator', payload)
      .then(resp => {
        assert.deepEqual(resp, data);
        done();
      });


    });

    lab.it('returns error on failed replication', done => {
      nock('http://127.0.0.1')
        .post('/_replicator')
        .reply(500, {reason: 'ERROR'});

      replicate('http://127.0.0.1/_replicator', {})
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
        done();
      });

    });

  });
});
