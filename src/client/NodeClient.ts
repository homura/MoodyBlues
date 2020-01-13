import { ProposeEvent, TraceEvent, VoteEvent } from '../types';

export interface NodeClient {
  /**
   * get latest epoch id
   */
  latestEpoch(): Promise<number>;

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
  async latestEpoch(): Promise<number> {
    return 0;
  }

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
