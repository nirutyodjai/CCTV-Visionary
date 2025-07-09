import * as React from "react";

export function SimulationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 22H5a2 2 0 0 1-2-2V7l7-5 7 5v7" />
      <path d="M18 14 A3 3 0 0 1 15 17 A3 3 0 0 1 12 14 A3 3 0 0 1 18 14" />
      <path d="M18 22v-5h-6v5" />
    </svg>
  );
}
