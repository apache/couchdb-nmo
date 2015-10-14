const request = require('request')
const Writable = require('stream').Writable
const util = require('util')

module.exports = CouchBulkImporter
function CouchBulkImporter (options) {
  if (!options) options = {}
  if (!options.url) {
    const msg = [
      'options.url must be set',
      'example:',
      "new CouchBulkImporter({url: 'http://localhost:5984/baseball'})"
    ].join('\n')
    throw new Error(msg)
  }

  Writable.call(this, {
    decodeStrings: false,
    objectMode: true
  })

  this.url = options.url.replace(/\/$/, '')
  this.targetDatabaseCreated = false
}

util.inherits(CouchBulkImporter, Writable)

CouchBulkImporter.prototype._write = write
function write (chunk, enc, done) {

  if (this.targetDatabaseCreated)
    return importChunk.apply(this)

  createTargetDatabase.apply(this)
  function createTargetDatabase () {
    request({
      json: true,
      uri: this.url,
      method: 'PUT',
      body: {}
    }, function (er, res, body) {
      if (er) return done(er)
      const code = res.statusCode
      if (code !== 200 && code !== 201 && code !== 412) {
        const msg = 'CouchDB server answered: \n Status: ' +
          res.statusCode + '\n Body: ' + JSON.stringify(body)
        return done(new Error(msg))
      }

      this.targetDatabaseCreated = true
      importChunk.apply(this)
    }.bind(this))
  }

  function importChunk () {
    request({
      json: true,
      uri: this.url + '/_bulk_docs',
      method: 'POST',
      body: chunk
    }, function (er, res, body) {
      if (er) return done(er)
      if (!/^2../.test(res.statusCode)) {
        const msg = 'CouchDB server answered: \n Status: ' +
          res.statusCode + '\n Body: ' + JSON.stringify(body)
        return done(new Error(msg))
      }

      done()
    })
  }
}
