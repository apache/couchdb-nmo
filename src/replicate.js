import { sendJsonToNode } from './utils';


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

export function replicate (replicatorUrl, doc) {
  return sendJsonToNode(replicatorUrl, doc);
}
