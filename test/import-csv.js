import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();
import nock from 'nock';
import nmo from '../src/nmo.js';
import {cli, importcsv} from '../src/import-csv.js';

const docs = {
  "docs":[
    {
      "name":"John",
      "surname":" Rambo",
      "email":" john@rambo.com"
    },
    {
      name: 'Eddie',
      surname: ' Vedder',
      email: ' eddie@vedder.com'
    }
  ]};

lab.experiment('import csv', () => {
  lab.beforeEach((done) => {
    nmo
      .load({nmoconf: __dirname + '/fixtures/randomini'})
      .then(() => done())
      .catch(() => done());

  });

  lab.experiment('cli', () => {

    lab.test('throws error if no inputs', (done) => {

      try {
        cli();
      } catch(e) {
        assert.deepEqual(e.type, 'EUSAGE');
      }
      done();
    });

    lab.test('throws error if bad url', (done) => {

      try {
        cli('file', 'bad-url');
      } catch(e) {
        assert.ok(/not a valid url/.test(e.message));
      }
      done();
    });

    lab.test('full integration works', (done) => {
      nock('http://127.0.0.1:5984')
        .put('/fake-csv')
        .reply(200)
        .post('/fake-csv/_bulk_docs')
        .reply(200);

      cli(__dirname + '/fixtures/fake.csv', 'http://127.0.0.1:5984/fake-csv', 'delimiter=","')
      .then(done);
    });
  });

  lab.experiment('upload to couchdb', () => {

    lab.test('reports bad file', (done) => {
      const url = 'http://127.0.0.1:5984';
      importcsv('bad-fake.csv', url + '/csv-upload', {}).catch(function (err) {
        assert.ok(/Error reading file -/.test(err));
        done();
      });

    });

    lab.test('logs error for failed request', (done) => {
      const url = 'http://127.0.0.1:5984';

      nock(url)
        .put('/csv-upload')
        .reply(501);

      importcsv(__dirname + '/fixtures/fake.csv', url + '/csv-upload', {}).catch(function (err) {
        assert.ok(/CouchDB server answered:/.test(err));
        done();
      });

    });

    lab.test('Uploads csv file to CouchDB', (done) => {
      const url = 'http://127.0.0.1:5984';

      nock(url)
        .put('/csv-upload')
        .reply(200)
        .post('/csv-upload/_bulk_docs', docs)
        .reply(200);

      importcsv(__dirname + '/fixtures/fake.csv', url + '/csv-upload', {delimiter: ',', columns: true}).then(function () {
        done();
      }).catch(function (err) {
        throw 'error ' + err;
      });

    });

  });

});
