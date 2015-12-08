import assert from 'assert';

import { createConfigFile } from './common';
import help from '../src/help.js';
import {cli} from '../src/help.js';

import nmo from '../src/nmo.js';
import { consoleMock } from './helpers';

const oldConsole = console.log;

describe('help', () => {
  createConfigFile();

  beforeEach(() => {
    return nmo.load({nmoconf: __dirname + '/fixtures/randomini'});
  });

  it('prints available commands', (done) => {
    console.log = consoleMock((...args) => {
      assert.ok(/help/.test(args[0]));
      assert.ok(/isonline/.test(args[0]));
      done();
    });

    help();
  });

  it('opens manpages', (done) => {
    cli('help')
      .then((child) => {
        child.kill();
        done();
      });
  });

});
