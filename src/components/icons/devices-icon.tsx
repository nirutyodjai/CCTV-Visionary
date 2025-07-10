'use client';
import type { SVGProps } from "react";

export const DevicesIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Main device/component */}
    <rect x="4" y="8" width="16" height="8" rx="2" fill="currentColor" />
    {/* Device ports/connectors */}
    <circle cx="7" cy="12" r="1" fill="white" fillOpacity="0.8" />
    <circle cx="12" cy="12" r="1" fill="white" fillOpacity="0.8" />
    <circle cx="17" cy="12" r="1" fill="white" fillOpacity="0.8" />
    {/* Connection cables */}
    <path d="M7 8V5M12 8V5M17 8V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M7 16V19M12 16V19M17 16V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Device indicator */}
    <rect x="18" y="10" width="2" height="4" rx="1" fill="currentColor" opacity="0.7" />
  </svg>
);
