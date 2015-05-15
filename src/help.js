import nemo from './nemo.js';
import Promise from 'bluebird';
import {spawn as spawn} from 'child_process';


function getMainHelpText (cmds) {
  return `
Usage:

nemo <command>

Available Commands:

${cmds}

Get help for a command:

nemo help <command>
`;
}

export default help;
export const cli = helpCli;
function helpCli (cmd) {
  return new Promise((resolve, reject) => {

    if (!cmd || !nemo.commands[cmd]) {
      help();
      return resolve();
    }

    const path = `${__dirname}/../man/man1/nemo-${cmd}.1`;
    const child = spawn('man', [path], {stdio: 'inherit'});
    resolve(child);
  });
}

function help () {
  return new Promise((resolve, reject) => {
    const cmds = Object.keys(nemo.commands).join(', ');

    console.log(getMainHelpText(cmds));

    resolve();
  });
}
