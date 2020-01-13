import { useStoreActions, useStoreState } from '../store';
import { DependencyList, useEffect, useMemo, useState } from 'react';
import { NodeClient, RootClient } from '../client';

type ClientResolver<R, C> = (client: C) => Promise<R>;
type RootClientResolver<R> = ClientResolver<R, RootClient>;
type NodeClientResolver<R> = ClientResolver<R, NodeClient>;

export function useRootClient(): [
  RootClient,
  (rootClient: RootClient) => void,
] {
  const rootClient = useStoreState(state => state.client.clientInstance);
  const setClient = useStoreActions(actions => actions.client.setClient);

  return [rootClient, setClient];
}

export function useNodeClient(): [
  NodeClient,
  (nodeClient: NodeClient) => void,
] {
  const rootClient = useStoreState(state => state.client.clientInstance);
  const nodeClient = useStoreState(state => state.client.nodeClientInstance);
  const setNodeClient = useStoreActions(
    actions => actions.client.setNodeClient,
  );

  function ref(nodeClient: NodeClient) {
    rootClient.setNodeClient(nodeClient);
    setNodeClient(nodeClient);
  }

  return [nodeClient, ref];
}

export function useEffectRootClient<T>(
  clientResolve: RootClientResolver<T>,
  deps?: DependencyList,
): [T | undefined] {
  const [client] = useRootClient();
  const [result, setResult] = useState<T>();
  useEffect(
    () => {
      clientResolve(client).then(setResult);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps ? deps.concat([clientResolve, client]) : [clientResolve, client],
  );

  return [result];
}

export function useMemoRootClient<T>(
  rootClientResolveThunk: () => RootClientResolver<T>,
  deps?: DependencyList,
): [T | undefined] {
  const resolver = useMemo<RootClientResolver<T>>(
    () => rootClientResolveThunk(),
    deps,
  );
  return useEffectRootClient(resolver);
}

export function useEffectNodeClient<T>(
  clientResolve: NodeClientResolver<T>,
  deps?: DependencyList,
): [T | undefined] {
  const [nodeClient] = useNodeClient();
  const [result, setResult] = useState<T>();

  useEffect(
    () => {
      (async () => {
        setResult(undefined);
        const res = await clientResolve(nodeClient);
        setResult(res);
      })();
    },
    deps ? deps.concat(nodeClient) : [nodeClient],
  );

  return [result];
}
