'use client';
import type { SVGProps } from "react";

export const NavigatorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Building outline */}
    <path d="M5 3V21H19V7L15 3H5Z" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Building details */}
    <rect x="7" y="7" width="2" height="2" fill="currentColor" />
    <rect x="11" y="7" width="2" height="2" fill="currentColor" />
    <rect x="7" y="11" width="2" height="2" fill="currentColor" />
    <rect x="11" y="11" width="2" height="2" fill="currentColor" />
    <rect x="7" y="15" width="2" height="2" fill="currentColor" />
    <rect x="11" y="15" width="2" height="2" fill="currentColor" />
    {/* Navigation compass */}
    <circle cx="16" cy="5" r="3" fill="currentColor" opacity="0.8" />
    <path d="M15 4L17 6L15 6L15 4Z" fill="white" />
    <path d="M17 6L15 4L17 4L17 6Z" fill="white" opacity="0.7" />
  </svg>
);
