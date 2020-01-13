import _ from 'lodash';
import {
  ConsensusNode,
  DefaultNodeClient,
  NodeClient,
  RootClient,
} from '../client';
import { hitsMessages } from './es';
import { ESNodeClient } from './ESNodeClient';

interface TermBucket {
  key: string;
  doc_type: number;
}

interface ChainMeta {
  start_time: string;
  chain_id: string;
  node_num: number;
  commit_id: string;
}

export class ESRootClient implements RootClient {
  private currentNodeClient: NodeClient;

  constructor() {
    this.currentNodeClient = new DefaultNodeClient([]);
  }

  async listNodes(): Promise<ConsensusNode[]> {
    const res = await hitsMessages<{ chain_meta: ChainMeta }>(
      {
        _source: ['message'],
        size: 9999,
      },
      'deploy',
    );

    const ids = res.flatMap<string>(item =>
      _.range(1, item.chain_meta.node_num).map(
        n =>
          `/data/chain-data/${item.chain_meta.chain_id}/logs/${n}/metrics.log`,
      ),
    );

    const uniqIds = _.uniq(ids);
    return uniqIds.map<ConsensusNode>(id => ({ id }));
  }

  setNodeClient(nodeClient: NodeClient): void {
    this.currentNodeClient = nodeClient;
  }

  createNodeClient(node: ConsensusNode): NodeClient {
    return new ESNodeClient({
      logPath: node.id,
    });
  }

  nodeClient(): NodeClient {
    return this.currentNodeClient;
  }
}
