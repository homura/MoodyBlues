import _ from 'lodash';
import {
  EpochKeyframe,
  Keyframe,
  KeyframeEvent,
  KeyframeKey,
  ProposeEvent,
  RoundKeyframe,
  StepKeyframe,
  TraceEvent,
  VoteEvent,
} from './types';
import { EventType } from './constants';

export function indexOfKeyframe(
  events: TraceEvent[],
  key: KeyframeKey,
  value: string | number,
): number {
  return events.findIndex(event => {
    if (!isKeyframe(event)) return false;
    if (key === Keyframe.START_EPOCH && isKeyframeStartsOfEpoch(event)) {
      return value === event.tag.epochId;
    } else if (key === Keyframe.START_ROUND && isKeyframeStartsOfRound(event)) {
      return value === event.tag.roundId;
    } else if (key === Keyframe.START_STEP && isKeyframeStartsOfStep(event)) {
      return value === event.tag.stepName;
    }
    return false;
  });
}

export function indexOfNextKeyframe(
  events: TraceEvent[],
  startIndex: number,
): number {
  return _.findIndex(events, isKeyframe, startIndex + 1);
}

export function isProposeEvent(event: TraceEvent): event is ProposeEvent {
  return event.eventType === EventType.Propose;
}

export function isVoteEvent(event: TraceEvent): event is VoteEvent {
  return event.eventType === EventType.Vote;
}

export function isKeyframe(event: TraceEvent): event is KeyframeEvent {
  return event.eventType === EventType.Keyframe;
}

export function isKeyframeStartsOfEpoch(
  event: KeyframeEvent,
): event is EpochKeyframe {
  const tag = event.tag;
  return (
    !!tag && 'epochId' in tag && !('roundId' in tag) && !('stepName' in tag)
  );
}

export function isEventStartsOfEpoch(
  event: TraceEvent,
): event is EpochKeyframe {
  return isKeyframe(event) && isKeyframeStartsOfEpoch(event);
}

export function isKeyframeStartsOfRound(
  event: KeyframeEvent,
): event is RoundKeyframe {
  const tag = event.tag;
  return !!tag && 'epochId' in tag && 'roundId' in tag && !('stepName' in tag);
}

export function isKeyframeStartsOfStep(
  event: KeyframeEvent,
): event is StepKeyframe {
  const tag = event.tag;
  return !!tag && 'epochId' in tag && 'roundId' in tag && 'stepName' in tag;
}

export function checkIsKeyframeOf(event: TraceEvent, key: Keyframe): boolean {
  if (!isKeyframe(event)) return false;
  if (key === Keyframe.START_EPOCH) return isKeyframeStartsOfEpoch(event);
  if (key === Keyframe.START_ROUND) return isKeyframeStartsOfRound(event);
  if (key === Keyframe.START_STEP) return isKeyframeStartsOfStep(event);
  return false;
}

export function indexOfNextKeyframeByKey(
  events: TraceEvent[],
  startIndex: number,
  key: KeyframeKey,
) {
  return _.findIndex(
    events,
    event => checkIsKeyframeOf(event, key),
    startIndex + 1,
  );
}

export function filterProposeEvents(
  events: TraceEvent[],
  filter: {
    epochId?: number;
    roundId?: number;
  },
): ProposeEvent[] {
  return _.filter(events.filter(isProposeEvent), { tag: filter });
}

export function filterVoteEvents(
  events: TraceEvent[],
  filter: {
    epochId?: number;
    roundId?: number;
  },
): VoteEvent[] {
  return _.filter(events.filter(isVoteEvent), { tag: filter });
}

export interface Slice {
  startAt: () => number;
  endAt: () => number;
  timeUsage: () => number;
  timeRange: () => [number, number];
  events: () => TraceEvent[];
  nextSliceStartEvent: () => TraceEvent | null;
}

export interface StepSlice extends Slice {
  stepName: string;
}

export interface RoundSlice extends Slice {
  readonly roundId: number;
  steps: () => StepSlice[];
}

export interface EpochSlice extends Slice {
  readonly epochId: number;
  round: (roundId: number) => RoundSlice;
  rounds: () => RoundSlice[];
}

abstract class BaseEvents<P> implements Slice {
  readonly raw: TraceEvent[];
  readonly startIndex: number;
  readonly endIndex: number;
  abstract readonly parent: P;

  protected constructor(raw: TraceEvent[], ...sliceArgs: any) {
    this.raw = raw;
    const [start, end] = this.slice(raw, ...sliceArgs);
    this.startIndex = start;
    this.endIndex = end;
  }

  protected abstract slice(
    events: TraceEvent[],
    ...args: any
  ): [number, number];

  events = _.memoize<() => TraceEvent[]>(() => {
    if (this.startIndex === -1 || this.endIndex === -1) return [];
    return this.raw.slice(this.startIndex, this.endIndex + 1);
  });

  nextSliceStartEvent: () => TraceEvent | null = () => {
    if (this.startIndex === -1 || this.endIndex === -1) return null;
    return this.raw[indexOfNextKeyframe(this.raw, this.endIndex)];
  };

  timeRange: () => [number, number] = () => {
    if (this.startIndex === -1 || this.endIndex === -1) return [0, 0];
    const nextKeyframe = this.nextSliceStartEvent();
    if (!nextKeyframe) return [0, 0];
    return [this.raw[this.startIndex].timestamp, nextKeyframe.timestamp];
  };

  startAt = () => this.raw[this.startIndex]?.timestamp ?? 0;

  endAt = () =>
    (this.nextSliceStartEvent() ?? this.raw[this.endIndex])?.timestamp ?? 0;

  timeUsage = () => this.endAt() - this.startAt();
}

export class EpochEvents extends BaseEvents<Events> implements EpochSlice {
  readonly epochId: number;
  readonly parent: Events;

  constructor(raw: TraceEvent[], epochId: number, parent?: Events) {
    super(raw, epochId);
    this.epochId = epochId;
    this.parent = parent as Events;
  }

  protected slice(events: TraceEvent[], epochId: number): [number, number] {
    const start = indexOfKeyframe(events, Keyframe.START_EPOCH, epochId);
    const end =
      indexOfNextKeyframeByKey(events, start, Keyframe.START_EPOCH) - 1;
    return [start, end < 0 ? events.length - 1 : end];
  }

  rounds(): RoundSlice[] {
    const epochEvents = this.events();
    if (_.isEmpty(epochEvents)) return [];

    const self = this;
    return epochEvents
      .filter<KeyframeEvent>(isKeyframe)
      .filter<RoundKeyframe>(isKeyframeStartsOfRound)
      .map<RoundSlice>(event => new RoundEvents(event.tag.roundId, self));
  }

  round(roundId: number): RoundSlice {
    return new RoundEvents(roundId, this);
  }

  static empty(): EpochEvents {
    return new EpochEvents([], -1);
  }
}

export class RoundEvents extends BaseEvents<EpochEvents> implements RoundSlice {
  readonly roundId: number;
  readonly parent: EpochEvents;

  constructor(roundId: number, parent: EpochEvents) {
    super(parent.raw, roundId, parent);
    this.roundId = roundId;
    this.parent = parent;
  }

  protected slice(
    events: TraceEvent[],
    roundId: number,
    parentSlice: EpochEvents,
  ): [number, number] {
    const epochEvents = parentSlice.events();
    const start = indexOfKeyframe(epochEvents, Keyframe.START_ROUND, roundId);
    if (start === -1) return [0, 0];
    const nextRoundIndex = indexOfNextKeyframeByKey(
      epochEvents,
      start,
      Keyframe.START_ROUND,
    );
    const end =
      nextRoundIndex === -1 ? epochEvents.length - 1 : nextRoundIndex - 1;
    const offset = parentSlice.startIndex;
    return [start + offset, end + offset];
  }

  steps: () => StepSlice[] = () => {
    const roundEvents = this.events();
    if (_.isEmpty(roundEvents)) return [];

    const self = this;
    return roundEvents
      .filter<KeyframeEvent>(isKeyframe)
      .filter<StepKeyframe>(isKeyframeStartsOfStep)
      .map<StepSlice>(event => new StepEvents(event.tag.stepName, self));
  };

  static empty(): RoundEvents {
    return new RoundEvents(-1, EpochEvents.empty());
  }
}

export class StepEvents extends BaseEvents<RoundEvents> implements StepSlice {
  readonly stepName: string;
  readonly parent: RoundEvents;

  constructor(stepName: string, parent: RoundEvents) {
    super(parent.raw, stepName, parent);
    this.stepName = stepName;
    this.parent = parent;
  }

  slice(
    raw: TraceEvent[],
    stepName: string,
    parent: RoundEvents,
  ): [number, number] {
    const parentEvents = parent.events();
    const start = indexOfKeyframe(parentEvents, Keyframe.START_STEP, stepName);
    if (start === -1) return [0, 0];
    const nextStepIndex = indexOfNextKeyframeByKey(
      parentEvents,
      start,
      Keyframe.START_STEP,
    );
    const end =
      nextStepIndex === -1 ? parentEvents.length - 1 : nextStepIndex - 1;
    const offset = parent.startIndex;
    return [start + offset, end + offset];
  }
}

export class Events extends BaseEvents<null> implements Slice {
  readonly parent = null;

  constructor(raw: TraceEvent[]) {
    super(raw);
  }

  protected slice(events: TraceEvent[]): [number, number] {
    return [0, events.length];
  }

  epoch(epochId: number): EpochEvents {
    return new EpochEvents(this.raw, epochId, this);
  }
}
