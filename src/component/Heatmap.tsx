import React, { ReactChild, useMemo, useState } from 'react';
import { interpolateGreens } from 'd3-scale-chromatic';
import { scaleLinear } from 'd3-scale';
import { SizeMeProps, withSize } from 'react-sizeme';
import styled from 'styled-components';
import { SVGTooltip } from './SVGTooltip';

interface HeatmapWrapperProps {
  readonly activeIndex?: number;
}

const HeatmapWrapper = styled.svg<HeatmapWrapperProps>`
  rect {
    opacity: ${props => (props.activeIndex !== undefined ? 0.25 : 1)};
  }

  rect:nth-child(${props =>
        'activeIndex' in props ? (props.activeIndex as number) + 1 : 0}) {
    opacity: 1;
    stroke: #0e639c;
  }
`;

const LegendItemWrapper = styled.span`
  margin-right: 8px;

  svg {
    vertical-align: middle;
  }
`;

const LegendItem = ({ fill, label }: { fill: string; label: string }) => {
  return (
    <LegendItemWrapper>
      <svg width={15} height={15}>
        <rect x={0} y={0} width={12} height={12} fill={fill} />
      </svg>
      <span>{label}</span>
    </LegendItemWrapper>
  );
};

export type HeatmapProps = SizeMeProps & {
  data: number[];
  domain: number[];
  range: number[];
  active?: number;
  onTooltip?: (index: number) => ReactChild;
  onCellClick?: (index: number) => void;
};

export const Heatmap = withSize()((props: HeatmapProps) => {
  const padding = [0, 0];
  const width = (props.size.width as number) - padding[1] * 2;
  const height = 200 - padding[0] * 2;

  const { data } = props;

  const cellSize = 12;
  const paddedCellSize = 15;
  const columnCount = Math.floor(height / paddedCellSize);

  const scale = scaleLinear()
    .domain([0, 3, 5])
    .range([0, 0.8, 1]);

  const [tooltipContent, setTooltipContent] = useState<ReactChild | undefined>(
    '',
  );

  const cells = useMemo(
    () => (
      <g>
        {data.map((item, i) => {
          return (
            <rect
              key={i}
              x={paddedCellSize * Math.floor(i / columnCount)}
              y={paddedCellSize * (i % columnCount)}
              width={cellSize}
              height={cellSize}
              fill={item === -1 ? '#ebedf0' : interpolateGreens(scale(item))}
              onMouseOver={() => setTooltipContent(props.onTooltip?.(i))}
              onClick={() => props.onCellClick?.(i)}
            />
          );
        })}
      </g>
    ),
    [data],
  );

  return (
    <div>
      <HeatmapWrapper width={width} height={height} activeIndex={props.active}>
        <SVGTooltip animation="fade" content={tooltipContent as ReactChild}>
          {cells}
        </SVGTooltip>
      </HeatmapWrapper>
      <div>
        <LegendItem fill="#ebedf0" label="incomplete" />
        <LegendItem fill={interpolateGreens(scale(1))} label="1" />
        <LegendItem fill={interpolateGreens(scale(3))} label="3" />
        <LegendItem fill={interpolateGreens(scale(5))} label="≥ 5" />
      </div>
    </div>
  );
});
