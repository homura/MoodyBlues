import { NodeClient } from './NodeClient';
import { ProposeEvent, TraceEvent, VoteEvent } from '../types';

export class MockNodeClient implements NodeClient {
  eventsByEpoch(epochId: number): Promise<TraceEvent[]> {
    return Promise.resolve([]);
  }

  proposeEventsBeforeEndsOfRound(
    epochId: number,
    timestamp: number,
  ): Promise<ProposeEvent[]> {
    return Promise.resolve([]);
  }

  roundCountByEpoch(
    start?: number,
    end?: number,
  ): Promise<Map<number, number>> {
    return Promise.resolve(new Map());
  }

  voteEventsBeforeEndsOfRound(
    epochId: number,
    timestamp: number,
  ): Promise<VoteEvent[]> {
    return Promise.resolve([]);
  }
}
