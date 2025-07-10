'use client';
import type { SVGProps } from "react";

export const AudioSystemIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Speaker box */}
    <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" />
    {/* Speaker cone */}
    <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.7" />
    {/* Sound waves */}
    <path d="M16 12C16 13.6569 14.6569 15 13 15" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M8 12C8 10.3431 9.34315 9 11 9" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);
