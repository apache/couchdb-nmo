import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import { createConfigFile } from './common';
import help from '../src/help.js';
import {cli} from '../src/help.js';

import {load} from '../src/nmo.js';

const oldConsole = console.log;

lab.experiment('help', () => {
  createConfigFile();

  lab.before((done) => {
    load({nmoconf: __dirname + '/fixtures/randomini'}).then(() => {
      done();
    });
  });

  lab.afterEach((done) => {
    console.log = oldConsole;
    done();
  });

  lab.test('prints available commands', (done) => {
    console.log = (...args) => {
      assert.ok(/help/.test(args[0]));
      assert.ok(/isonline/.test(args[0]));
    };

    help()
      .then((res) => {
        done();
      });
  });

  lab.test('opens manpages', (done) => {
    cli('help')
      .then((child) => {
        child.kill();
        done();
      });
  });

});
