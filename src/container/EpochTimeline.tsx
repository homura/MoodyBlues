import React, { useEffect, useMemo, useState } from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';
import { useStoreActions, useStoreState } from '../store';
import { Timeline, TimelineProps } from './Timeline';
import { RoundSlice, StepSlice } from '../event';

type EpochTimelineProps = SizeMeProps & {};

export const EpochTimeline = withSize()((props: EpochTimelineProps) => {
  const { epochSlice, roundSlice, activeEpoch, activeRound } = useStoreState(
    state => state.tracer,
  );
  const {
    activateRound,
    activateStep,
    inactivateRound,
    inactivateStep,
  } = useStoreActions(actions => actions.tracer);

  const [activeRoundIndex, setActiveRoundIndex] = useState<
    number | undefined
  >();
  const [activeStepIndex, setActiveStepIndex] = useState<number | undefined>();

  useEffect(() => {
    handleInactiveRound();
  }, [activeEpoch]);

  function handleActiveRound(i: number, rounds: RoundSlice[]) {
    activateRound(rounds[i].roundId);
    setActiveRoundIndex(i);
    handleInactiveStep();
  }

  function handleActiveStep(i: number, steps: StepSlice[]) {
    activateStep(steps[i].stepName);
    setActiveStepIndex(i);
  }

  function handleInactiveRound() {
    handleInactiveStep();
    inactivateRound();
    setActiveRoundIndex(undefined);
  }

  function handleInactiveStep() {
    inactivateStep();
    setActiveStepIndex(undefined);
  }

  const roundTimelineProps = useMemo<TimelineProps>(() => {
    const rounds = epochSlice.rounds();
    const segments = rounds.map(round => round.timeRange());
    const segmentsText = rounds.map(round => `R${round.roundId}`);

    return {
      segments,
      segmentsText,
      onTip: i => rounds[i].timeUsage() + 'ms',
      onClick: i => handleActiveRound(i, rounds),
    };
  }, [epochSlice]);

  const stepTimelineProps = useMemo<TimelineProps>(() => {
    const steps = roundSlice.steps();
    const segments = steps.map(step => step.timeRange());
    const segmentsText = steps.map(step => step.stepName);
    return {
      segments,
      segmentsText,
      onTip: i => steps[i].timeUsage() + 'ms',
      onClick: i => handleActiveStep(i, steps),
    };
  }, [roundSlice]);

  return (
    <>
      {activeEpoch !== null && (
        <Timeline {...roundTimelineProps} activeIndex={activeRoundIndex} />
      )}

      {activeRound !== null && (
        <Timeline {...stepTimelineProps} activeIndex={activeStepIndex} />
      )}
    </>
  );
});
