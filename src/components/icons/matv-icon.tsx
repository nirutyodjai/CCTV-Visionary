'use client';
import type { SVGProps } from "react";

export const MatvIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* TV box */}
    <rect x="4" y="7" width="16" height="10" rx="2" fill="currentColor" />
    {/* Antenna */}
    <rect x="11" y="3" width="2" height="4" rx="1" fill="currentColor" />
    <path d="M12 3L9 6M12 3L15 6" stroke="currentColor" strokeWidth="1.5" />
    {/* Screen */}
    <rect x="7" y="10" width="10" height="4" rx="1" fill="white" fillOpacity="0.5" />
  </svg>
);
