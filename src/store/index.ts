import {
  action,
  Action,
  computed,
  Computed,
  createStore,
  createTypedHooks,
} from 'easy-peasy';
import { isEmpty } from 'lodash';
// import { ConfigModel, configModel } from './config';
import { TraceEvent } from '../types';
import { EpochSlice, Events, RoundSlice } from '../event';
import _ from 'lodash';
import { clientModel, ClientModel } from './client';

interface NodeTracerModel {
  address: string;
  events: TraceEvent[];
  activeIndex: number | null;
  activeEpoch: number | null;
  activeRound: number | null;
  activeStep: string | null;

  slice: Computed<NodeTracerModel, Events>;
  epochSlice: Computed<NodeTracerModel, EpochSlice>;
  roundSlice: Computed<NodeTracerModel, RoundSlice>;
  eventLoaded: Computed<NodeTracerModel, boolean>;
  activeEvent: Computed<NodeTracerModel, TraceEvent | null>;

  epochTimeUsage: Computed<NodeTracerModel, number>;
  roundCount: Computed<NodeTracerModel, number>;

  timestampBeforeRound: Computed<
    NodeTracerModel,
    (epochId: number, roundId: number) => number
  >;

  activateEpoch: Action<NodeTracerModel, number | null>;
  inactivateEpoch: Action<NodeTracerModel>;
  loadEvents: Action<NodeTracerModel, TraceEvent[]>;
  activateEvent: Action<NodeTracerModel, number>;
  inactivateEvent: Action<NodeTracerModel>;

  activateRound: Action<NodeTracerModel, number>;
  inactivateRound: Action<NodeTracerModel>;

  activateStep: Action<NodeTracerModel, string>;
  inactivateStep: Action<NodeTracerModel>;
}

interface StoreModel {
  // config: ConfigModel;
  tracer: NodeTracerModel;
  client: ClientModel;
}

const storeModel: StoreModel = {
  tracer: {
    events: [],
    address: '',
    activeIndex: null,
    activeEpoch: null,
    activeRound: null,
    activeStep: null,

    slice: computed([state => state.events], events => {
      return new Events(events);
    }),
    epochSlice: computed(state => {
      return state.slice.epoch(state.activeEpoch ?? -1);
    }),
    roundSlice: computed(state => {
      return state.epochSlice.round(state.activeRound ?? -1);
    }),
    eventLoaded: computed(state => !isEmpty(state.events)),
    activeEvent: computed(state =>
      state.activeIndex === null ? null : state.events[state.activeIndex],
    ),

    roundCount: computed(state => {
      const lastRound = _.last(state.epochSlice.rounds())?.roundId;
      if (lastRound === undefined) return 0;
      return lastRound + 1;
    }),

    epochTimeUsage: computed(state => {
      return state.epochSlice.timeUsage();
    }),

    timestampBeforeRound: computed(
      state => (epochId: number, roundId: number) => {
        return 0;
      },
    ),

    loadEvents: action((state, events) => {
      state.events = events;
    }),
    activateEvent: action((state, index) => {
      state.activeIndex = index;
    }),
    inactivateEvent: action(state => {
      state.activeIndex = null;
    }),

    activateEpoch: action((state, epochId) => {
      state.activeEpoch = epochId;
      state.activeRound = null;
      state.activeIndex = null;
    }),
    inactivateEpoch: action(state => {
      state.activeEpoch = null;
    }),

    activateRound: action((state, roundId) => {
      state.activeRound = roundId;
    }),

    inactivateRound: action(state => {
      state.activeRound = null;
    }),

    activateStep: action((state, stepName) => {
      state.activeStep = stepName;
    }),

    inactivateStep: action(state => {
      state.activeStep = null;
    }),
  },
  // config: configModel,
  client: clientModel,
};

const typedHooks = createTypedHooks<StoreModel>();
export const store = createStore<StoreModel>(storeModel);

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
