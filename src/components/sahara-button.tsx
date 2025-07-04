'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const SaharaButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative z-10 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 p-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl active:-translate-y-0.5 active:scale-100 active:shadow-md disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

SaharaButton.displayName = 'SaharaButton';

export default SaharaButton;
