import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import nemo from '../src/nemo.js';


lab.experiment('nemo', () => {
  lab.test('throws for api commands if config not loaded', (done) => {
    nemo.config = null;
    assert.throws(
      function () {
        nemo.commands.help();
      },
      Error
    );
    done();
  });

  lab.test('throws for cli commands if config not loaded', (done) => {
    nemo.config = null;
    assert.throws(
      function () {
        nemo.cli.help();
      },
      Error
    );
    done();
  });

  lab.test('does not throw for cli commands if config not loaded', (done) => {
    nemo.config = null;
    nemo.load({nemoconf: __dirname + '/fixtures/randomini'}).then(() => {
      nemo.cli.help().then(() => {
        done();
      });
    });
  });

  lab.test('rejects on failure', (done) => {
    nemo.load({nemoconf: 'bler'}).catch(() => {
      done();
    });
  });
});
