const util = require('util')
const Transform = require('stream').Transform

module.exports = BulkBadger
function BulkBadger (options) {

  if (!options) options = {}
  if (!options.chunksize) options.chunksize = 200

  Transform.call(this, {
    decodeStrings: false,
    objectMode: true
  })

  this.buffer = []
  this.chunksize = options.chunksize
}

util.inherits(BulkBadger, Transform)

BulkBadger.prototype._transform = transform
function transform (chunk, encoding, done) {

  this.buffer.push(chunk)
  if (this.buffer.length >= this.chunksize) {
    this.push({docs: this.buffer})
    this.buffer = []
  }

  done()
}

BulkBadger.prototype._flush = flush
function flush (done) {

  this.buffer.length && this.push({docs: this.buffer})
  done()
}

// Happy badging!
// https://www.youtube.com/watch?v=EIyixC9NsLI
