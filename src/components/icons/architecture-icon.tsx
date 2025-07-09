'use client';
import type { SVGProps } from "react";

export const ArchitectureIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Building structure */}
    <path d="M4 20V8L12 4L20 8V20H4Z" fill="currentColor" />
    {/* Roof */}
    <path d="M3 9L12 4L21 9L12 5L3 9Z" fill="currentColor" opacity="0.8" />
    {/* Door */}
    <rect x="10" y="14" width="4" height="6" fill="white" fillOpacity="0.7" />
    {/* Windows */}
    <rect x="6" y="10" width="3" height="3" fill="white" fillOpacity="0.5" />
    <rect x="15" y="10" width="3" height="3" fill="white" fillOpacity="0.5" />
    {/* Architectural details */}
    <path d="M4 14H8M16 14H20" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);
