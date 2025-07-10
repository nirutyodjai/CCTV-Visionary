'use client';
import type { SVGProps } from "react";

export const FireAlarmPanelIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Panel box */}
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
    {/* Fire symbol */}
    <path d="M12 10C12 8 14 8 14 10C14 12 10 12 10 10C10 8 12 8 12 10Z" fill="yellow" stroke="white" strokeWidth="0.5" />
    {/* Panel label */}
    <rect x="7" y="17" width="10" height="2" rx="1" fill="white" fillOpacity="0.3" />
  </svg>
);
