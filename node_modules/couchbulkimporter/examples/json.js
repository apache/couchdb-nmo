var CouchBulkImporter = require('../')
var BulkBadger = require('bulkbadger')

var fs = require('fs')
var JSONStream = require('JSONStream')


fs
  .createReadStream(__dirname + '/testjson.json')
  .pipe(JSONStream.parse('*'))
  .pipe(new BulkBadger())
  .pipe(new CouchBulkImporter({
    url: 'http://tester:testerpass@localhost:5984/jsonstreamfromfile'
  }))
