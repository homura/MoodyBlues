import React from 'react';
import { Form, Input, InputNumber, Checkbox, SubmitButton } from 'formik-antd';
import { Formik } from 'formik';
import { Select, Spin } from 'antd';
import { useMemoRootClient } from '../../hook';
import { ConsensusNode } from '../../client/RootClient';

export function Config() {
  function handleSubmit() {}

  const [nodes] = useMemoRootClient(() => client => client.listNodes());

  if (!nodes) return <Spin />;

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ firstName: '', age: 20, newsletter: false }}
      onSubmit={handleSubmit}
      render={() => (
        <Form>
          <Form.Item name="clientMode" label="Node">
            <Select>
              {(nodes as ConsensusNode[]).map(node => (
                <Select.Option key={node.id}>{node.id}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <SubmitButton />
        </Form>
      )}
    />
  );
}
