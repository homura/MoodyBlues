import { EventType } from './constants';

export type Address = string;

export interface Tag {
  epochId?: number;
  roundId?: number;
  stepName?: string;

  [key: string]: null | string | number | undefined;
}

export enum Keyframe {
  START_EPOCH,
  START_ROUND,
  START_STEP,
}

interface Metadata {
  address: Address;
  v: string;
}

export type KeyframeKey = Keyframe;

export interface BaseEvent {
  timestamp: number;
  eventName: string;
  eventType: EventType;
  tag?: Tag;
  metadata?: Metadata;
}

export interface KeyframeEvent extends BaseEvent {
  eventType: EventType.Keyframe;
}

export interface EpochKeyframe extends BaseEvent {
  eventType: EventType.Keyframe;
  tag: Tag & { epochId: number };
}

export interface RoundKeyframe extends BaseEvent {
  eventType: EventType.Keyframe;
  tag: Tag & { epochId: number; roundId: number };
}

export interface StepKeyframe extends BaseEvent {
  eventType: EventType.Keyframe;
  tag: Tag & { epochId: number; roundId: number; stepName: string };
}

export interface ProposeEvent extends BaseEvent {
  eventType: EventType.Propose;
  tag: Tag & {
    epochId: number;
    roundId: number;
    proposer: string;
    hash: string;
  };
}

export interface VoteEvent extends BaseEvent {
  eventType: EventType.Vote;
  tag: Tag & {
    epochId: number;
    roundId: number;
    voter: string;
    hash: string;
  };
}

export type TraceEvent =
  | BaseEvent
  | EpochKeyframe
  | RoundKeyframe
  | StepKeyframe
  | ProposeEvent
  | VoteEvent;
