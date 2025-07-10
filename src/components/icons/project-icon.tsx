'use client';
import type { SVGProps } from "react";

export const ProjectIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Project folder */}
    <path d="M4 6C4 4.89543 4.89543 4 6 4H10L12 6H18C19.1046 6 20 6.89543 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" fill="currentColor" />
    {/* Document stack */}
    <rect x="7" y="9" width="10" height="2" rx="1" fill="white" fillOpacity="0.8" />
    <rect x="7" y="12" width="8" height="2" rx="1" fill="white" fillOpacity="0.6" />
    <rect x="7" y="15" width="6" height="2" rx="1" fill="white" fillOpacity="0.4" />
  </svg>
);
