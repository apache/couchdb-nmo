import nmo from './nmo.js';
import Wreck from 'wreck';
import Promise from 'bluebird';
import log from 'npmlog';
import prettyjson from 'prettyjson';
import {getUrlFromCluster, validUrl, removeUsernamePw, checkNodeOnline } from './utils';

export function cli (cluster, filter) {
  return new Promise((resolve, reject) => {
    if (!cluster) {
      const msg = [
        'Usage:',
        '',
        'nmo activetasks <cluster> [<filter>] [--json]',
        'nmo activetasks <url> [<filter>] [--json]'
      ].join('\n');

      const err = new Error(msg);
      err.type = 'EUSAGE';
      return reject(err);
    }

    getActiveTask(cluster, filter).then(tasks => {
      const jsonOut = nmo.config.get('json');

      if (jsonOut) {
        console.log(tasks);
      } else {
        if (tasks.length === 0) {
          if (filter) {
            console.log('There are no active tasks for that filter.');
          } else {
            console.log('There are no active tasks at the moment.');
          }
        } else {
          console.log('Active Tasks:');
          console.log(prettyjson.render(tasks));
        }
      }

      resolve(tasks);
    }).catch(err => {
      reject(err);
    });
  });
}

export function filterTasks (tasks, searchTerm) {
  if (!searchTerm) {
    return tasks;
  }

  return tasks.filter(task => {
    if (task.type === searchTerm) {
      return true;
    }

    var regex = new RegExp(searchTerm, 'g');

    const databaseValues = ['database', 'source', 'target'].reduce((sum, field) => {
      if (task[field]) {
        sum += task[field];
      }

      return sum;
    }, '');

    return regex.test(databaseValues);
  });
}

export default function getActiveTask (cluster, filter) {
  return new Promise((resolve, reject) => {

    const url = getUrlFromCluster(cluster);

    let er = validUrl(url);

    if (er) {
      er.type = 'EUSAGE';
      return reject(er);
    }

    checkNodeOnline(url)
    .then(() => {
      const activetasksUrl = url + '/_active_tasks';
      const cleanedUrl = removeUsernamePw(url);
      log.http('request', 'GET', cleanedUrl);

      Wreck.get(activetasksUrl, (err, res, payload) => {
        if (err) {
          if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            const noNodeErr = new Error('Could not connect to ' + activetasksUrl +
              ' this could mean the node is down.');
            noNodeErr.type = 'EUSAGE';
            return reject(noNodeErr);
          }

          err.type = 'EUSAGE';
          return reject(err);
        }

        log.http(res.statusCode, cleanedUrl);
        const tasks = filterTasks(JSON.parse(payload), filter);
        resolve(tasks);
      });
    })
    .catch(err => reject(err));
  });
}
