import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import * as version from '../src/v.js';
import versionApi from '../src/v.js';

import pkg from '../package.json';

const oldConsole = console.log;

lab.experiment('api: version', () => {

  lab.test('gets the current nmo version', (done) => {
    versionApi().then((res) => {
      assert.equal(pkg.version, res.nmo);
      done();
    });
  });
});

lab.experiment('cli: version', () => {
  lab.afterEach((done) => {
    console.log = oldConsole;
    done();
  });

  lab.test('logs the current version', (done) => {
    console.log = (...args) => {
      if (/nmo/.test(args[0])) {
        assert.ok(new RegExp(pkg.version, 'ig').test(args[0]));
      }
    };

    version
      .cli()
      .then(() => {
        done();
      });
  });
});
