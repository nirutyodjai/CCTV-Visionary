'use client';
import type { SVGProps } from "react";

export const NetworkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Main node */}
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    {/* Connections */}
    <line x1="12" y1="5" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="15" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" />
    <line x1="5" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="15" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
    {/* Sub nodes */}
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="20" cy="12" r="1" fill="currentColor" />
  </svg>
);
