import type { SVGProps } from "react";

export const NvrIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="2" y="8" width="20" height="8" rx="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="lime" />
    <circle cx="16" cy="12" r="1" fill="gray" />
  </svg>
);