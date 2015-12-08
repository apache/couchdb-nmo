import assert from 'assert';

import nock from 'nock';
import { createConfigFile } from './common';
import nmo from '../src/nmo.js';
import {cli} from '../src/import-csv.js';
import importcsv from '../src/import-csv.js';

const docs = {
  'docs':[
    {
      'name':'John',
      'surname':' Rambo',
      'email':' john@rambo.com'
    },
    {
      name: 'Eddie',
      surname: ' Vedder',
      email: ' eddie@vedder.com'
    }
  ]};

describe('import csv', () => {
  createConfigFile();

  beforeEach(() => {
    return nmo.load({nmoconf: __dirname + '/fixtures/randomini'})

  });

  describe('cli', () => {

    it('throws error if no inputs', (done) => {
      try {
        cli();
      } catch(e) {
        assert.deepEqual(e.type, 'EUSAGE');
        done();
      }
    });

    it('throws error if bad url', (done) => {
      try {
        cli('file', 'bad-url');
      } catch(e) {
        assert.ok(/not a valid url/.test(e.message));
        done();
      }
    });

    it('full integration works', () => {
      nock('http://127.0.0.1:5984')
        .put('/fake-csv')
        .reply(200)
        .post('/fake-csv/_bulk_docs')
        .reply(200);

      return cli(__dirname + '/fixtures/fake.csv', 'http://127.0.0.1:5984/fake-csv', 'delimiter=','');
    });
  });

  describe('upload to couchdb', () => {

    it('reports bad file', () => {
      const url = 'http://127.0.0.1:5984';
      return importcsv('bad-fake.csv', url + '/csv-upload', {}).catch(function (err) {
        assert.ok(/Error reading file -/.test(err));
      });

    });

    it('logs error for failed request', () => {
      const url = 'http://127.0.0.1:5984';

      nock(url)
        .put('/csv-upload')
        .reply(501);

      return importcsv(__dirname + '/fixtures/fake.csv', url + '/csv-upload', {}).catch(function (err) {
        assert.ok(/CouchDB server answered:/.test(err));
      });

    });

    it('Uploads csv file to CouchDB', () => {
      const url = 'http://127.0.0.1:5984';

      nock(url)
        .put('/csv-upload')
        .reply(200)
        .post('/csv-upload/_bulk_docs', docs)
        .reply(200);

      return importcsv(__dirname + '/fixtures/fake.csv', url + '/csv-upload', {delimiter: ',', columns: true})
      .catch(function (err) {
        throw 'error ' + err;
      });
    });
  });
});
