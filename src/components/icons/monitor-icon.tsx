import type { SVGProps } from "react";

export const MonitorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="2" y="4" width="20" height="14" rx="2" fill="currentColor" />
    <path d="M8 20L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 18V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);