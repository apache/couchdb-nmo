import http from 'http';
import Promise from 'bluebird';

export const PORT = 1337;
export const PORT_TWO = 1338;


export const NODE = 'http://127.0.0.1:' + PORT;
export const NODE_TWO = 'http://127.0.0.1:' + PORT_TWO;


export function createTestServers () {
  const promises = [PORT, PORT_TWO].map((port) => {
    return createTestServer(port);
  });

  return Promise.all(promises);
}

export function stopTestServers (servers) {
  const servers = servers.map((s) => {
    const close = Promise.promisify(s.close).bind(s);
    return close();
  });
  return Promise.all(servers);
}

export function createTestServer (port) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      if (req.url === '/socketclose') {
        res.write('a');
      }

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World\n');
    }).listen(port, '127.0.0.1', () => { resolve(s); });
  });
}
