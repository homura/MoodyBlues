export enum EventType {
  Keyframe = 'keyframe',
  Propose = 'propose',
  Vote = 'vote',
  Error = 'error',
  Custom = 'custom',
}

export enum EventScopeType {
  Global,
  Epoch,
  Round,
  Step,
}
