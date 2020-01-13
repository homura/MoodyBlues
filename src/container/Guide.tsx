import React, { useEffect } from 'react';
import { useStoreActions } from '../store';
import { Profile } from './Profile';
import { useMBContext } from '../core/context';
import { useBoolean } from 'react-use';

export const Guide = () => {
  const initClient = useStoreActions(actions => actions.client.setClient);
  const context = useMBContext();

  const [clientMounted, toggleClientMounted] = useBoolean(false);

  useEffect(() => {
    const rootClient = context.initClient();
    initClient(rootClient);
    toggleClientMounted(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.initClient, initClient]);

  // const [eventLoaded, setEventLoaded] = useState<boolean>(false);
  //
  // useEffect(() => {
  //   (async () => {
  //     const keyframes = await fetchKeyframes(logPath);
  //
  //     switchToESClient(new ESRootClient());
  //     setEventLoaded(true);
  //   })();
  // }, []);

  if (!clientMounted) return null;
  return <Profile />;
};
