import { MoodybluesContextModel } from '../core/context';
import { RootClient } from '../client';
import { ESRootClient } from './ESRootClient';

export class OverlordProvider implements MoodybluesContextModel {
  initClient(): RootClient {
    return new ESRootClient();
  }
}

export const overlordMoodybluesContext = new OverlordProvider();
