import Promise from 'bluebird';
import CouchBulkImporter from 'couchbulkimporter';
import mongo from 'mongodb';
import BulkBadger from 'bulkbadger';
import { getUrlFromCluster } from './utils';

export function cli (cluster, database,  mongourl, collection) {
  if (!cluster || !database || !mongourl || !collection) {
    const msg = [
      'Usage:',
      '',
      'nmo import-mongo <clustername> <database> <MongoDB-url> <collection>',
      'nmo import-mongo <url> <database> <MongoDB-url> <collection>'
    ].join('\n');
    const err = new Error(msg);
    err.type = 'EUSAGE';
    throw err;
  }

  return importmongo(cluster, database, mongourl, collection);
}

export function validateMongoUrl (url) {
  return /mongodb:\/\//.test(url);
}


export default importmongo;
function importmongo (cluster, database, mongourl, collection) {
  return new Promise((resolve, reject) => {
    if (!validateMongoUrl(mongourl)) {
      const err = new Error('Invalid MongoDB url, url must start with mongodb://');
      err.type = 'EUSAGE';
      reject(err);
      return;
    }

    mongo.connect(mongourl, function (err, db) {
      if (err) {
        reject(err);
        return;
      }

      const clusterUrl = getUrlFromCluster(cluster);
      const col = db.collection(collection);
      col.count(function (errCount, noOfDocs) {
        if (err) {
          reject(err);
          return;
        }

        if (noOfDocs === 0 || errCount) {
          const err = new Error([
            'There are 0 documents in this collection. That could mean that',
            'the collection does not exist or that the database does not exist.'
          ].join(''));
          err.type = 'EUSAGE';
          reject(err);
          return;
        }

        console.log('Migration started!');
        col.find({}, {})
          .on('error', function (err) {
            err.message = 'Error fetching collection - ' + err.message;
            reject(err);
          })
          .pipe(new BulkBadger())
          .on('error', function (err) {
            err.message = 'Error - ' + err.message;
            if (/CouchDB server answered/.test(err.message)) {
              err.type = 'EUSAGE';
            }
            reject(err);
          })
          .pipe(new CouchBulkImporter({
            url: clusterUrl + '/' + database
          }))
          .on('error', function (err) {
            err.message = 'Error migration incomplete - ' + err.message;
            reject(err);
          })
          .on('finish', function () {
            db.close();
            console.log('Migration complete!');
            resolve();
          });
      });
    });

  });
}
