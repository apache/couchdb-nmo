var fs = require('fs')
var JSONStream = require('JSONStream')

var BulkBadger = require('../')

fs
  .createReadStream(__dirname + '/testjson.json')
  .pipe(JSONStream.parse('*'))
  .pipe(new BulkBadger({chunksize: 2}))
  .pipe(JSONStream.stringify())
  .pipe(process.stdout)
