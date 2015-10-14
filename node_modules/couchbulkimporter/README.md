# CouchBulkImporter

Takes a stream of docs, e.g. from `bulkbadger` and imports them into
CouchDB using the /_bulk_docs endpoint


**Usage examples:**

 - Migrate data from MongoDB to CouchDB
 - Migrate data from Postgres to CouchDB
 - Import data from CSV files into CouchDB
 - Import data from JSON files into CouchDB


## Examples

### Use a regular JSON file from the fs as input

**testjson.json:**

```js
[
  {"a": "b"},
  {"b": "c"},
  {"c": "d"}
]

```

```js
var CouchBulkImporter = require('couchbulkimporter')
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


```

### Use a CSV file as input


```js
var CouchBulkImporter = require('couchbulkimporter')
var BulkBadger = require('bulkbadger')


var parse = require('csv-parse')
var fs = require('fs')
var transform = require('stream-transform')
var JSONStream = require('JSONStream')

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

```

### Stream from MongoDB into CouchDB

```js
var MongoClient = require('mongodb').MongoClient
var BulkBadger = require('bulkbadger')
var CouchBulkImporter = require('couchbulkimporter')

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

```

### Use Line-Delimited JSON as input

**ldjson.json:**

```js
{"rocko": "artischocko"}
{"zett": "zettmeister"}
{"mr": "mussie"}
```

```js
var CouchBulkImporter = require('couchbulkimporter')
var BulkBadger = require('bulkbadger')

var fs = require('fs')
var JSONStream = require('JSONStream')


fs
  .createReadStream(__dirname + '/ldjson.json')
  .pipe(JSONStream.parse())
  .pipe(new BulkBadger())
  .pipe(new CouchBulkImporter({
    url: 'http://tester:testerpass@localhost:5984/ldjsonhellooo'
  }))
```
