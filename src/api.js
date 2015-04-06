'use strict';

import * as utils from './utils.js'
import {log as log} from './log.js'

export const isNodeOnlineCheck = function isNodeOnlineCheck (url) {
  return utils
    .isNodeOnline(url)
    .then((online) => {
      if (online) {
        log.info('nodestatus', '[OK]', 'online');
        return;
      }
      log.info('nodestatus', '[NOT OK]', 'probably offline');
    })
    .catch((err) => {
      log.error('nodestatus', '[ERROR]', err);
    });
};
