import assert from 'assert';
import nock from 'nock';
import { createConfigFile } from './common';

import nmo from '../src/nmo.js';
import importmongo, { validateMongoUrl, cli }  from '../src/import-mongo.js';
import mongo from 'mongodb';
import JSONStream from 'JSONStream';

//mongodb mock
const mongoDocs = [{a: 1}, {b: 2}];
const col = {
  find: function () {
    const stream = JSONStream.stringify();
    setTimeout(function () {
      stream.write(mongoDocs);
      stream.end();
    }, 10);
    return stream;
  },
  count: function (cb) {
    cb(null, mongoDocs.length);
  }
};

mongo.connect = function (url, cb) {
  const db = {
    collection: function () {
      return col;
    },

    close: function () {

    }
  };

  cb(null, db);
};

describe('import-mongo', () => {
  createConfigFile();
  beforeEach(() => {
    nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  describe('cli', () => {
    it('throws error if no inputs', (done) => {

      try {
        cli();
      } catch(e) {
        assert.deepEqual(e.type, 'EUSAGE');
      }
      done();
    });

  });

  describe('validateMongoUrl', () => {
    it('returns false for bad url', () => {
      assert.ok(!validateMongoUrl('bad-url'));
    });

    it('returns true for valid url', () => {
      assert.ok(validateMongoUrl('mongodb://localhost:27017/test'));
    });
  });

  describe('importmongo', done => {

    it('imports from mongodb to couchdb', () => {
      nock('http://127.0.0.1')
        .put('/fake-mongo')
        .reply(200)
        .post('/fake-mongo/_bulk_docs', {docs:[ '[\n[{"a":1},{"b":2}]', '\n]\n' ] })
        .reply(200);

      return importmongo('clusterone', 'fake-mongo', 'mongodb://localhost:27017/test', 'restaurants');

    });

    it('error for bad mongodb url', () => {
      return importmongo('clusterone', 'fake-mongo', 'bad-mongo-url', 'restaurants')
      .catch(function (err) {
        assert.ok(/Invalid MongoDB/.test(err.message));
      });
    });

     it('rejects on an error', () => {
      nock('http://127.0.0.1')
        .put('/fake-mongo')
        .reply(200)
        .post('/fake-mongo/_bulk_docs')
        .reply(500, 'error with docs');

      return importmongo('clusterone', 'fake-mongo', 'mongodb://localhost:27017/test', 'restaurants')
      .catch(function (err) {
        assert.ok(/error with docs/.test(err.message));
      });
     });

     it('returns error for no docs in collection', () => {
      col.count = (cb) => {cb(null, 0);};

      return importmongo('clusterone', 'fake-mongo', 'mongodb://localhost:27017/test', 'restaurants')
      .catch(function (err) {
        assert.ok(/There are 0 documents/.test(err.message));
      });

     });
  });
});
