'use client';
import type { SVGProps } from "react";

export const FilesIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Upload arrow */}
    <path d="M12 3L12 15M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Base platform */}
    <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Documents */}
    <rect x="6" y="16" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
    <rect x="10" y="16" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
    <rect x="15" y="16" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.3" />
  </svg>
);
