'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface PropertiesToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isOpen: boolean;
}

const PropertiesToggleButton = React.forwardRef<HTMLButtonElement, PropertiesToggleButtonProps>(
    ({ isOpen, className, ...props }, ref) => {
        const ArrowIcon = (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="20px" width="20px" className={cn("transition-transform duration-500", !isOpen && 'rotate-180')}>
                <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="hsl(var(--primary-foreground))" />
                <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill="hsl(var(--primary-foreground))" />
            </svg>
        );

        return (
            <button ref={ref} className={cn("bg-card text-card-foreground text-center w-40 rounded-2xl h-12 relative text-lg font-semibold group hidden md:inline-flex items-center justify-center", className)} type="button" {...props}>
                <div className="bg-primary rounded-xl h-10 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[152px] z-10 duration-500">
                    {ArrowIcon}
                </div>
                <p className="translate-x-2">{isOpen ? "Close" : "Properties"}</p>
            </button>
        );
    }
);

PropertiesToggleButton.displayName = 'PropertiesToggleButton';

export default PropertiesToggleButton;
