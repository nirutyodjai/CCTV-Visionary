'use client';
import React from 'react';

export const RackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect>
    <line x1="7" y1="6" x2="17" y2="6"></line>
    <line x1="7" y1="12" x2="17" y2="12"></line>
    <line x1="7" y1="18" x2="17" y2="18"></line>
  </svg>
);
