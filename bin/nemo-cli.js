#!/usr/bin/env node

var nopt = require('nopt');
var log = require('npmlog');
var xtend = require('xtend');
var pkg = require('../package.json')

var nemo = require('../lib/nemo.js');
var parsed = nopt({
  'json': [Boolean],
  'force': [Boolean]
}, {}, process.argv, 2);

var cmd = parsed.argv.remain.shift();

parsed.nemoconf = '.nemorc';
nemo.load(parsed).then(function (conf) {

  if (!cmd || !nemo.cli[cmd]) {
    return nemo.cli.help();
  }

  nemo.cli[cmd]
    .apply(null, parsed.argv.remain)
    .catch(errorHandler);

}).catch(errorHandler);

function errorHandler (err) {
  if (!err) {
    process.exit(1);
  }

  if (err.type === 'EUSAGE') {
    err.message && log.error(err.message);
    process.exit(1);
  }

  err.message && log.error(err.message);

  if (err.stack) {
    log.error('', err.stack);
    log.error('', '');
    log.error('', '');
    log.error('', 'nemo:', pkg.version, 'node:', process.version);
    log.error('', 'please open an issue including this log on ' + pkg.bugs.url);
  }
  process.exit(1);
}


//     ______   .
//    / o    \ /|
//   \ ͜       | |
//    \_____ / \|
//              ‘
