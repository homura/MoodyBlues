import { NodeClient } from './NodeClient';

export interface ConsensusNode {
  id: string;
}

export interface RootClient {
  listNodes(): Promise<ConsensusNode[]>;

  createNodeClient(node: ConsensusNode): NodeClient;

  nodeClient(): NodeClient;

  setNodeClient(nodeClient: NodeClient): void;
}
