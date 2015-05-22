import http from 'http';
import Promise from 'bluebird';

export const PORT = 1337;
export const PORT_TWO = 1338;


export const NODE = 'http://127.0.0.1:' + PORT;
export const NODE_TWO = 'http://127.0.0.1:' + PORT_TWO;

export const NODE_WITH_PW = 'http://a:b@127.0.0.1:' + PORT;
export const NODE_TWO_WITH_PW = 'http://a:b@127.0.0.1:' + PORT_TWO;

export function createTestServers () {
  const promises = [PORT, PORT_TWO].map((port) => {
    return createTestServer(port);
  });

  return Promise.all(promises);
}

export function stopTestServers (servers) {
  const s = servers.map((s) => {
    const close = Promise.promisify(s.close).bind(s);
    return close();
  });
  return Promise.all(s);
}

export function createTestServer (port) {
  let i = 0;
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      if (req.url === '/socketclose') {
        res.write('a');
      }

      if (req.url === '/socket_close_on_second_request') {
        i++;
        if (i === 1) {
          res.write('a');
        }
      }

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ok: true}));
    }).listen(port, '127.0.0.1', () => { resolve(s); });
  });
}
