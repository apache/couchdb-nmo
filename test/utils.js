import assert from 'assert';
import http from 'http';

import Lab from 'lab';
export const lab = Lab.script();

import * as utils from '../src/utils.js';
import * as common from './common.js';


lab.experiment('utils: uri', () => {

  lab.test('valid uri', (done) => {
    assert.ok(utils.isUri('https://example.com:8000'));
    done();
  });


  lab.test('invalid url', (done) => {
    assert.equal(utils.isUri('example.com'), false);
    done();
  });
});

lab.experiment('utils: checkUrl', () => {

  lab.test('valid uri', (done) => {
    assert.ok(utils.checkUrl() instanceof Error);
    done();
  });


  lab.test('invalid url', (done) => {
    assert.ok(utils.checkUrl('blubb') instanceof Error);
    done();
  });

  lab.test('valid url', (done) => {
    assert.equal(utils.checkUrl('https://example.com:8000'), null);
    done();
  });
});


lab.experiment('utils: send json to node', () => {

  let data = '', server;

  lab.before((done) => {
    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});

      req.on('data', (chunk) => {
        data += chunk;
      });
      res.end('{"msg": "hi rocko artischocko!"}');
    }).listen(common.PORT, '127.0.0.1', done);
  });

  lab.after((done) => {
    server.close(done);
  });

  lab.test('returns error on no value provided', (done) => {
    utils
      .sendJsonToNode()
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

  lab.test('returns error for offline nodes', (done) => {
    utils
      .sendJsonToNode('http://127.0.0.1:65516', {'ok': 'true'})
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

  lab.test('returns error for all other errors', (done) => {
    utils
      .sendJsonToNode('http://example.com', '')
      .catch((err) => {
        assert.ok(err instanceof Error);
        done();
      });
  });

  lab.test('communicates with the server', (done) => {
    utils
      .sendJsonToNode(common.NODE, {'ok': 'true'})
      .then((res) => {
      assert.equal(data, '{"ok":"true"}');
        assert.equal(res.msg, 'hi rocko artischocko!');
        done();
      });
  });
});

lab.experiment('utils: removeUsernamePw', () => {
  lab.test('removes credentials', (done) => {
    var res = utils.removeUsernamePw('https://foo:bar@example.com');
    assert.equal(res, 'https://USER:PW@example.com/');
    done();
  });

  lab.test('keeps other urls valid', (done) => {
    var res = utils.removeUsernamePw('https://example.com');
    assert.equal(res, 'https://example.com/');
    done();
  });
});
