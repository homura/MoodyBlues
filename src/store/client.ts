import { action, Action } from 'easy-peasy';
import { RootClient } from '../client/RootClient';
import { DefaultRootClient } from '../client/DefaultRootClient';
import { DefaultNodeClient, NodeClient } from '../client';

export interface ClientModel {
  clientInstance: RootClient;
  nodeClientInstance: NodeClient;

  setClient: Action<ClientModel, RootClient>;
  setNodeClient: Action<ClientModel, NodeClient>;
}

export const clientModel: ClientModel = {
  clientInstance: new DefaultRootClient(),

  nodeClientInstance: new DefaultNodeClient([]),

  setClient: action((state, rootClient) => {
    state.clientInstance = rootClient;
  }),

  setNodeClient: action((state, nodeClient) => {
    state.nodeClientInstance = nodeClient;
  }),
};
