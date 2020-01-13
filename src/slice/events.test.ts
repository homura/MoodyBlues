import { EpochEvents } from '../event';
import { TraceEvent } from '../types';
import { mockStartEpoch, mockStartRound } from '../mock';

let timestamp = 0;
const events: TraceEvent[] = [
  mockStartEpoch(timestamp++, 1),
  mockStartRound(timestamp++, 1, 0),
  mockStartRound(timestamp++, 1, 1),
  mockStartRound(timestamp++, 1, 3),
  mockStartEpoch(timestamp++, 3),
];

it('epoch slice', () => {
  const epoch = new EpochEvents(events, 1);

  const roundSlices = epoch.rounds();
  expect<number>(roundSlices.length).toEqual(3);
  const round0 = roundSlices[0];
  expect<number>(round0.roundId).toEqual(0);
  expect<number>(round0.startAt()).toEqual(1);
  expect<number>(round0.endAt()).toEqual(2);

  const roundUsage = roundSlices.reduce((a, b) => a + b.timeUsage(), 0);
  expect<number>(roundUsage).toEqual(3);
});
