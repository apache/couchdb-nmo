import nemo from './nemo.js';
import Promise from 'bluebird';

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
export const cli = help;
function help () {
  return new Promise((resolve, reject) => {
    const cmds = Object.keys(nemo.commands).join(', ');

    console.log(getMainHelpText(cmds));

    resolve();
  });
}
