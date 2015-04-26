import assert from 'assert';
import Lab from 'lab';

import isonline from '../src/isonline.js';
import * as common from './common.js';
import log from 'npmlog';


export let lab = Lab.script();
const oldConsole = console.log;

lab.experiment('isonline', () => {

  let servers;

  lab.beforeEach((done) => {
    console.log = oldConsole;
    common.createTestServers().done((s) => {
      servers = s;
      done();
    });
  });

  lab.afterEach((done) => {
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

  lab.test('returns error on no value provided', (done) => {
    isonline()
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

  lab.test('accepts multiple sites', (done) => {
    isonline(common.NODE, common.NODE_TWO)
      .then((res) => {
        assert.deepEqual(res, {[common.NODE]: true, [common.NODE_TWO]: true});
        done();
      });
  });

  lab.test('accepts multiple sites and options', (done) => {
    console.log = (...args) => {
      assert.deepEqual({
        [common.NODE]: true,
        [common.NODE_TWO]: true
      }, args[0]);
    };
    isonline(common.NODE, common.NODE_TWO, {json: true})
      .then((res) => {
        assert.deepEqual(res, {[common.NODE]: true, [common.NODE_TWO]: true});
        done();
      });
  });

  lab.test('it logs per default', (done) => {
    console.log = (...args) => {
      assert.ok(args[0]);
      done();
    };
    isonline(common.NODE);
  });

  lab.test('silent does not output', (done) => {

    console.log = (...args) => {
      throw new Error('not silent');
    };

    isonline(common.NODE, {silent: true, json: false})
      .then((res) => {
        done();
      });
  });

  lab.test('can output json', (done) => {

    console.log = (...args) => {
      assert.deepEqual({ [common.NODE]: true }, args[0]);
    };

    isonline(common.NODE, {silent: false, json: true})
      .then((res) => {
        done();
      });
  });

  lab.test('if silent output is selected, print output is not provided', (done) => {

    console.log = (...args) => {
      throw new Error('fail');
    };

    isonline(common.NODE, {silent: true, json: false})
      .then((res) => {
        assert.deepEqual(res, {[common.NODE]: true});
        done();
      });
  });

  lab.test('silent & json are not compatible', (done) => {

    isonline(common.NODE, {silent: true, json: true})
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

});
