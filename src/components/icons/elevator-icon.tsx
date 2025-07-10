'use client';
import type { SVGProps } from "react";

export const ElevatorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Elevator shaft */}
    <rect x="7" y="4" width="10" height="16" rx="2" fill="currentColor" />
    {/* Doors */}
    <rect x="9" y="6" width="2" height="12" rx="1" fill="white" fillOpacity="0.7" />
    <rect x="13" y="6" width="2" height="12" rx="1" fill="white" fillOpacity="0.7" />
    {/* Up arrow */}
    <path d="M12 8L10 10H14L12 8Z" fill="white" />
    {/* Down arrow */}
    <path d="M12 16L10 14H14L12 16Z" fill="white" />
  </svg>
);
