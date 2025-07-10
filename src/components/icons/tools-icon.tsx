'use client';
import type { SVGProps } from "react";

export const ToolsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* Screwdriver */}
    <path d="M3 12L12 3L14 5L11 8L13 10L16 7L18 9L9 18L7 16L10 13L8 11L5 14L3 12Z" fill="currentColor" />
    {/* Wrench */}
    <path d="M16 4C18.2091 4 20 5.79086 20 8C20 8.55228 19.5523 9 19 9C18.4477 9 18 8.55228 18 8C18 6.89543 17.1046 6 16 6C15.4477 6 15 5.55228 15 5C15 4.44772 15.4477 4 16 4Z" fill="currentColor" opacity="0.7" />
    <path d="M20 16C20 18.2091 18.2091 20 16 20C15.4477 20 15 19.5523 15 19C15 18.4477 15.4477 18 16 18C17.1046 18 18 17.1046 18 16C18 15.4477 18.4477 15 19 15C19.5523 15 20 15.4477 20 16Z" fill="currentColor" opacity="0.7" />
  </svg>
);
