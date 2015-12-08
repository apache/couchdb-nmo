import assert from 'assert';
import nock from 'nock';

import {createReplicatorDoc, replicate} from '../src/replicate.js';

describe('replicate', () => {

  describe('createReplicatorDoc', () => {
    it('creates correctly defined doc', () => {
      var doc = createReplicatorDoc('source-url', 'target-url', {continuous: true, 'create_target': true});

      assert.deepEqual({
        source: {
          url: 'source-url'
        },

        target: {
          url: 'target-url'
        },
        continuous: true,
        'create_target': true
      }, doc);

    });
  });

  describe('replicate', () => {

    it('returns json response', () => {
      var data = {ok: true};
      var payload = {
        source: {
          url: 'source-url'
        },

        target: {
          url: 'target-url'
        },
        continuous: true,
        'create_target': true
      };

      nock('http://127.0.0.1')
        .post('/_replicator')
        .reply(200, data);

      return replicate('http://127.0.0.1/_replicator', payload)
      .then(resp => {
        assert.deepEqual(resp, data);
      });
    });

    it('returns error on failed replication', () => {
      nock('http://127.0.0.1')
        .post('/_replicator')
        .reply(500, {reason: 'ERROR'});

      return replicate('http://127.0.0.1/_replicator', {})
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
      });
    });
  });
});
