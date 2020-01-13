import React from 'react';
import { Card, Col, Row, Table } from 'antd';
import styled from 'styled-components';
import { useStoreState } from '../store';
import { ProposeEvent, TraceEvent, VoteEvent } from '../types';
import { ColumnProps } from 'antd/es/table';
import { Hex } from '../component/Hex';
import { useEffectNodeClient } from '../hook';
import { PopEvent } from '../component/PopEvent';

function shortHex(hex: string) {
  return <Hex data={hex} />;
}

const DashboardWrapper = styled.div`
  padding: 16px 0;
`;

function ProposeTable(props: { events: ProposeEvent[] | undefined }) {
  const columns: ColumnProps<ProposeEvent>[] = [
    {
      title: 'Name',
      key: 'eventName',
      dataIndex: 'eventName',
      render: (eventName: string, record: TraceEvent) => (
        <PopEvent event={record} />
      ),
    },
    { title: 'Round', key: 'tag.roundId', dataIndex: 'tag.roundId' },
    {
      title: 'Proposer',
      key: 'tag.proposer',
      dataIndex: 'tag.proposer',
      render: shortHex,
    },
    {
      title: 'Hash',
      key: 'tag.hash',
      dataIndex: 'tag.hash',
      render: shortHex,
    },
  ];
  return (
    <Table
      loading={!props.events}
      size="small"
      pagination={false}
      scroll={{ y: 180 }}
      columns={columns}
      dataSource={props.events}
      rowKey={(x, i) => i.toString()}
    />
  );
}

function VoteTable(props: { events: VoteEvent[] | undefined }) {
  const columns: ColumnProps<VoteEvent>[] = [
    {
      title: 'Name',
      key: 'eventName',
      dataIndex: 'eventName',
      render: (eventName: string, record: TraceEvent) => (
        <PopEvent event={record} />
      ),
    },
    { title: 'Round', key: 'tag.roundId', dataIndex: 'tag.roundId' },
    {
      title: 'Voter',
      key: 'tag.voter',
      dataIndex: 'tag.voter',
      render: shortHex,
    },
    {
      title: 'Hash',
      key: 'tag.hash',
      dataIndex: 'tag.hash',
      render: shortHex,
    },
  ];
  return (
    <Table
      loading={!props.events}
      size="small"
      pagination={false}
      scroll={{ y: 180 }}
      columns={columns}
      dataSource={props.events}
      rowKey={(x, i) => i.toString()}
    />
  );
}

export const Dashboard = () => {
  const { activeEpoch, activeRound } = useStoreState(state => state.tracer);

  const [proposeEvents] = useEffectNodeClient(
    client =>
      activeEpoch !== null
        ? client.proposeEventsBeforeEndsOfRound(activeEpoch, activeRound ?? -1)
        : Promise.resolve([]),
    [activeEpoch, activeRound],
  );
  const [voteEvents] = useEffectNodeClient(
    client =>
      activeEpoch !== null
        ? client.voteEventsBeforeEndsOfRound(activeEpoch, activeRound ?? -1)
        : Promise.resolve([]),
    [activeEpoch, activeRound],
  );

  return (
    <DashboardWrapper>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Card title="Received proposal">
            <ProposeTable events={proposeEvents} />
          </Card>
        </Col>
        <Col md={12} sm={24}>
          <Card title="Received vote">
            <VoteTable events={voteEvents} />
          </Card>
        </Col>
      </Row>
    </DashboardWrapper>
  );
};
