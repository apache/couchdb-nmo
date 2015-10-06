import assert from 'assert';

import Lab from 'lab';
export const lab = Lab.script();

import * as config from '../src/config.js';

import ini from 'ini';
import fs from 'fs';

const data = `[clusterone]
node0=http://127.0.0.1
node1=http://192.168.0.1

[gang]
rocko=artischocko
z=zmeister
j=janjuleschlie
mussman=dermussmaen
`;

const jsonData = {
  "gang": {
    "rocko": "artischocko",
    "z": "zmeister",
    "j": "janjuleschlie",
    "mussman": "dermussmaen"
  },
  "clusterone": {
    "node0": "http://127.0.0.1",
    "node1": "http://192.168.0.1"
  }
};

const gangConf = `rocko=artischocko
z=zmeister
j=janjuleschlie
mussman=dermussmaen
`;

const oldConsole = console.log;

lab.experiment('config', () => {

  lab.experiment('load', () => {

    lab.beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    lab.test('loads a defined config', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          assert.equal(res.get('gang').rocko, 'artischocko');
          done();
        });
    });
  });

  lab.experiment('set', () => {

    lab.beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    lab.test('saves a value', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('cluster1337', 'node1337', '192.168.133.7').then((e) => {
            const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
            assert.equal(c.clusterone.node1, 'http://192.168.0.1');
            assert.equal(c.gang.rocko, 'artischocko');
            assert.equal(c.cluster1337.node1337, '192.168.133.7');
            done();
          });
        });
    });

    lab.test('errors if not all values provided', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set().catch((err) => {
            assert.ok(err instanceof Error);
            done();
          });
        });
    });

    lab.test('errors if not all values provided', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('foo').catch((err) => {
            assert.ok(err instanceof Error);
            done();
          });
        });
    });

    lab.test('errors if not all values provided', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('foo', 'bar').catch((err) => {
            assert.ok(err instanceof Error);
            done();
          });
        });
    });

    lab.test('saves can overwrite old values', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.set('clusterone', 'node1', '192.168.133.7').then((e) => {
            const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
            assert.equal(c.clusterone.node1, '192.168.133.7');
            done();
          });
        });
    });
  });

  lab.experiment('get', () => {

    lab.beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    lab.test('returns the whole config as JSON', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          const result = config.get();
          assert.deepEqual(jsonData, result);
          done();
        });
    });

    lab.test('will get sections as JSON', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          const result = config.get('gang');
          assert.deepEqual(jsonData.gang, result);
          done();
        });
    });

    lab.test('will get keys', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          const result = config.get('gang', 'rocko');
          assert.equal(jsonData.gang.rocko, result);
          done();
        });
    });
  });

  lab.experiment('cli', () => {

    lab.beforeEach((done) => {
      fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
      done();
    });

    lab.afterEach((done) => {
      console.log = oldConsole;
      done();
    });

   lab.test('it can get the whole config', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli().then((result) => {
            assert.deepEqual(jsonData, result);
            done();
          });
        });
    });

    lab.test('will print the whole config as ini', (done) => {

      console.log = (...args) => {
        assert.equal(data, args[0]);
      };

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli('get').then((result) => {
            done();
          });
        });
    });

    lab.test('will print the whole config as JSON, if json = true', (done) => {

      console.log = (...args) => {
        assert.deepEqual(jsonData, args[0]);
        done();
      };

      config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          config.cli('get');
        });
    });

    lab.test('it can handle sections in the config', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli('get', 'gang').then((result) => {
            assert.deepEqual(jsonData.gang, result);
            done();
          });
        });
    });

    lab.test('will print the gang config as ini', (done) => {

      console.log = (...args) => {
        assert.equal(gangConf, args[0]);
      };

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli('get', 'gang').then((result) => {
            done();
          });
        });
    });

    lab.test('it can handle sections with keys in the config', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          config.cli('get', 'gang', 'rocko').then((result) => {
            assert.deepEqual({rocko: 'artischocko'}, result);
            done();
          });
        });
    });

    lab.test('will print the gang member', (done) => {

      console.log = (...args) => {
        assert.equal('artischocko', args[0]);
      };

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli('get', 'gang', 'rocko').then((result) => {
            done();
          });
        });
    });

    lab.test('will print the gang member as JSON, if json = true', (done) => {

      console.log = (...args) => {
        assert.deepEqual({rocko: 'artischocko'}, args[0]);
      };

      config.load({nmoconf: __dirname + '/fixtures/randomini', json: true})
        .then((res) => {
          config.cli('get', 'gang', 'rocko').then((result) => {
            done();
          });
        });
    });

    lab.test('saves a value', (done) => {

      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then((res) => {
          config.cli('set', 'cluster1337', 'node1337', '192.168.133.7').then((e) => {
            const c = ini.parse(fs.readFileSync(__dirname + '/fixtures/randomini', 'utf-8'));
            assert.equal(c.clusterone.node1, 'http://192.168.0.1');
            assert.equal(c.gang.rocko, 'artischocko');
            assert.equal(c.cluster1337.node1337, '192.168.133.7');
            done();
          });
        });
    });

    lab.test('returns error on wrong usage', (done) => {
      config.load({nmoconf: __dirname + '/fixtures/randomini'})
        .then(() => {

          config
            .cli('lalala');

        }).catch((err) => {
          assert.ok(err instanceof Error);
          done();
        });
    });
  });
});
