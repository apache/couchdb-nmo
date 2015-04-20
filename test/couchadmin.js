import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import couchadmin from '../src/couchadmin.js';

lab.experiment('couchadmin', () => {

  lab.test('throws if not config not loaded', (done) => {
    assert.throws(
      function () {
        couchadmin.commands.help();
      },
      Error
    );
    done();
  });

});
