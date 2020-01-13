import React, { useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Empty, Spin } from 'antd';
import { Heatmap } from '../component/Heatmap';
import { useStoreActions, useStoreState } from '../store';
import { useEffectNodeClient } from '../hook';

export function RoundHeatmap() {
  const { activeEpoch } = useStoreState(state => state.tracer);
  const activateEpoch = useStoreActions(
    actions => actions.tracer.activateEpoch,
  );

  const [epochRoundMap] = useEffectNodeClient(client => {
    return client.roundCountByEpoch();
  });

  useEffect(() => {
    activateEpoch(null);
  }, [epochRoundMap]);

  const [epochIds, roundIds] = useMemo((): [number[], number[]] => {
    if (!epochRoundMap) return [[], []];
    const epochIds = Array.from(epochRoundMap.keys());
    const roundIds = Array.from(epochRoundMap.values());
    return [epochIds, roundIds];
  }, [epochRoundMap]);

  const activeIndex = useMemo(() => {
    if (activeEpoch === null) return undefined;
    return epochIds.indexOf(activeEpoch);
  }, [epochIds, activeEpoch]);

  if (!epochRoundMap) return <Spin />;
  if (_.isEmpty(roundIds)) return <Empty />;

  return (
    <Heatmap
      domain={[0, 3, 5]}
      range={[0, 0.8, 1]}
      data={roundIds}
      active={activeIndex}
      onCellClick={i => activateEpoch(epochIds[i])}
      onTooltip={i => (
        <div>
          epoch: {epochIds[i]} <br /> round: {roundIds[i]}
        </div>
      )}
    />
  );
}
