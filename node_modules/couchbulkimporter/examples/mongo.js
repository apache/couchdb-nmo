var MongoClient = require('mongodb').MongoClient
var BulkBadger = require('bulkbadger')
var CouchBulkImporter = require('../')

var url = 'mongodb://localhost:27017/test'
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  console.log('Connected correctly to server')
  var col = db.collection('restaurants')
  var stream = col.find({}, {})
  stream
    .pipe(new BulkBadger({chunksize: 500}))
    .pipe(new CouchBulkImporter({
      url: 'http://tester:testerpass@localhost:5984/hellofrommongo'
    })).on('error', function (e) {
      console.log('Oh noes!')
      console.log(e)
    })

  stream.on('error', function (e) {
    console.log('Oh noes!')
    console.log(e)
  })
  stream.on('end', function () {
    console.log('migration finished')
    db.close()
  })
})
