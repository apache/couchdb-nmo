import nmo from './nmo.js';


export default version;
function version () {
  return new Promise((resolve, reject) => {
    resolve({
      nmo: nmo.version,
      node: process.version
    });
  });
}

export const cli = versionCli;
function versionCli () {
  return new Promise((resolve, reject) => {
    console.log(`nmo version: ${nmo.version}`);
    console.log(`node version: ${process.version}`);
    resolve();
  });
};

