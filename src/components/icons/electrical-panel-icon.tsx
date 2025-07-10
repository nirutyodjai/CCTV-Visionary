'use client';
import type { SVGProps } from "react";

export const ElectricalPanelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Panel box */}
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
    {/* Door line */}
    <rect x="10" y="4" width="1.5" height="16" fill="white" fillOpacity="0.5" />
    {/* Lightning bolt */}
    <path d="M13 8L11 13H13V16L15 11H13V8Z" fill="yellow" stroke="white" strokeWidth="0.5" />
    {/* Panel label */}
    <rect x="7" y="17" width="10" height="2" rx="1" fill="white" fillOpacity="0.3" />
  </svg>
);
