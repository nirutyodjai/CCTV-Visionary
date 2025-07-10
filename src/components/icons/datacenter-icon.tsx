'use client';
import type { SVGProps } from "react";

export const DataCenterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Server racks */}
    <rect x="4" y="5" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="10" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="16" y="5" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" />
    {/* Lights */}
    <circle cx="6" cy="8" r="0.7" fill="white" />
    <circle cx="12" cy="8" r="0.7" fill="white" />
    <circle cx="18" cy="8" r="0.7" fill="white" />
    {/* Network lines */}
    <path d="M6 19V21M12 19V21M18 19V21" stroke="white" strokeWidth="1" />
  </svg>
);
