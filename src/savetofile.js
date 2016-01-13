import { createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import log from 'npmlog';
import Wreck from 'wreck';
import Promise from 'bluebird';
import JSONStream from 'JSONStream';
import {checkNodeOnline, getUrlFromCluster, validUrl, removeUsernamePw } from './utils';
import nmo from './nmo.js';

export function cli (url, dbname, file) {
  return new Promise((resolve, reject) => {

    if (!url || !file || !dbname) {
      const msg = [
        'Usage:',
        '',
        'nmo savetofile <cluster> <database name> <file> ',
        'nmo savetofile <url> <database name> <file>'
      ].join('\n');

      const err = new Error(msg);
      err.type = 'EUSAGE';
      return reject(err);
    }

    savetofile(url, dbname, file)
    .then(() => {
      console.log(dbname + ' saved to ' + file + '.');
      resolve();
    })
    .catch(err => {
      err.type = 'EUSAGE';
      reject(err);
    });

  });
}

export function saveResToFile (res, file) {
  return new Promise((resolve, reject) => {
    let writestream = createWriteStream(file);
    const compress = nmo.config.get('compress');

    let pipeline = res
      .pipe(JSONStream.parse('rows.*.doc'))
      .pipe(JSONStream.stringify());

    if (compress) {
      const gzip = createGzip();
      pipeline = pipeline.pipe(gzip);
      writestream = createWriteStream(file + '.gzip');
    }

    pipeline
      .pipe(writestream)
      .on('error', function (err) {reject(err);})
      .on('finish', () => {resolve(file);});
  });
}

export default function savetofile (cluster, dbname, file) {
  return new Promise((resolve, reject) => {

    const baseUrl = getUrlFromCluster(cluster);
    const url =  baseUrl + '/' + dbname + '/_all_docs?include_docs=true';
    const er = validUrl(url);

    if (er) {
      er.type = 'EUSAGE';
      return reject(er);
    }
    const cleanedUrl = removeUsernamePw(url);
    log.http('request', 'GET', cleanedUrl);

    checkNodeOnline(baseUrl)
    .then(() => {
      Wreck.request('GET', url, {}, function (err, res) {
        if (err) {
          return reject(err);
        }

        log.http(res.statusCode, cleanedUrl);
        saveResToFile(res, file)
          .then(() => resolve())
          .catch((err) => reject(err));
      });
    })
    .catch((err) => reject(err));

  });
}
