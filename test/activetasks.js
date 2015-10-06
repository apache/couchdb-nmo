import assert from 'assert';
import nock from 'nock';
import Lab from 'lab';
export const lab = Lab.script();
import { createConfigFile } from './common';

import nmo from '../src/nmo.js';
import getActiveTask, { filterTasks, cli }  from '../src/activetasks.js';

lab.experiment('activetasks', () => {
  createConfigFile();
  lab.beforeEach((done) => {
    nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'})
      .then(() => done())
      .catch(() => done());
  });

  lab.experiment('cli', () => {
    const oldConsole = console.log;

    lab.afterEach(done => {
      console.log = oldConsole;
      done();
    });

    lab.test('no arguments', done => {
      cli().catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });
    });

    lab.test('does json', done => {
      nock('http://127.0.0.11')
        .get('/_active_tasks')
        .reply(200, []);

      console.log = msg => {
        assert.deepEqual(msg, []);
        done();
      };

      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          cli('http://127.0.0.11');
        });

    });

    lab.test('rejests errors', done => {
      cli('http://127.0.0.11')
      .catch(err => {
        assert.ok(err);
        done();
      });
    });

    lab.test('Not existing cluster', (done) => {

      cli('wrong').catch(err => {
        assert.ok(/Cluster does not exist/.test(err.message));
        done();
      });
    });

    lab.test('returns no active tasks for filter', done => {
      console.log = function (msg) {
        assert.ok(/for that filter/.test(msg));
        done();
      };

      nock('http://127.0.0.11')
        .get('/_active_tasks')
        .reply(200, []);

      cli('http://127.0.0.11', 'filter');
    });


    lab.test('returns no active tasks', done => {
      console.log = function (msg) {
        assert.ok(/There are no active tasks/.test(msg));
        done();
      };

      nock('http://127.0.0.11')
        .get('/_active_tasks')
        .reply(200, []);

      cli('http://127.0.0.11');
    });

    lab.test('returns active tasks', done => {
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

      nock('http://127.0.0.11')
        .get('/_active_tasks')
        .reply(200, resp);

      console.log = msg => {
        if (!/Active/.test(msg)) { return; }

        assert.ok(/Active Tasks:/.test(msg));
        done();
      };

      cli('http://127.0.0.11');
    });

  });



  lab.experiment('getActiveTask', () => {

    lab.test('rejects for invalid url', done => {

      getActiveTask('hhhh')
        .catch(err => {
          assert.deepEqual(err.type, 'EUSAGE');
          done();
        });
    });

    lab.test('returns error for bad connections', done => {

      getActiveTask('http://127.1.1.10')
      .catch(err => {
        console.log('ERR', err);
        assert.ok(/Could not connect/.test(err.message));
        done();
      });

    });

    lab.test('returns active tasks info', done => {
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

      nock('http://127.0.0.11')
        .get('/_active_tasks')
        .reply(200, resp);

      getActiveTask('http://127.0.0.11')
      .then(activetasks => {
        assert.deepEqual(activetasks, JSON.parse(resp));
        done();
      });
    });
  });

  lab.experiment('filterTasks', () => {
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

    lab.test('for no filter returns', done => {
      const filtered = filterTasks(tasks);
      assert.deepEqual(tasks, filtered);
      done();
    });

    lab.test('only returns for filtered type', done => {
      const filtered = filterTasks(tasks, 'replication');
      assert.deepEqual(filtered.length, 1);
      assert.deepEqual(filtered[0].type, 'replication');
      done();
    });

    lab.test('returns filter for database', done => {
      const filtered = filterTasks(tasks, 'mydatabase');
      assert.deepEqual(filtered.length, 2);
      assert.deepEqual(filtered[0].target, 'mydatabase');
      done();
    });
  });

});
