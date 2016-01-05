import fs from 'fs';
import Promise from 'bluebird';
import CouchBulkImporter from 'couchbulkimporter';
import parse from 'csv-parse';
import BulkBadger from 'bulkbadger';
import {getUrlFromCluster, checkNodeOnline} from './utils';
import nmo from './nmo.js';

export function cli (cluster, database, file, ...csvOptions) {
  if (!file || !cluster || !database) {
    const msg = [
      'Usage:',
      '',
      'nmo import-csv <cluster> <database> <file> [...<csv options> <pairs>]',
    ].join('\n');
    const err = new Error(msg);
    err.type = 'EUSAGE';

    throw err;
  }


  const opts = {delimiter: nmo.config.get('delimiter'), columns: nmo.config.get('columns')};
  return importcsv(cluster, database, file, opts);
}


export default importcsv;
function importcsv (cluster, database, file, {delimiter= ',', columns= true}) {
  return new Promise((resolve, reject) => {
    const baseUrl = getUrlFromCluster(cluster);
    const url = baseUrl + '/' + database;

    checkNodeOnline(baseUrl)
    .then(() => {
      const input = fs.createReadStream(file)
                    .on('error', (err) => {
                      err.message = 'Error reading file - ' + err.message;
                      reject(err);
                    });

      const parser = parse({
        delimiter: delimiter,
        columns: columns
      });

      input
      .pipe(parser)
      .pipe(new BulkBadger())
      .pipe(new CouchBulkImporter({
        url: url
      }))
      .on('error', function (err) {
        err.message = 'Error uploading - ' + err.message;
        reject(err);
      })
      .on('finish', function () {
        console.log('Upload complete!');
        resolve();
      });
    })
    .catch(err => reject(err));
  });
}
