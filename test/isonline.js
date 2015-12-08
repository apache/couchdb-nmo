import assert from 'assert';
import { consoleMock } from './helpers';

import isonline, {cli} from '../src/isonline.js';

import * as common from './common.js';
import nmo from '../src/nmo.js';

import nock from 'nock';

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};


describe('isonline', () => {
  common.createConfigFile();

  describe('cli', () => {

    beforeEach(() => {
      return nmo.load(nmoconf)
    });

    it('returns error on no value provided', () => {
      return cli()
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });

    it('executes correct url for cluster name', () => {
      nock('http://127.0.0.1')
        .get('/')
        .reply(200);

      nock('http://192.168.0.1')
        .get('/')
        .reply(200);

      return cli('clusterone')
        .then(res => {
          assert.deepEqual(res, {'http://127.0.0.1': true, 'http://192.168.0.1': true });
        });
    });

    it('still executes for urls', () => {
     nock('http://127.0.0.1')
       .get('/')
       .reply(200);

     return nmo
       .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
       .then(() => {
         return cli('http://127.0.0.1');
       }).then(res => {
         assert.deepEqual(res, {'http://127.0.0.1': true });
       });
     });

     it('executes correct for multiple urls', () => {
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
         });
     });
  });

  describe('api', () => {

    beforeEach(() => {
      return nmo.load(nmoconf);
    });

    it('returns error for all other errors', () => {
      return isonline({})
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });

    it('returns false for down site', () => {
      return isonline('http://127.0.0.1:65516')
        .then((res) => {
          assert.deepEqual(res, {'http://127.0.0.1:65516': false});
        });
    });

    it('returns an error for non http urls', () => {
      return isonline('ftp://127.0.0.1:65516')
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });

    it('returns false for down site with bad DNS', () => {
      isonline('http://exampleneverexists')
        .then((res) => {
          assert.deepEqual(res, {'http://exampleneverexists': false});
        });
    });

    it('returns true for online site', () => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      return isonline(common.NODE)
        .then((res) => {
          assert.deepEqual(res, {[common.NODE]: true});
        });
    });

    it('accepts multiple sites and options', () => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      nock(common.NODE_TWO)
        .get('/')
        .reply(200);

      return nmo
        .load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          return isonline(common.NODE, common.NODE_TWO);
        }).then((res) => {
          assert.deepEqual(res, {
            [common.NODE]: true,
            [common.NODE_TWO]: true
          });
        });
    });
  });

  describe('more cli', () => {

    it('returns online for online nodes', (done) => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      console.log = consoleMock((...args) => {
        assert.ok(/online/.test(args[1]), 'returns online for online nodes');
        done();
      });

      nmo.load({nmoconf: __dirname + '/fixtures/randomini', json: false})
        .then(() => {
          cli(common.NODE);
      });
    });

    it('returns offline for offline nodes', (done) => {
      console.log = consoleMock((...args) => {
        assert.ok(/offline/.test(args[1]), 'returns offline for online nodes');
        done();
      });

      nmo.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(() => {
          cli('http://exampleneverexists');
        });
    });

    it('can output json', (done) => {
      nock(common.NODE)
        .get('/')
        .reply(200);

      console.log = consoleMock((...args) => {
        assert.deepEqual({ [common.NODE]: true }, args[0]);
        done();
      });

      nmo.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then(() => {
          cli(common.NODE);
      });
    });
  });
});
