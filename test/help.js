import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import help from '../src/help.js';
import {load} from '../src/couchadmin.js';

lab.experiment('help', () => {

  lab.before((done) => {
    load().then(() => {
      done();
    });
  });

  lab.test('prints available commands', (done) => {
    const oldConsole = console.log;
    console.log = (...args) => {
      assert.ok(/help/.test(args[0]));
      assert.ok(/isonline/.test(args[0]));
      return oldConsole.apply(oldConsole, args);
    };

    help()
      .then((res) => {
        console.log = oldConsole;
        done();
      });
  });

});
