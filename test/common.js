import fs from 'fs';

export const PORT = 1337;
export const PORT_TWO = 1338;


export const NODE = 'http://127.0.0.1:' + PORT;
export const NODE_TWO = 'http://127.0.0.1:' + PORT_TWO;

export const NODE_WITH_PW = 'http://a:b@127.0.0.1:' + PORT;
export const NODE_TWO_WITH_PW = 'http://a:b@127.0.0.1:' + PORT_TWO;

const data = `[clusterone]
node0=http://127.0.0.1
node1=http://192.168.0.1

[onenodecluster]
node1=iamalonelylnode

[clustervalidurlsbothdown]
node0=http:\/\/neverexists.neverexists
node1=http:\/\/neverexists2.neverexists

[clustervalidurlsonedown]
node1=http:\/\/neverexists2.neverexists
node2=${NODE}

[clustervalidurls]
node1=${NODE}
node2=${NODE_TWO}

[clustervalidurlswithpw]
node1=${NODE_WITH_PW}
node2=${NODE_TWO_WITH_PW}
`;

export function createConfigFile () {
  fs.writeFileSync(__dirname + '/fixtures/randomini', data, 'utf-8');
}
