'use client';
import type { SVGProps } from "react";

export const CommunicationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Antenna */}
    <rect x="10.5" y="4" width="3" height="8" rx="1.5" fill="currentColor" />
    {/* Signal waves */}
    <path d="M12 12C14.2091 12 16 13.7909 16 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 14C13.1046 14 14 14.8954 14 16" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="12" cy="19" r="2" fill="currentColor" />
  </svg>
);
