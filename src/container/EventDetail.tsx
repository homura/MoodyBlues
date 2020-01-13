import React from 'react';
import { Divider, Row, Col } from 'antd';
import JSONTree from 'react-json-tree';
import _ from 'lodash';
import { TraceEvent } from '../types';
import { formatDate } from '../helper';

const theme = {
  scheme: 'monokai',
  base00: 'unset',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

interface EventDetailProps {
  event: TraceEvent;
}

export const EventDetail = (props: EventDetailProps) => {
  const { event } = props;
  if (!event) return null;

  const tag = { tag: _.get(event, 'tag') } as {};

  return (
    <div>
      <Row>
        <Col span={8}>name</Col>
        <Col span={16}>{event.eventName}</Col>

        <Col span={8}>time</Col>
        <Col span={16}>{formatDate(event.timestamp)}</Col>
      </Row>
      <Divider />
      <JSONTree
        data={tag}
        theme={theme}
        invertTheme={false}
        hideRoot={true}
        shouldExpandNode={(key, data, level) => level <= 2}
      />
    </div>
  );
};
