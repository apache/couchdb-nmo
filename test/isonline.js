import assert from 'assert';
import Lab from 'lab';

import isonline from '../src/isonline.js';
import {cli} from '../src/isonline.js';

import * as common from './common.js';
import log from 'npmlog';
import nmo from '../src/nmo.js';


export let lab = Lab.script();
const oldConsole = console.log;

lab.experiment('isonline', () => {

  let servers, conf;

  lab.experiment('cli', () => {
    lab.beforeEach((done) => {
      conf = {nmoconf: __dirname + '/fixtures/randomini'};

      common.createTestServers().done((s) => {
        servers = s;
        done();
      });
    });

    lab.afterEach((done) => {
      console.log = oldConsole;

      common.stopTestServers(servers).then((res) => {
        done();
      });
    });

    lab.test('returns error on no value provided', (done) => {
      cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });
  });


  lab.experiment('api', () => {
    lab.beforeEach((done) => {
      conf = {nmoconf: __dirname + '/fixtures/randomini'};

      common.createTestServers().done((s) => {
        servers = s;
        done();
      });
    });

    lab.afterEach((done) => {
      console.log = oldConsole;

      common.stopTestServers(servers).then((res) => {
        done();
      });
    });

    lab.test('rejects the promise for connection errors', (done) => {
      isonline(common.NODE + '/socketclose')
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });

    lab.test('returns error for all other errors', (done) => {
      isonline({})
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });

    lab.test('returns false for down site', (done) => {
      isonline('http://127.0.0.1:65516')
        .then((res) => {
          assert.deepEqual(res, {'http://127.0.0.1:65516': false});
          done();
        });
    });

    lab.test('returns an error for non http urls', (done) => {
      isonline('ftp://127.0.0.1:65516')
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });

    lab.test('returns false for down site with bad DNS', (done) => {
      isonline('http://exampleneverexists')
        .then((res) => {
          assert.deepEqual(res, {'http://exampleneverexists': false});
          done();
        });
    });

    lab.test('returns true for online site', (done) => {
      isonline(common.NODE)
        .then((res) => {
          assert.deepEqual(res, {[common.NODE]: true});
          done();
        });
    });

    lab.test('accepts multiple sites and options', (done) => {
      nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          isonline(common.NODE, common.NODE_TWO).then((res) => {
            assert.deepEqual(res, {
              [common.NODE]: true,
              [common.NODE_TWO]: true
            });
            done();
          });
        });
    });
  });

  lab.experiment('cli', () => {
    lab.beforeEach((done) => {
      conf = {nmoconf: __dirname + '/fixtures/randomini'};

      common.createTestServers().done((s) => {
        servers = s;
        done();
      });
    });
    lab.afterEach((done) => {
      console.log = oldConsole;

      common.stopTestServers(servers).then((res) => {
        done();
      });
    });
    lab.test('returns online for online nodes', (done) => {
      console.log = (...args) => {
        assert.ok(/online/.test(args[1]), 'returns online for online nodes');
        done();
      };
      nmo.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(() => {
          cli(common.NODE);
        });
    });

    lab.test('returns offline for offline nodes', (done) => {
      console.log = (...args) => {
        assert.ok(/offline/.test(args[1]), 'returns offline for online nodes');
        done();
      };
      nmo.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(() => {
          cli('http://exampleneverexists');
        });
    });

    lab.test('can output json', (done) => {

      console.log = (...args) => {
        assert.deepEqual({ [common.NODE]: true }, args[0]);
      };

      nmo.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          cli(common.NODE)
            .then(() => {
              done();
            });
        });
    });
  });
});
