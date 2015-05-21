import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import nmo from '../src/nmo.js';


lab.experiment('nmo', () => {
  lab.test('throws for api commands if config not loaded', (done) => {
    nmo.config = null;
    assert.throws(
      function () {
        nmo.commands.help();
      },
      Error
    );
    done();
  });

  lab.test('throws for cli commands if config not loaded', (done) => {
    nmo.config = null;
    assert.throws(
      function () {
        nmo.cli.help();
      },
      Error
    );
    done();
  });

  lab.test('does not throw for cli commands if config not loaded', (done) => {
    nmo.config = null;
    nmo.load({nmoconf: __dirname + '/fixtures/randomini'}).then(() => {
      nmo.cli.help().then(() => {
        done();
      });
    });
  });

  lab.test('rejects on failure', (done) => {
    nmo.load({nmoconf: 'bler'}).catch(() => {
      done();
    });
  });
});
