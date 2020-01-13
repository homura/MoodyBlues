import { ProposeEvent, TraceEvent, VoteEvent } from '../types';

export interface NodeClient {
  roundCountByEpoch(start?: number, end?: number): Promise<Map<number, number>>;

  eventsByEpoch(epochId: number): Promise<TraceEvent[]>;

  voteEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<VoteEvent[]>;

  proposeEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<ProposeEvent[]>;
}

export class NoopNodeClient implements NodeClient {
  async eventsByEpoch(epochId: number): Promise<TraceEvent[]> {
    return [];
  }

  async proposeEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<ProposeEvent[]> {
    return [];
  }

  async roundCountByEpoch(
    start?: number,
    end?: number,
  ): Promise<Map<number, number>> {
    return new Map();
  }

  async voteEventsBeforeEndsOfRound(
    epochId: number,
    roundId: number,
  ): Promise<VoteEvent[]> {
    return [];
  }
}
