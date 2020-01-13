import React /*, { useState }*/ from 'react';
import styled from 'styled-components';
import { Divider /*, Drawer, Button */ } from 'antd';

import { RoundHeatmap } from './RoundHeatmap';
import { EventList } from './EventList';
import { EpochOverview } from './EpochOverview';
import { Dashboard } from './Dashboard';
// import { EpochTimeline } from './EpochTimeline';
import { useStoreState } from '../store';
import _ from 'lodash';
// import { Config } from './NodeTracer/Confg';
import { NodeSelector } from './NodeSelector';

const ProfileWrapper = styled.div`
  padding: 20px;
`;

export const Profile: React.FC = () => {
  const { activeEpoch } = useStoreState(state => state.tracer);
  // const [showConfig, setShowConfig] = useState<boolean>(false);

  const epochSelected = !_.isNil(activeEpoch);

  return (
    <ProfileWrapper>
      {/*<Button onClick={() => setShowConfig(true)}>config</Button>*/}
      {/*<Drawer visible={showConfig} onClose={() => setShowConfig(false)}>*/}
      {/*  <Config />*/}
      {/*</Drawer>*/}
      <NodeSelector />
      <Divider />
      <RoundHeatmap />

      {epochSelected && (
        <>
          <Divider />
          <EpochOverview />

          <Divider />
          {/*<EpochTimeline />*/}
          <Dashboard />

          <Divider />
          <EventList />
        </>
      )}
    </ProfileWrapper>
  );
};
