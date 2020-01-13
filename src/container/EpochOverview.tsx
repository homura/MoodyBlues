import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { useStoreState } from '../store';

interface EpochOverviewProps {}

export const EpochOverview = (props: EpochOverviewProps) => {
  const { activeEpoch, roundCount, epochTimeUsage } = useStoreState(
    state => state.tracer,
  );

  if (activeEpoch === null) return null;

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Statistic title="Epoch" value={activeEpoch} />
      </Col>
      <Col span={6}>
        <Statistic title="Round usage" value={roundCount} />
      </Col>

      <Col span={6}>
        <Statistic title="Time usage" value={epochTimeUsage + 'ms'} />
      </Col>
    </Row>
  );
};
