import fs from 'fs';
import Promise from 'bluebird';
import CouchBulkImporter from 'couchbulkimporter';
import parse from 'csv-parse';
import BulkBadger from 'bulkbadger';
import {checkUrl} from './utils';
import nmo from './nmo.js';

export function cli (file, url, ...csvOptions) {
  if (!file) {
    const msg = [
      'Usage:',
      '',
      'nmo import-csv [file] [couchdb-url] [...<csv options> <pairs>]',
    ].join('\n');
    const err = new Error(msg);
    err.type = 'EUSAGE';

    throw err;
  }

  const er = checkUrl(url);
  if (er) {
    throw er;
  }

  const opts = {delimiter: nmo.config.get('delimiter'), columns: nmo.config.get('columns')};
  return importcsv.apply(importcsv, [file, url, opts]);
}


export default importcsv;
function importcsv (file, url, {delimiter= ',', columns= true}) {
  return new Promise((resolve, reject) => {
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

  });
}
