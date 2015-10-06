import assert from 'assert';
import Lab from 'lab';

import isonline from '../src/isonline.js';
import {cli, getClusterUrls } from '../src/isonline.js';

import * as common from './common.js';
import nmo from '../src/nmo.js';

import nock from 'nock';

export let lab = Lab.script();
const oldConsole = console.log;
const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};

common.createConfigFile();

lab.experiment('isonline', () => {

  lab.experiment('cli', () => {
    lab.beforeEach((done) => {
      nmo
        .load(nmoconf)
        .then(() => done())
        .catch(() => done());

    });

    lab.afterEach((done) => {
      console.log = oldConsole;
      done();
    });

    lab.test('returns error on no value provided', (done) => {
      cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });

    lab.test('executes correct url for cluster name', (done) => {
      nock('http://127.0.0.1')
        .get('/')
        .reply(200);

      nock('http://192.168.0.1')
        .get('/')
        .reply(200);

      cli('clusterone')
        .then(res => {
          assert.deepEqual(res, {'http://127.0.0.1': true, 'http://192.168.0.1': true });
          done();
        });
    });

    lab.test('still executes for urls', (done) => {
     nock('http://127.0.0.1')
       .get('/')
       .reply(200);

     nmo
       .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
       .then(() => {
         return cli('http://127.0.0.1');
       }).then(res => {
         assert.deepEqual(res, {'http://127.0.0.1': true });
         done();
       });
     });

     lab.test('executes correct for multiple urls', (done) => {
       nock('http://127.0.0.1')
         .get('/')
         .reply(200);

       nock('http://192.168.0.1')
         .get('/')
         .reply(200);

       nmo
         .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
         .then(() => {
           return cli('http://127.0.0.1', 'http://192.168.0.1');
         }).then(res => {
           assert.deepEqual(res, {'http://127.0.0.1': true, 'http://192.168.0.1': true });
           done();
         });
     });
  });

  lab.experiment('api', () => {
    //I'm worried these before's are not actually running
    lab.beforeEach((done) => {
      nmo
        .load(nmoconf)
        .then(() => {
          done();
        })
        .catch(() => done());
      });
    });

    lab.afterEach((done) => {
      console.log = oldConsole;
      done();
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
      nock(common.NODE)
        .get('/')
        .reply(200);

      isonline(common.NODE)
        .then((res) => {
          assert.deepEqual(res, {[common.NODE]: true});
          done();
        });
    });

    lab.test('accepts multiple sites and options', (done) => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      nock(common.NODE_TWO)
        .get('/')
        .reply(200);

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

  lab.experiment('cli', () => {
    lab.beforeEach((done) => {
      done();
    });

    lab.afterEach((done) => {
      console.log = oldConsole;
      done();
    });

    lab.test('returns online for online nodes', (done) => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      console.log = (...args) => {
        assert.ok(/online/.test(args[1]), 'returns online for online nodes');
        done();
      };
      nmo.load({nmoconf: __dirname + '/fixtures/randomini', json: false})
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
      nock(common.NODE)
        .get('/')
        .reply(200);

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
