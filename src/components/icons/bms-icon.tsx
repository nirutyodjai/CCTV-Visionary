'use client';
import type { SVGProps } from "react";

export const BmsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Building outline */}
    <rect x="4" y="6" width="16" height="12" rx="2" fill="currentColor" />
    {/* Gear */}
    <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.7" />
    <path d="M12 9V7M12 17V15M7 12H9M15 12H17M9.8 9.8L8.4 8.4M15.6 15.6L14.2 14.2M9.8 14.2L8.4 15.6M15.6 8.4L14.2 9.8" stroke="white" strokeWidth="1" />
  </svg>
);
