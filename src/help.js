import {couchadmin} from './couchadmin.js';
import Promise from 'bluebird';

function getMainHelpText (cmds) {
  return `
Usage:

couchadmin <command>

Available Commands:

${cmds}

Get help for a command:

couchadmin help <command>
`;
}


export default function help () {
  return new Promise(function (resolve, reject) {
    const cmds = Object.keys(couchadmin.commands).join(', ');

    console.log(getMainHelpText(cmds));

    resolve();
  });
}
