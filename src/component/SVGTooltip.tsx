import React from 'react';
import Tippy, { TippyProps } from '@tippy.js/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export const SVGTooltip = (props: TippyProps) => {
  return <Tippy followCursor={true} plugins={[followCursor]} {...props} />;
};
