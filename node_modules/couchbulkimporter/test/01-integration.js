const test = require('tap').test

const BulkBadger = require('bulkbadger')
const CouchBulkImporter = require('../')

const http = require('http')

const PassThrough = require('stream').PassThrough


test('sends data to CouchDB', function (t) {

  t.plan(4)
  const results = [
    '{}',
    '{"docs":[{"a":1}]}',
    '{"docs":[{"a":2}]}',
    '{"docs":[{"a":3}]}'
  ]

  const server = http.createServer(function (req, res) {
    req.on('data', function (data) {
      t.equal(results.shift(), data.toString())
    })
    res.statusCode = 201
    res.end('{"ok": "true"}')
  })

  server.listen(1337, function () {
    const readable = new PassThrough({objectMode: true})

    const couchbulk = new CouchBulkImporter({
      url: 'http://localhost:1337/baseball'
    })

    couchbulk.on('finish', function () {
      server.close(function () {
        t.end()
      })
    })

    readable
      .pipe(new BulkBadger({chunksize: 1}))
      .pipe(couchbulk)

    readable.write({a: 1})
    readable.write({a: 2})
    readable.write({a: 3})
    readable.end()
  })
})
