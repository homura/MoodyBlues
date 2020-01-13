import React from 'react';
import { hot } from 'react-hot-loader';
// import './App.css';
import { store } from './store';
import { StoreProvider } from 'easy-peasy';
import { Layout } from 'antd';
import { AppHeader } from './container/Header';
import { Guide } from './container/Guide';
import { MoodybluesContext } from './core/context';
import { overlordMoodybluesContext } from './main/OverlordProvider';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <MoodybluesContext.Provider value={overlordMoodybluesContext}>
      <StoreProvider store={store}>
        <AppHeader />
        <Content>
          <Guide />
        </Content>
      </StoreProvider>
    </MoodybluesContext.Provider>
  );
};

export default hot(module)(App);
