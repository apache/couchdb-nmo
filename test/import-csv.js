import assert from 'assert';

import nock from 'nock';
import { createConfigFile } from './common';
import nmo from '../src/nmo.js';
import {cli} from '../src/import-csv.js';
import importcsv from '../src/import-csv.js';
import {mockNodeIsOnline} from './helpers.js';

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

    it('throws error if database name missing', (done) => {
      try {
        cli('mycluster');
      } catch(e) {
        assert.deepEqual(e.type, 'EUSAGE');
        done();
      }
    });

    it('throws error if bad url', () => {
      return cli('mycluster', 'dataasename', 'bad-url')
      .catch(e => {
        assert.ok(/Cluster does not exist/.test(e.message));
      });
    });

    it('full integration works', () => {
      const url = 'http://127.0.0.1';
      mockNodeIsOnline(url);
      nock(url)
        .put('/fake-csv')
        .reply(200)
        .post('/fake-csv/_bulk_docs')
        .reply(200);

      return cli('clusterone', 'fake-csv', __dirname + '/fixtures/fake.csv', 'delimiter=','');
    });
  });

  describe('upload to couchdb', () => {

    it('reports bad file', () => {
      const url = 'http://127.0.0.1:5984';
      mockNodeIsOnline(url);

      return importcsv(url, 'csv-upload',  'bad-fake.csv', {}).catch(function (err) {
        assert.ok(/Error reading file -/.test(err));
      });

    });

    it('logs error for failed request', () => {
      const url = 'http://127.0.0.1:5984';
      mockNodeIsOnline(url);
      nock(url)
        .put('/csv-upload')
        .reply(501);

      return importcsv(url, 'csv-upload', __dirname + '/fixtures/fake.csv', {}).catch(function (err) {
        assert.ok(/CouchDB server answered:/.test(err));
      });

    });

    it('Uploads csv file to CouchDB', () => {
      const url = 'http://127.0.0.1:5984';

      mockNodeIsOnline(url);
      nock(url)
        .put('/csv-upload')
        .reply(200)
        .post('/csv-upload/_bulk_docs', docs)
        .reply(200);

      return importcsv(url, 'csv-upload', __dirname + '/fixtures/fake.csv', {delimiter: ',', columns: true})
      .catch(function (err) {
        throw 'error ' + err;
      });
    });
  });
});
