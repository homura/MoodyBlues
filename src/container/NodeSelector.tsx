import React from 'react';
import { Select } from 'antd';
import { useMemoRootClient, useNodeClient, useRootClient } from '../hook';

export function NodeSelector() {
  const [nodes] = useMemoRootClient(() => root => root.listNodes(), []);

  const [rootClient] = useRootClient();
  const [, setNodeClient] = useNodeClient();

  function onSelectNode(nodeId: string) {
    if (!nodes) return;
    const foundNode = nodes.find(node => node.id === nodeId);
    if (foundNode === undefined) return;
    const nodeClient = rootClient.createNodeClient(foundNode);
    setNodeClient(nodeClient);
  }

  if (nodes === undefined) return null;

  return (
    <Select onChange={onSelectNode} style={{ width: '100%' }}>
      {nodes.map(node => (
        <Select.Option key={node.id}>{node.id}</Select.Option>
      ))}
    </Select>
  );
}
