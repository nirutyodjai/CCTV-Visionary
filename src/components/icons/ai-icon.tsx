'use client';
import type { SVGProps } from "react";

export const AiIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Robot head */}
    <rect x="6" y="8" width="12" height="10" rx="3" fill="currentColor" />
    {/* Robot eyes */}
    <circle cx="10" cy="12" r="1.5" fill="white" fillOpacity="0.9" />
    <circle cx="14" cy="12" r="1.5" fill="white" fillOpacity="0.9" />
    {/* Robot mouth */}
    <rect x="9" y="15" width="6" height="1" rx="0.5" fill="white" fillOpacity="0.7" />
    {/* Antenna */}
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <path d="M12 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* AI brain waves */}
    <path d="M8 6C8 6 9 5 10 6C11 7 11 5 12 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M14 6C14 6 15 5 16 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);
