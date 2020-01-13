import React from 'react';
import styled from 'styled-components';

import { Tooltip, message } from 'antd';
import { shortHex, toHex } from '../helper';

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed'; //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return Promise.resolve();
  }
  return navigator.clipboard.writeText(text);
}

function copyToClipboard(text: string) {
  copyTextToClipboard(text).then(() => {
    message.info('copied', 1);
  });
}

const HexContainer = styled.span`
  cursor: pointer;
  display: inline-block;
`;

interface HexProps {
  data: string | number;
  short?: boolean;
}

export const Hex = (props: HexProps) => {
  const input = props.data;
  const short = shortHex(input);
  const hex = toHex(input);

  return (
    <Tooltip overlay={hex}>
      <HexContainer onClick={() => copyToClipboard(hex)}>{short}</HexContainer>
    </Tooltip>
  );
};
