import _ from 'lodash';
import { Optional } from 'utility-types';
import randombytes from 'randombytes';
import {
  EpochKeyframe,
  ProposeEvent,
  RoundKeyframe,
  StepKeyframe,
  Tag,
  TraceEvent,
  VoteEvent,
} from './types';
import { EventType } from './constants';

function randomBytesAsHex(size: number = 32): string {
  return '0x' + randombytes(size).toString('hex');
}

function randomAddress() {
  return '0x10' + randombytes(20).toString('hex');
}

export function mockStartEpoch(
  timestamp: number,
  epochId: number,
): EpochKeyframe {
  return {
    timestamp,
    eventName: 'goto_new_epoch',
    eventType: EventType.Keyframe,
    tag: { epochId },
  };
}

export function mockStartRound(
  timestamp: number,
  epochId: number,
  roundId: number,
): RoundKeyframe {
  return {
    timestamp,
    eventName: 'goto_new_round',
    eventType: EventType.Keyframe,
    tag: { epochId, roundId },
  };
}

const steps = ['propose', 'prevote', 'precommit', 'commit'];
export function mockStartStep(
  timestamp: number,
  epochId: number,
  roundId: number,
  step: number,
): StepKeyframe {
  const stepName = steps[step];
  return {
    eventName: stepName,
    timestamp,
    eventType: EventType.Keyframe,
    tag: { epochId, roundId, stepName },
  };
}

export function mockReceivePropose(
  timestamp: number,
  epochId: number,
  roundId: number,
): ProposeEvent {
  return {
    timestamp,
    eventType: EventType.Propose,
    eventName: 'receive_propose',
    tag: {
      epochId,
      roundId,
      proposer: randomAddress(),
      hash: randomBytesAsHex(),
    },
  };
}

export function mockReceiveVote(
  timestamp: number,
  epochId: number,
  roundId: number,
): VoteEvent {
  return {
    timestamp,
    eventType: EventType.Vote,
    eventName: _.sample(steps) as string,
    tag: {
      epochId,
      roundId,
      voter: randomAddress(),
      hash: randomBytesAsHex(),
    },
  };
}

const vs: string[] = [
  'check',
  'get',
  'receive',
  'request',
  'start',
  'validate',
];
const ns: string[] = ['epoch', 'tx', 'proposal', 'vote', 'lock'];
const vn: string[] = _.flatMap(vs, v => ns.map(n => `${v}_${n}`));

const ts: Tag[] = [
  { address: '0x10000000000000000000000000000000000000' },
  {
    address: '0x10000000000000000000000000000000000000',
    lock: '0x10000000000000000000000000000000000000',
  },
  {
    key: Math.random(),
  },
  {
    tx: '0x10000000000000000000000000000000000000',
    proposal: '0x10000000000000000000000000000000000000',
  },
];

function mockTag(): Tag | undefined {
  return _.sample(ts);
}

export function mockCustomEvent(
  timestamp: number,
  epochId: number,
  roundId: number,
): TraceEvent {
  const rand = Math.random();
  if (rand < 0.33) {
    return mockReceivePropose(timestamp, epochId, roundId);
  } else if (rand < 0.66) {
    return mockReceiveVote(timestamp, epochId, roundId);
  }
  return {
    timestamp,
    eventType: EventType.Custom,
    eventName: _.sample(vn) as string,
    tag: mockTag(),
  };
}

interface MockOptions {
  startTime: number;
  startEpochId: number;
  epochCount: number;
}

class Mock {
  private readonly options: MockOptions;

  private time: number;
  private epoch: number;
  private round: number;
  private step: number;

  private readonly events: TraceEvent[];

  constructor(options?: Optional<MockOptions>) {
    this.events = [];
    this.options = this.initialOptions(options);

    const { startTime, startEpochId } = this.options;
    this.time = startTime;
    this.epoch = startEpochId;
    this.round = 0;
    this.step = 0;
  }

  initialOptions(options?: Optional<MockOptions>): MockOptions {
    return Object.assign(
      {
        startEpochId: _.random(0, 10000000),
        epochCount: 1200,
        startTime: _.random(+new Date(2016, 1, 1), Date.now()),
      },
      options,
    ) as MockOptions;
  }

  private consumeTime(max = 300) {
    this.time += _.random(0, max);
  }

  private mockCustomEvent(n: number = 2) {
    let i = _.random(0, n);
    while (i--) {
      this.consumeTime(30);
      this.events.push(mockCustomEvent(this.time, this.epoch, this.round));
    }
  }

  mockSkipEpoch() {
    const skipped = Math.random() < 0.05;
    if (skipped) {
      this.consumeTime(3000);
      this.epoch++;
    }
    return skipped;
  }

  mockSkipRound() {
    const skipped = Math.random() < 0.05;
    if (skipped) {
      this.consumeTime(3000);
      this.round++;
    }
    return skipped;
  }

  mockEpoch() {
    this.consumeTime();
    this.events.push(mockStartEpoch(this.time, this.epoch));
    this.epoch++;
    this.round = 0;
  }

  mockRound() {
    this.consumeTime();
    this.events.push(mockStartRound(this.time, this.epoch, this.round));
    this.round++;
    this.step = 0;
  }

  getEvents() {
    return this.events;
  }

  mock(): TraceEvent[] {
    let count = this.options.epochCount;

    while (count--) {
      this.mockCustomEvent();
      if (this.mockSkipEpoch()) {
        continue;
      }
      this.mockEpoch();

      const round = _.random(0, 6);
      while (this.round <= round) {
        this.mockCustomEvent();

        if (this.mockSkipRound()) {
          continue;
        }
        this.mockRound();

        const step = round === this.round ? 3 : _.random(0, 3);
        while (this.step <= step) {
          this.mockCustomEvent();
          this.consumeTime();
          this.events.push(
            mockStartStep(this.time, this.epoch, this.round, this.step),
          );
          this.step++;
        }

        this.step = 0;
      }
    }

    return this.events;
  }
}

export { Mock };
