const test = require('tap').test
const BulkBadger = require('../')

const PassThrough = require('stream').PassThrough

test('three elements - default chunksize', function (t) {

  const readable = new PassThrough({objectMode: true})
  const pt = new PassThrough({objectMode: true})

  pt.on('data', function (data) {
    t.deepEqual(data, {docs: [{a: 1}, {a: 2}, {a: 3}]})
    t.end()
  })

  readable
    .pipe(new BulkBadger())
    .pipe(pt)

  readable.write({a: 1})
  readable.write({a: 2})
  readable.write({a: 3})
  readable.end()
})


test('three elements - chunksize 1 element', function (t) {

  const res = []
  const readable = new PassThrough({objectMode: true})
  const pt = new PassThrough({objectMode: true})

  pt
    .on('data', function (data) {

      res.push(data)
    })
    .on('finish', function () {
      t.deepEqual(res, [{docs: [{a: 1}]}, {docs: [{a: 2}]}, {docs: [{a: 3}]}])
      t.end()
    })

  readable
    .pipe(new BulkBadger({chunksize: 1}))
    .pipe(pt)


  readable.write({a: 1})
  readable.write({a: 2})
  readable.write({a: 3})
  readable.end()
})

test('three elements - chunksize 10 elements', function (t) {

  const readable = new PassThrough({objectMode: true})
  const pt = new PassThrough({objectMode: true})

  pt.on('data', function (data) {
    t.deepEqual(data, {docs: [{a: 1}, {a: 2}, {a: 3}]})
    t.end()
  })

  readable
    .pipe(new BulkBadger({chunksize: 10}))
    .pipe(pt)

  readable.write({a: 1})
  readable.write({a: 2})
  readable.write({a: 3})
  readable.end()
})
