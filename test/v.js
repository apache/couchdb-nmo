import assert from 'assert';
import { consoleMock } from './helpers';

import versionApi, {cli} from '../src/v.js';

import pkg from '../package.json';


describe('api: version', () => {

  it('gets the current nmo version', () => {
    return versionApi().then((res) => {
      assert.equal(pkg.version, res.nmo);
    });
  });
});

describe('cli: version', () => {

  it('logs the current version', (done) => {
    console.log = consoleMock((...args) => {
      assert.ok(new RegExp(pkg.version, 'ig').test(args[0]));
      done();
    });

    return cli();
  });
});
