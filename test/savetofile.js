import assert from 'assert';
import {unlinkSync, readFileSync } from 'fs';

import savetofile, {cli} from '../src/savetofile.js';
import nmo from '../src/nmo.js';

import nock from 'nock';
import zlib from 'zlib';
import { createConfigFile } from './common';

describe('savetofile', () => {
  createConfigFile();
  beforeEach(() => {
    return nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  describe('cli', () => {

    it('Returns error for empty params', () => {
      cli().catch(err => {
        assert.ok(/Usage/.test(err.message));
      });
    });

    it('Returns error for missing file', () => {
      cli('a url').catch(err => {
        assert.ok(/Usage/.test(err.message));
      });
    });

    it('returns error with type EUSAGE for any error', () => {
      cli('http://127.0.0.1:5555', 'the-db', 'a-file')
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
      });

    });
  });

  describe('savetofile', () => {
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

    afterEach(() => {
      deleteFile(file1);
      deleteFile(file2);
      deleteFile(file3);
      deleteFile(file3 + '.gzip');
    });

    it('get all docs for db', () => {
      const url = 'http://127.0.1.20';
      nock(url)
        .get('/test-db/_all_docs?include_docs=true')
        .reply(200, []);

      return savetofile(url, 'test-db', file1);
    });

    it('saves contents to file', () => {
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

      return savetofile(url, 'test-db', file2)
      .then(() => {
        const fileContents = readFileSync(file2, 'utf8');
        var rows = resp.rows.map(row => row.doc);
        assert.deepEqual(JSON.parse(fileContents), rows);
      });
    });

    it('saves contents to file and zips with --zip', done => {
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
              const rows = resp.rows.map(row => row.doc);
              assert.deepEqual(JSON.parse(fileContents.toString()), rows);
              done();
            });
          });
        });
    });

    it('returns error on failed fetch of data', () => {
      return savetofile('http://127.0.0.1:5555', 'db', 'the-file')
      .catch(err => {
        assert.ok(/ECONNREFUSED/.test(err.message));
      });
    });
  });

});
