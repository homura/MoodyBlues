import React, { forwardRef } from 'react';
import { Popover } from 'antd';
import styled from 'styled-components';
import { TraceEvent } from '../types';
import { EventDetail } from '../container/EventDetail';

interface PopEventProps {
  event: TraceEvent;
}

const EventName = styled.span`
  max-width: 100%;
  display: inline-block;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const PopEvent = function(props: PopEventProps) {
  const event = props.event;
  return (
    <Popover
      content={<EventDetail event={props.event} />}
      title={event.eventName}
      trigger="click"
    >
      <EventName title={event.eventName}>{event.eventName}</EventName>
    </Popover>
  );
};
