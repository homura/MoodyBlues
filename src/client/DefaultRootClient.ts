import { ConsensusNode, RootClient } from './RootClient';
import { NodeClient } from './NodeClient';
import { DefaultNodeClient } from './DefaultNodeClient';

export class DefaultRootClient implements RootClient {
  private currentNodeClient: NodeClient = new DefaultNodeClient([]);

  listNodes(): Promise<ConsensusNode[]> {
    return Promise.resolve([]);
  }

  nodeClient(): NodeClient {
    return this.currentNodeClient;
  }

  createNodeClient(node: ConsensusNode): NodeClient {
    return new DefaultNodeClient([]);
  }

  setNodeClient(nodeClient: NodeClient): void {
    this.currentNodeClient = nodeClient;
  }
}
