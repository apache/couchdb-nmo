'use strict';

import assert from 'assert';
import http from 'http';

import Lab from 'lab';
export const lab = Lab.script();

import * as log from '../src/log.js';

lab.experiment('utils: log', () => {

  lab.test('returns a logger object', (done) => {
    assert.equal(typeof log.log, 'object');
    done();
  });
});
