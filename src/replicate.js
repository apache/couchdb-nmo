import { sendJsonToNode, checkNodeOnline } from './utils';


export function createReplicatorDoc (source, target, options) {
  return {
    source: {
      url: source
    },

    target: {
      url: target
    },

    continuous: options.continuous,
    'create_target': options.create_target
  };
}

export function replicate (clusterUrl, replicatorUrl, doc) {
  return checkNodeOnline(clusterUrl)
  .then(() => {
    return sendJsonToNode(replicatorUrl, doc);
  });
}
