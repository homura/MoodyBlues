import { Mock } from '../mock';
import { roundCountEachEpoch } from './event';
import { TraceEvent } from '../types';

it('roundCountEachEpoch', () => {
  const mock = new Mock({
    startEpochId: 1,
    startTime: 0,
  });
  /* epoch 1 - round 3 */
  mock.mockEpoch();
  mock.mockRound();
  mock.mockRound();
  mock.mockRound();
  /* epoch 2 - round 4 */
  mock.mockEpoch();
  mock.mockRound();
  mock.mockRound();
  mock.mockRound();
  mock.mockRound();
  /* epoch 3  */
  mock.mockEpoch();

  const events: TraceEvent[] = mock.getEvents();

  expect<Map<number, number>>(roundCountEachEpoch(events)).toEqual(
    new Map<number, number>([
      [1, 3],
      [2, 4],
    ]),
  );
});
