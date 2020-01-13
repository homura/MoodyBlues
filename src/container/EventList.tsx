import React, { useState } from 'react';
import { Table, Input, Row, Col } from 'antd';
import { useStoreActions, useStoreState } from '../store';
import { TraceEvent } from '../types';
import { formatDate } from '../helper';
import { useEffectNodeClient } from '../hook';
import { PopEvent } from '../component/PopEvent';
import _ from 'lodash';
import { ColumnProps } from 'antd/es/table';
import { useDebounce } from 'react-use';

interface EventListProp {}

export const EventList = (props: EventListProp) => {
  const { activeEpoch } = useStoreState(state => state.tracer);
  const { loadEvents } = useStoreActions(actions => actions.tracer);

  const [epochEvents] = useEffectNodeClient(
    async client => {
      if (activeEpoch === null) return Promise.resolve([]);
      loadEvents([]);
      const events = await client.eventsByEpoch(activeEpoch);
      loadEvents(events);
      return events;
    },
    [activeEpoch],
  );

  const [tmpFilterValue, setTmpFilterValue] = useState('');
  const [filterValue, setFilterValue] = useState('');
  useDebounce(
    () => {
      setFilterValue(tmpFilterValue);
    },
    250,
    [tmpFilterValue],
  );

  if (activeEpoch === null) return null;

  const columns: ColumnProps<TraceEvent>[] = [
    {
      key: 'Name',
      title: 'Name',
      dataIndex: 'eventName',
      render: (name: string, record: TraceEvent, index: number) => (
        <PopEvent event={record} />
      ),
    },
    {
      key: 'Round',
      title: 'Round',
      dataIndex: 'tag.roundId',
    },
    {
      key: 'Timestamp',
      title: 'Timestamp',
      dataIndex: 'timestamp',
      render: (timestamp: number) => formatDate(timestamp),
    },
  ];

  const filteredEvent = _.filter<TraceEvent>(epochEvents, e => {
    if (!filterValue) return true;
    const eventStr = JSON.stringify(e);
    return filterValue
      .split(/\s+/)
      .every(f => new RegExp(f, 'i').test(eventStr));
  });

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Row style={{ marginBottom: '4px' }}>
        <Col span={4}>
          <Input
            placeholder="filter"
            size="small"
            value={tmpFilterValue}
            onChange={e => setTmpFilterValue(e.target.value)}
          />
        </Col>
      </Row>

      <Table
        size="small"
        pagination={false}
        rowKey={(record: TraceEvent, i) => String(i)}
        dataSource={filteredEvent}
        columns={columns}
        scroll={{ y: 300 }}
      />
    </div>
  );
};
