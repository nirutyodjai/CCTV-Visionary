'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface PropertiesToggleButtonProps {
    isOpen: boolean;
    onChange: (isOpen: boolean) => void;
    className?: string;
}

const PropertiesToggleButton = React.forwardRef<HTMLLabelElement, PropertiesToggleButtonProps>(
    ({ isOpen, onChange, className, ...props }, ref) => {
        return (
            <label 
                ref={ref} 
                {...props} 
                className={cn("hidden md:inline-flex relative cursor-pointer items-center", className)}
            >
                <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={isOpen}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-label={isOpen ? 'Close properties panel' : 'Open properties panel'}
                />
                <div className="border border-border shadow-inner peer-checked:shadow-primary/30 shadow-destructive/30 flex h-6 w-12 items-center rounded bg-destructive pl-7 text-white transition-all duration-300 peer-checked:bg-primary peer-checked:pl-2" />
                
                {/* Unlocked Icon - shows when isOpen is true */}
                <svg className="pointer-events-none absolute left-1 w-5 h-5 text-white transition-opacity duration-300 opacity-0 peer-checked:opacity-100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30,46V38a20,20,0,0,1,40,0v8a8,8,0,0,1,8,8V74a8,8,0,0,1-8,8H30a8,8,0,0,1-8-8V54A8,8,0,0,1,30,46Zm32-8v8H38V38a12,12,0,0,1,24,0Z" fill="currentColor" fillRule="evenodd" />
                </svg>

                {/* Locked Icon - shows when isOpen is false */}
                <svg className="pointer-events-none absolute left-6 w-5 h-5 text-white transition-opacity duration-300 opacity-100 peer-checked:opacity-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50,18A19.9,19.9,0,0,0,30,38v8a8,8,0,0,0-8,8V74a8,8,0,0,0,8,8H70a8,8,0,0,0,8-8V54a8,8,0,0,0-8-8H38V38a12,12,0,0,1,23.6-3,4,4,0,1,0,7.8-2A20.1,20.1,0,0,0,50,18Z" fill="currentColor" />
                </svg>

                <div className="pointer-events-none absolute left-1 top-[2px] flex h-5 w-5 items-center justify-center rounded-sm bg-white shadow-lg transition-all duration-300 peer-checked:left-6" />
            </label>
        );
    }
);

PropertiesToggleButton.displayName = 'PropertiesToggleButton';

export default PropertiesToggleButton;
