import React, { ReactNode } from 'react';
import { withSize, SizeMeProps } from 'react-sizeme';
import { scaleLinear } from 'd3-scale';
import styled from 'styled-components';
import { color } from 'd3-color';
import _ from 'lodash';
import classNames from 'classnames';
import { Tooltip } from 'antd';

type Range = [number, number];

export type TimelineProps = {
  activeIndex?: number;
  segments: Range[];
  segmentsText: string[];
  domain?: Range;
  onTip?: (i: number) => ReactNode;
  onClick?: (i: number) => void;
};

const segmentBackground = '#eec360';
const hoveringSegmentBackground = color(segmentBackground)
  ?.brighter(1.2)
  .hex() as string;

const activeSegmentBackground = color(segmentBackground)
  ?.brighter(1.6)
  .hex() as string;

const TimelineWrapper = styled.div`
  white-space: nowrap;
  position: relative;
  height: 18px;

  .segment {
    position: absolute;
    line-height: 18px;
    font-size: 12px;
    height: 18px;
    display: inline-block;
    border: 1px solid #333333;
    border-right: none;
    background-color: ${segmentBackground};
    color: #333333;
    text-align: center;
    cursor: pointer;
    transition: border 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background-color: ${hoveringSegmentBackground};
    }

    &.active {
      border: 2px solid #0e639c;
      background-color: ${activeSegmentBackground};
    }
  }
`;

export const Timeline = withSize()((props: TimelineProps & SizeMeProps) => {
  const active = props.activeIndex;

  const domain = props.domain || [
    _.head(props.segments)?.[0] ?? 0,
    _.last(props.segments)?.[1] ?? 0,
  ];

  const [start, end] = domain;
  const total = end - start;
  const width = props.size.width as number;

  const xScale = scaleLinear()
    .range([0, width])
    .domain(domain);
  const widthScale = scaleLinear()
    .range([0, width])
    .domain([0, total]);

  function handleActive(i: number) {
    // eslint-disable-next-line no-unused-expressions
    props.onClick?.(i);
  }

  function tip(i: number): ReactNode {
    return (
      <div>
        <div>{props.segmentsText[i]}</div>
        {props.onTip && props.onTip(i)}
      </div>
    );
  }

  return (
    <TimelineWrapper className={classNames({ active: !_.isNil(active) })}>
      {props.segments.map((segment, i) => (
        <Tooltip key={i} overlay={() => tip(i)}>
          <div
            className={classNames(['segment', { active: active === i }])}
            style={{
              width: `${widthScale(segment[1] - segment[0])}px`,
              left: `${xScale(segment[0])}px`,
            }}
            onClick={() => handleActive(i)}
          >
            {props.segmentsText[i]}
          </div>
        </Tooltip>
      ))}
    </TimelineWrapper>
  );
});
