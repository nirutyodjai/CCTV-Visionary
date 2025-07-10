'use client';
import type { SVGProps } from "react";

export const SatelliteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Dish */}
    <ellipse cx="12" cy="16" rx="6" ry="3" fill="currentColor" />
    {/* Feed arm */}
    <rect x="11.2" y="8" width="1.6" height="8" rx="0.8" fill="white" />
    {/* Signal waves */}
    <path d="M12 8C14 8 16 10 16 12" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M12 6C16 6 18 10 18 14" stroke="white" strokeWidth="1" fill="none" />
  </svg>
);
