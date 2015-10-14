var CouchBulkImporter = require('../')
var BulkBadger = require('bulkbadger')


var parse = require('csv-parse')
var fs = require('fs')
var transform = require('stream-transform')

var parser = parse({comment: '#', delimiter: ':'})
var input = fs.createReadStream('/etc/passwd')


var transformer = transform(function (record, cb) {

  var username = record[0]
  var pw = record[1]
  var uid = record[2]
  var gid = record[3]
  var comment = record[4]
  var home = record[5]
  var shell = record[6]

  cb(null, {
    id: username,
    pw: pw,
    uid: uid,
    gid: gid,
    comment: comment,
    home: home,
    shell: shell
  })
})

input
  .pipe(parser)
  .pipe(transformer)
  .pipe(new BulkBadger())
  .pipe(new CouchBulkImporter({
    url: 'http://tester:testerpass@localhost:5984/etcpasswd'
  }))
