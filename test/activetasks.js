import assert from 'assert';
import nock from 'nock';
import { createConfigFile } from './common';

import nmo from '../src/nmo.js';
import getActiveTask, { filterTasks, cli }  from '../src/activetasks.js';
import { consoleMock, mockNodeIsOnline } from './helpers';

describe('activetasks', () => {
  createConfigFile();
  const url = 'http://127.0.0.11';

  beforeEach(() => {
    return nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  describe('cli', () => {

    it('no arguments', done => {
      cli().catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });
    });

    it('does json', done => {

      mockNodeIsOnline(url);
      nock(url)
        .get('/_active_tasks')
        .reply(200, []);

      console.log = consoleMock(msg => {
        done();
        assert.deepEqual(msg, []);
      });

      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          cli(url);
        });

    });

    it('rejests errors', () => {
      return cli(url)
      .catch(err => {
        assert.ok(err);
      });
    });

    it('Not existing cluster', () => {

      return cli('wrong').catch(err => {
        assert.ok(/Cluster does not exist/.test(err.message));
      });
    });

    it('returns no active tasks for filter', done => {
      console.log = consoleMock((msg, log) => {
        assert.ok(/for that filter/.test(msg));
        done();
      });

      mockNodeIsOnline(url);

      nock(url)
        .get('/_active_tasks')
        .reply(200, []);

      cli(url, 'filter');
    });

    it('returns no active tasks', done => {
      console.log = consoleMock(function (msg) {
        assert.ok(/There are no active tasks/.test(msg));
        done();
      });

      mockNodeIsOnline(url)

      nock(url)
        .get('/_active_tasks')
        .reply(200, []);

      cli(url);
    });

    it('returns active tasks', done => {
      const resp = `[{"node":"node1@127.0.0.1","pid":"<0.8331.5>",
                    "changes_pending":null,"checkpoint_interval":5000,
                    "checkpointed_source_seq":"1234",
                    "continuous":true,"database":null,
                    "doc_id":null,"doc_write_failures":0,"docs_read":44,
                    "docs_written":44,"missing_revisions_found":44,
                    "replication_id":"123123123",
                    "revisions_checked":44,
                    "source":"http://127.0.0.1:15984/mango-query/",
                    "source_seq":"1231",
                    "started_on":1444135320,
                    "target":"http://127.0.0.1:15984/test-mango/",
                    "through_seq":"12313","type":"replication",
                    "updated_on":1444135325,"user":null}]`;

      mockNodeIsOnline(url);
      nock(url)
        .get('/_active_tasks')
        .reply(200, resp);

      console.log = consoleMock(msg => {
        if (!/Active/.test(msg)) { return; }

        assert.ok(/Active Tasks:/.test(msg));
        done();
      });

      cli(url);
    });
  });

  describe('getActiveTask', () => {

    it('rejects for invalid url', () => {

      return getActiveTask('hhhh')
        .catch(err => {
          assert.deepEqual(err.type, 'EUSAGE');
        });
    });

    it('returns error for bad connections', () => {

      return getActiveTask('http://doesnotexist.invalid')
      .catch(err => {
        assert.ok(/Could not connect/.test(err.message));
      });

    });

    it('returns active tasks info', () => {
      const resp = `[{"node":"node1@127.0.0.1","pid":"<0.8331.5>",
                    "changes_pending":null,"checkpoint_interval":5000,
                    "checkpointed_source_seq":"1234",
                    "continuous":true,"database":null,
                    "doc_id":null,"doc_write_failures":0,"docs_read":44,
                    "docs_written":44,"missing_revisions_found":44,
                    "replication_id":"123123123",
                    "revisions_checked":44,
                    "source":"http://127.0.0.1:15984/mango-query/",
                    "source_seq":"1231",
                    "started_on":1444135320,
                    "target":"http://127.0.0.1:15984/test-mango/",
                    "through_seq":"12313","type":"replication",
                    "updated_on":1444135325,"user":null}]`;

      mockNodeIsOnline(url);
      nock(url)
        .get('/_active_tasks')
        .reply(200, resp);

      return getActiveTask(url)
      .then(activetasks => {
        assert.deepEqual(activetasks, JSON.parse(resp));
      });
    });
  });

  describe('filterTasks', () => {
    const tasks = [
      {
        type: 'replication',
        target: 'mydatabase'
      },
      {
        type: 'view_compaction',
        target: 'another-db'
      },
      {
        type: 'indexer',
        source: 'mydatabase'
      },
    ];

    it('for no filter returns', () => {
      const filtered = filterTasks(tasks);
      assert.deepEqual(tasks, filtered);
    });

    it('only returns for filtered type', () => {
      const filtered = filterTasks(tasks, 'replication');
      assert.deepEqual(filtered.length, 1);
      assert.deepEqual(filtered[0].type, 'replication');
    });

    it('returns filter for database', () => {
      const filtered = filterTasks(tasks, 'mydatabase');
      assert.deepEqual(filtered.length, 2);
      assert.deepEqual(filtered[0].target, 'mydatabase');
    });
  });

});
