import {
  isKeyframe,
  isKeyframeStartsOfEpoch,
  isKeyframeStartsOfRound,
} from '../event';
import _ from 'lodash';
import { RoundKeyframe, TraceEvent } from '../types';

export function roundCountEachEpoch(events: TraceEvent[]): Map<number, number> {
  const epochRoundMap: Map<number, number> = new Map();

  let epoch = -1;
  let round = -1;
  for (const event of events) {
    if (!isKeyframe(event)) continue;
    if (isKeyframeStartsOfEpoch(event)) {
      const newEpoch = event.tag.epochId;

      // the first epoch appears in events
      if (epoch === -1) {
        epoch = newEpoch;
        continue;
      }

      if (newEpoch - epoch === 1) {
        epochRoundMap.set(epoch, round + 1);
      } else {
        // set round be -1 when the epoch is skipped
        _.range(epoch, newEpoch).forEach(e => epochRoundMap.set(e, -1));
      }

      epoch = newEpoch;
    } else if (isKeyframeStartsOfRound(event)) {
      round = (event as RoundKeyframe).tag.roundId;
    }
  }
  return epochRoundMap;
}
