import nmo from './nmo.js';
import Promise from 'bluebird';
import {spawn as spawn} from 'child_process';


function getMainHelpText (cmds) {
  return `
Usage:

nmo <command>

Available Commands:

${cmds}

Get help for a command:

nmo help <command>
`;
}

export default help;
export const cli = helpCli;
function helpCli (cmd) {
  return new Promise((resolve, reject) => {

    if (!cmd || !nmo.commands[cmd]) {
      help();
      return resolve();
    }

    const path = `${__dirname}/../man/man1/nmo-${cmd}.1`;
    const child = spawn('man', [path], {stdio: 'inherit'});
    resolve(child);
  });
}

function help () {
  return new Promise((resolve, reject) => {
    const cmds = Object.keys(nmo.commands).join(', ');

    console.log(getMainHelpText(cmds));

    resolve();
  });
}
