import React from 'react';
import type { SVGProps } from 'react';

export const ConnectIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m13 17 6-6-6-6" />
    <path d="M7 17 1 11l6-6" />
  </svg>
);
