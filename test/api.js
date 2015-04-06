'use strict';

import assert from 'assert';
import Lab from 'lab';

import * as api from '../src/api.js';
import * as common from './common.js';
import * as log from '../src/log.js';


export let lab = Lab.script();

lab.experiment('api', () => {

  let server;

  lab.before((done) => {
    server = common.createTestServer(done);
  });

  lab.after((done) => {
    server.close(done);
  });

  lab.test('isNodeOnline online retuns a promise', (done) => {
    api
      .isNodeOnlineCheck(common.NODE)
      .done(done);
  });

  lab.test('isNodeOnline offline retuns a promise', (done) => {
    api
      .isNodeOnlineCheck('http://127.0.0.1:65516')
      .done(function () {
        done();
      });
  });

});
