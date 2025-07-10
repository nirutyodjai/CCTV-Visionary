'use client';
import type { SVGProps } from "react";

export const AccessControlIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Card reader */}
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    {/* Keypad */}
    <rect x="9" y="10" width="6" height="2" rx="1" fill="white" fillOpacity="0.7" />
    <rect x="9" y="14" width="6" height="2" rx="1" fill="white" fillOpacity="0.5" />
    {/* Card slot */}
    <rect x="11" y="7" width="2" height="3" rx="1" fill="white" fillOpacity="0.8" />
  </svg>
);
