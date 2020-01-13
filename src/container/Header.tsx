import React from 'react';
import { Icon, Layout } from 'antd';
import styled from 'styled-components';

const Header = Layout.Header;

const Logo = styled.div`
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  line-height: 32px;
  float: left;
  font-weight: bold;
`;

export const AppHeader: React.FC = () => {
  return (
    <Header>
      <Logo>
        <Icon type="play-circle" /> Moody Blues
      </Logo>
    </Header>
  );
};
