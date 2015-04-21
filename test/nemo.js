import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import nemo from '../src/nemo.js';

lab.experiment('nemo', () => {

  lab.test('throws if not config not loaded', (done) => {
    assert.throws(
      function () {
        nemo.commands.help();
      },
      Error
    );
    done();
  });

});
