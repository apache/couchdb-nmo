'use strict';

import assert from 'assert';
import Lab from 'lab';

import * as api from '../src/api.js';
import * as common from './common.js';


export let lab = Lab.script();

lab.experiment('isnodeonline', () => {

  let server;

  lab.beforeEach((done) => {
    server = common.createTestServer(done);
  });

  lab.afterEach((done) => {
    server.close(done);
  });


  lab.test('rejects the promise for connection errors', (done) => {
    api
      .isnodeonline(common.NODE + '/socketclose')
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });


  lab.test('returns error on no value provided', (done) => {
    api
      .isnodeonline()
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

  lab.test('returns error for all other errors', (done) => {
    api
      .isnodeonline({})
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

  lab.test('returns false for down site', (done) => {
    api
      .isnodeonline('http://127.0.0.1:65516')
      .then((res) => {
        assert.equal(res, false);
        done();
      });
  });

  lab.test('returns false for down site with bad DNS', (done) => {
    api
      .isnodeonline('http://example.neverexists')
      .then((res) => {
        assert.equal(res, false);
        done();
      });
  });

  lab.test('returns true for online site', (done) => {
    api
      .isnodeonline(common.NODE)
      .then((res) => {
        assert.equal(res, true);
        done();
      });
  });

});
