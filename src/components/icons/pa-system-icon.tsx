'use client';
import type { SVGProps } from "react";

export const PaSystemIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Microphone base */}
    <rect x="10" y="14" width="4" height="6" rx="2" fill="currentColor" />
    {/* Mic head */}
    <ellipse cx="12" cy="10" rx="4" ry="6" fill="currentColor" />
    {/* Sound waves */}
    <path d="M16 10C18 10 18 14 16 14" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M8 10C6 10 6 14 8 14" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);
