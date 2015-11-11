import assert from 'assert';
import Lab from 'lab';
import {unlinkSync, readFileSync } from 'fs';

import savetofile, {cli} from '../src/savetofile.js';
import nmo from '../src/nmo.js';

import nock from 'nock';
import zlib from 'zlib';
import { createConfigFile } from './common';

export let lab = Lab.script();

lab.experiment('savetofile', () => {
  createConfigFile();
  lab.beforeEach((done) => {
    nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'})
      .then(() => done())
      .catch(() => done());
  });

  lab.experiment('cli', () => {

    lab.test('Returns error for empty params', done => {
      cli().catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });
    });

    lab.test('Returns error for missing file', done => {
      cli('a url').catch(err => {
        assert.ok(/Usage/.test(err.message));
        done();
      });
    });

    lab.test('returns error with type EUSAGE for any error', done => {
      cli('http://127.0.0.1:5555', 'the-db', 'a-file')
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
        done();
      });

    });
  });

  lab.experiment('savetofile', () => {
    const file1 =  __dirname + '/fixtures/delete-me-please.json';
    const file2 = __dirname + '/fixtures/savetofiletest.json';
    const file3 = __dirname + '/fixtures/savetofiletest.json';

    function deleteFile (file) {
      //try and delete file. Its ok if it fails
      try {
        unlinkSync(file);
      } catch (e) {

      }
    }

    lab.afterEach(done => {
      deleteFile(file1);
      deleteFile(file2);
      deleteFile(file3);
      deleteFile(file3 + '.gzip');
      done();
    });

    lab.test('get all docs for db', done => {
      const url = 'http://127.0.1.20';
      nock(url)
        .get('/test-db/_all_docs?include_docs=true')
        .reply(200, []);

      savetofile(url, 'test-db', file1)
      .then(() => {
        done();
      });

    });

    lab.test('saves contents to file', done => {
      const resp = {
        'total_rows':2,
        'offset':0,
        'rows':[
            {
              'id':'0461444c-e60a-457d-a4bb-b8d811853f21',
              'key':'0461444c-e60a-457d-a4bb-b8d811853f21',
              'value':{'rev':'1-090ec379aecccc97f8d02bc024ba28e5'},
              'doc':{
                '_id':'0461444c-e60a-457d-a4bb-b8d811853f21',
                '_rev':'1-090ec379aecccc97f8d02bc024ba28e5',
                'name': 'Garren'
              }
            },
            {
              'id':'0461444c-e60a-457d-a4bb-b8d811853123',
              'key':'0461444c-e60a-457d-a4bb-b8d811853123',
              'value':{'rev':'1-090ec379aecccc97f8d02bc024ba123'},
              'doc':{
                '_id':'0461444c-e60a-457d-a4bb-b8d811853f21',
                '_rev':'1-090ec379aecccc97f8d02bc024ba28e5',
                'name': 'Robert'
              }
            }
        ]
      };
      const url = 'http://127.0.1.20';

      nock(url)
        .get('/test-db/_all_docs?include_docs=true')
        .reply(200, resp);

      savetofile(url, 'test-db', file2)
      .then(() => {
        const fileContents = readFileSync(file2, 'utf8');
        var rows = resp.rows.map(row => row.doc);
        assert.deepEqual(JSON.parse(fileContents), rows);
        done();
      });
    });

    lab.test('saves contents to file and zips with --zip', done => {
      const resp = {
        'total_rows':2,
        'offset':0,
        'rows':[
            {
              'id':'0461444c-e60a-457d-a4bb-b8d811853f21',
              'key':'0461444c-e60a-457d-a4bb-b8d811853f21',
              'value':{'rev':'1-090ec379aecccc97f8d02bc024ba28e5'},
              'doc':{
                '_id':'0461444c-e60a-457d-a4bb-b8d811853f21',
                '_rev':'1-090ec379aecccc97f8d02bc024ba28e5',
                'name': 'Garren'
              }
            },
            {
              'id':'0461444c-e60a-457d-a4bb-b8d811853123',
              'key':'0461444c-e60a-457d-a4bb-b8d811853123',
              'value':{'rev':'1-090ec379aecccc97f8d02bc024ba123'},
              'doc':{
                '_id':'0461444c-e60a-457d-a4bb-b8d811853f21',
                '_rev':'1-090ec379aecccc97f8d02bc024ba28e5',
                'name': 'Robert'
              }
            }
        ]
      };
      const url = 'http://127.0.1.20';

      nock(url)
        .get('/test-db/_all_docs?include_docs=true')
        .reply(200, resp);
      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', compress: true})
        .then(() => {
          savetofile(url, 'test-db', file3)
          .then(() => {
            zlib.unzip(readFileSync(file3 + '.gzip'), function (err, fileContents) {
              var rows = resp.rows.map(row => row.doc);
              assert.deepEqual(JSON.parse(fileContents.toString()), rows);
              done();
            });
          });
        });
    });

    lab.test('returns error on failed fetch of data', done => {
      savetofile('http://127.0.0.1:5555', 'db', 'the-file')
      .catch(err => {
        assert.ok(/ECONNREFUSED/.test(err.message));
        done();
      });

    });
  });

});
