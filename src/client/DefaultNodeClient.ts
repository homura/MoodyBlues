import { NodeClient } from './NodeClient';
import { ProposeEvent, TraceEvent, VoteEvent } from '../types';
import { EpochEvents, isProposeEvent, isVoteEvent } from '../event';
import { roundCountEachEpoch } from '../core/event';

export class DefaultNodeClient implements NodeClient {
  readonly raw: TraceEvent[];

  constructor(raw: TraceEvent[]) {
    this.raw = raw;
  }

  eventsByEpoch(epochId: number): Promise<TraceEvent[]> {
    return Promise.resolve(new EpochEvents(this.raw, epochId).events());
  }

  proposeEventsBeforeEndsOfRound(
    epochId: number,
    timestamp: number,
  ): Promise<ProposeEvent[]> {
    return Promise.resolve(
      this.raw.filter<ProposeEvent>(
        (event =>
          event.timestamp <= timestamp &&
          isProposeEvent(event) &&
          event.tag.epochId === epochId) as (
          event: TraceEvent,
        ) => event is ProposeEvent,
      ),
    );
  }

  roundCountByEpoch(
    start?: number,
    end?: number,
  ): Promise<Map<number, number>> {
    return Promise.resolve(roundCountEachEpoch(this.raw));
  }

  voteEventsBeforeEndsOfRound(
    epochId: number,
    timestamp: number,
  ): Promise<VoteEvent[]> {
    return Promise.resolve(
      this.raw.filter<VoteEvent>(
        (event =>
          event.timestamp <= timestamp &&
          isVoteEvent(event) &&
          event.tag.epochId === epochId) as (
          event: TraceEvent,
        ) => event is VoteEvent,
      ),
    );
  }
}
