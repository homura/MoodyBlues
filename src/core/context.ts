import React, { useContext } from 'react';
import { DefaultRootClient, RootClient } from '../client';

export interface MoodybluesContextModel {
  initClient(): RootClient;
}

class DefaultMoodybluesContex implements MoodybluesContextModel {
  private currentRootClient: RootClient = new DefaultRootClient();

  initClient(): RootClient {
    this.currentRootClient = new DefaultRootClient();
    return this.rootClient();
  }

  rootClient(): RootClient {
    return this.currentRootClient;
  }
}

export const MoodybluesContext = React.createContext<MoodybluesContextModel>(
  new DefaultMoodybluesContex(),
);

export function useMBContext(): MoodybluesContextModel {
  return useContext(MoodybluesContext);
}
