'use client';
import type { SVGProps } from "react";

export const NurseCallIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Button base */}
    <circle cx="12" cy="12" r="8" fill="currentColor" />
    {/* Cross */}
    <rect x="11" y="8" width="2" height="8" rx="1" fill="white" />
    <rect x="8" y="11" width="8" height="2" rx="1" fill="white" />
    {/* Bell */}
    <path d="M12 5V7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 17C10 18.1046 10.8954 19 12 19C13.1046 19 14 18.1046 14 17" stroke="white" strokeWidth="1.5" />
  </svg>
);
