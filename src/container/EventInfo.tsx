import React from 'react';
import { Table, Drawer } from 'antd';
import _ from 'lodash';
import { anyStrToColor } from '../helper';
import { useStoreActions, useStoreState } from '../store';
import { TraceEvent } from '../types';

function EventInfo() {
  const { events, activeEvent } = useStoreState(store => store.tracer);
  const { activateEvent, inactivateEvent } = useStoreActions(
    actions => actions.tracer,
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'eventName',
      render: (name: string, record: TraceEvent, index: number) => (
        <div style={{ cursor: 'pointer' }} onClick={() => activateEvent(index)}>
          <svg width="15" height="15">
            <rect fill={anyStrToColor(name)} width="15" height="15" />
          </svg>
          &nbsp;
          {name}
        </div>
      ),
    },
    {
      title: 'Epoch',
      dataIndex: 'scope',
      key: 'epoch',
      render: (scope: any) => {
        return _.get(scope, 'epochId');
      },
    },
    {
      title: 'Round',
      dataIndex: 'scope',
      key: 'round',
      render: (scope: any) => {
        return _.get(scope, 'roundId');
      },
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      render: (timestamp: number) => {
        return new Date(timestamp).toJSON();
      },
    },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Table
        size="middle"
        rowKey={record => String(record.timestamp)}
        dataSource={events}
        columns={columns}
        pagination={false}
        scroll={{ y: 480 }}
      />
      <Drawer
        placement="right"
        width={400}
        onClose={() => inactivateEvent()}
        visible={!!activeEvent}
        mask={false}
        getContainer={false}
        style={{ position: 'absolute' }}
      >
        {/*<EventDetail event={activeEvent as TraceEvent} />*/}
      </Drawer>
    </div>
  );
}

export { EventInfo };
