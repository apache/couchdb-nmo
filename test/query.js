import assert from 'assert';
import { consoleMock } from './helpers';

import { cli, run, createIndex } from '../src/query.js';

import * as common from './common.js';
import nmo from '../src/nmo.js';

import nock from 'nock';

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};

common.createConfigFile();

describe('Mongo Queries', () => {
  beforeEach(() => {
    return nmo.load(nmoconf);
  });

  describe('cli', () => {

    it('returns error on no value provided', () => {
      return cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });

    it('returns error if selector is wrong', () => {
      return cli('clusterone', 'dbname', '{selector: {:null}}')
        .catch((err) => {
          assert.ok(/Incorrect selector/.test(err.message));
        });
    });

    it('returns error if selector is missing quotes', () => {
      return cli('mycluster', 'dbname', '{selector:', ': {:null}}')
        .catch((err) => {
          assert.ok(/You have to/.test(err.message));
        });
    });

    it('processes fields correctly', () => {
      const index = {
        index: {
          fields: ['name', 'surname', 'boom']
        },
        type : 'json'
      };

      nock('http://127.0.0.1')
        .post('/mydb/_index', index)
        .reply(200, {result: 'created'});

      return cli('clusterone', 'mydb', 'create', 'name, surname ,boom')
        .then(resp => {
          assert.deepEqual(resp.result, 'created');
        });
    });

    it('warns if fields are missing', () => {
      return cli('clusterone', 'mydb', 'create')
        .catch(err => {
          assert.ok(/Please supply/.test(err.message));
        });
    });

    it('warns if fields are empty', () => {
      return cli('clusterone', 'mydb', 'create', '')
        .catch(err => {
          assert.ok(/Please supply/.test(err.message));
        });
    });
  });

  describe('run', () => {
    it('requests find run correctly', () => {
      const selector = {selector: {_id: 'one'}};

      nock('http://127.0.0.1')
        .post('/mydb/_find', selector)
        .reply(200, {docs: [{id: 'one', rev: '123'}]});

      return run('clusterone', 'mydb', selector)
      .then(resp => {
        assert.deepEqual(resp.docs.length, 1);
      });
    });

    it('returns error', () => {
      var selector = {selector: {_id: 'one'}};

      nock('http://127.0.0.1')
        .post('/mydb/_find', selector)
        .reply(500, {message: 'error'});

      return run('clusterone', 'mydb', selector)
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
      });
    });
  });

  describe('createIndex', () => {
    it('creates indexes', () => {
      const index = {
        index: {
          fields: ['foo']
        },
        type : 'json'
      };

      nock('http://127.0.0.1')
        .post('/mydb/_index', index)
        .reply(200, {result: 'created'});

      return createIndex('clusterone', 'mydb', ['foo'])
      .then(resp => {
        assert.deepEqual(resp.result, 'created');
      });
    });

    it('returns error', () => {
      nock('http://127.0.0.1')
        .post('/mydb/_index')
        .reply(500, {message: 'error'});

      return createIndex('clusterone', 'mydb', [])
      .catch(err => {
        assert.deepEqual(err.type, 'EUSAGE');
      });
    });
  });
});
