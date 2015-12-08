import assert from 'assert';
import nock from 'nock';

import * as utils from '../src/utils.js';
import * as common from './common.js';
import nmo from '../src/nmo.js';

const nmoconf = {nmoconf: __dirname + '/fixtures/randomini'};
common.createConfigFile();

describe('utils: validUrl', () => {

  it('checks protocol of url', () => {
    const err = utils.validUrl('ftp://wrong.com');

    assert.ok(/invalid protocol/.test(err.message));
  });

  it('returns null if url is valid', () => {
    const err = utils.validUrl('http://good.com');

    assert.ok(err === null);
  });

});

describe('utils: getClusterUrls', () => {

  it('getClustersUrl returns correct urls', () => {
    return nmo
      .load(nmoconf)
      .then(() => {
      const urls = utils.getClusterUrls('clusterone');
      assert.deepEqual(['http://127.0.0.1', 'http://192.168.0.1'], urls);
    });
  });

  it('getClustersUrl throws an error if the cluster does not exist', () => {
    return nmo
      .load(nmoconf)
      .then(() => {
        return utils.getClusterUrls('doesnt-exist');
      })
      .catch(e => {
        assert.ok(/Cluster does not exist/.test(e.message));
      });
  });

});

describe('utils: getUrlFromCluster', () => {

  it('it returns url for url passed to it', () => {
    const url = 'http://127.0.0.1';
    const out = utils.getUrlFromCluster(url);
    assert.deepEqual(url, out);
  });

  it('returns url for cluster', () => {
    const out = utils.getUrlFromCluster('clusterone');
    assert.deepEqual('http://127.0.0.1', out);
  });
});

describe('utils: uri', () => {

  it('valid uri', () => {
    assert.ok(utils.isUri('https://example.com:8000'));
  });


  it('invalid url', () => {
    assert.equal(utils.isUri('example.com'), false);
  });
});

describe('utils: checkUrl', () => {

  it('valid uri', () => {
    assert.ok(utils.checkUrl() instanceof Error);
  });


  it('invalid url', () => {
    assert.ok(utils.checkUrl('blubb') instanceof Error);
  });

  it('valid url', () => {
    assert.equal(utils.checkUrl('https://example.com:8000'), null);
  });
});

describe('utils: send json to node', () => {

  it('returns error on no value provided', () => {
    return utils
      .sendJsonToNode()
      .catch((err) => {
        assert.ok(err instanceof Error);
      });
  });

  it('returns error for offline nodes', () => {
    return utils
      .sendJsonToNode('http://127.0.0.1:65516', {'ok': 'true'})
      .catch((err) => {
        assert.ok(err instanceof Error);
      });
  });

  it('returns error for all other errors', () => {
    return utils
      .sendJsonToNode('http://example.com', '')
      .catch((err) => {
        assert.ok(err instanceof Error);
      });
  });

  it('communicates with the server', () => {
    nock('http://127.0.0.1:1337')
      .post('/')
      .reply(200, {ok: true, msg: 'hello'});

    return utils
      .sendJsonToNode(common.NODE, {'ok': 'true'})
      .then((res) => {
        assert.equal(res.msg, 'hello');
      });
  });

  it('sets Content-Type as application/json', () => {
    const url = 'http://content-type.test';
    const body = {test: true};
    nock(url,{
      reqheaders: {
        'content-type': 'application/json'
      }
    })
    .post('/')
    .reply(200);

    utils.sendJsonToNode(url +'/', body);
  });

});

describe('utils: removeUsernamePw', () => {
  it('removes credentials', (done) => {
    var res = utils.removeUsernamePw('https://foo:bar@example.com');
    assert.equal(res, 'https://USER:PW@example.com/');
    done();
  });

  it('keeps other urls valid', (done) => {
    var res = utils.removeUsernamePw('https://example.com');
    assert.equal(res, 'https://example.com/');
    done();
  });
});
