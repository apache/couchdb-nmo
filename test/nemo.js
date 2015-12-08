import assert from 'assert';
import nmo from '../src/nmo.js';


describe('nmo', () => {
  it('throws for api commands if config not loaded', (done) => {
    nmo.config = null;
    assert.throws(
      function () {
        nmo.commands.help();
      },
      Error
    );
    done();
  });

  it('throws for cli commands if config not loaded', (done) => {
    nmo.config = null;
    assert.throws(
      function () {
        nmo.cli.help();
      },
      Error
    );
    done();
  });

  it('does not throw for cli commands if config not loaded', (done) => {
    nmo.config = null;
    nmo.load({nmoconf: __dirname + '/fixtures/randomini'}).then(() => {
      nmo.cli.help().then(() => {
        done();
      });
    });
  });

  it('rejects on failure', (done) => {
    nmo.load({nmoconf: 'bler'}).catch(() => {
      done();
    });
  });

  it('has a version property', () => {
    nmo.config = null;
    return nmo.load({nmoconf: __dirname + '/fixtures/randomini'}).then(() => {
      assert.ok(nmo.version);
    });
  });
});
