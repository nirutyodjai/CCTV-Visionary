'use client';
import type { SVGProps } from "react";

export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Main gear */}
    <path d="M12 1L14.09 6.26L20 4L18.74 9.09L23 12L18.74 14.91L20 20L14.09 17.74L12 23L9.91 17.74L4 20L5.26 14.91L1 12L5.26 9.09L4 4L9.91 6.26L12 1Z" fill="currentColor" />
    {/* Center circle */}
    <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.9" />
    {/* Small gear (top right) */}
    <path d="M18 3L19 5L21 4L20.5 6L22 7L20.5 8L21 10L19 9L18 11L17 9L15 10L15.5 8L14 7L15.5 6L15 4L17 5L18 3Z" fill="currentColor" opacity="0.6" />
  </svg>
);
