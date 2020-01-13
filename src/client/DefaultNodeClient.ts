import _ from 'lodash';
import { NodeClient } from './NodeClient';
import { EpochKeyframe, ProposeEvent, TraceEvent, VoteEvent } from '../types';
import {
  EpochEvents,
  isEventStartsOfEpoch,
  isProposeEvent,
  isVoteEvent,
} from '../event';
import { roundCountEachEpoch } from '../core/event';

export class DefaultNodeClient implements NodeClient {
  readonly raw: TraceEvent[];

  constructor(raw: TraceEvent[]) {
    this.raw = raw;
  }

  latestEpoch(): Promise<number> {
    const epochEvent = _.findLast<TraceEvent, EpochKeyframe>(
      this.raw,
      isEventStartsOfEpoch,
    );
    if (!epochEvent) return Promise.resolve(0);
    return Promise.resolve(epochEvent.tag.epochId);
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
