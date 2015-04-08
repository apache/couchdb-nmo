import http from 'http';

export const PORT = 1337;

export const NODE = 'http://127.0.0.1:' + PORT;

export function createTestServer (done) {
  return http.createServer((req, res) => {

    if (req.url === '/socketclose') {
      res.write('a');
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }).listen(PORT, '127.0.0.1', done);
}
