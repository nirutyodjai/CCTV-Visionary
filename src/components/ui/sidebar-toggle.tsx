'use client';

import React from 'react';
import { useSidebar } from './sidebar';
import { cn } from '@/lib/utils';

export function SidebarToggle() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  // This toggle is not needed on mobile, as it uses a sheet.
  if (isMobile) {
    return null;
  }

  // The group-data-collapsible selector hides this component when the sidebar is in icon-only mode.
  return (
    <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
      <label
        htmlFor="sidebar-toggle-switch"
        className="relative h-[30px] w-[75px] cursor-pointer rounded-full bg-[#d6d6d6] shadow-[inset_-4px_-4px_8px_#ffffff,inset_4px_4px_8px_#b0b0b0] dark:bg-gray-800 dark:shadow-[inset_-4px_-4px_8px_#353535,inset_4px_4px_8px_#1f1f1f]"
      >
        <input
          id="sidebar-toggle-switch"
          type="checkbox"
          className="peer hidden"
          checked={open}
          onChange={toggleSidebar}
          aria-label="Toggle Sidebar"
        />
        {/* The moving toggle part */}
        <div
          className={cn(
            'absolute top-[2.5px] left-[2.5px] flex h-[25px] w-[40px] items-center justify-start rounded-full bg-gradient-to-br from-[#d9d9d9] to-[#bfbfbf] pl-[7px] shadow-[-2px_-2px_4px_#ffffff,2px_2px_4px_#b0b0b0] transition-all duration-300 ease-in-out',
            'peer-checked:left-[32.5px] peer-checked:bg-gradient-to-br peer-checked:from-[#cfcfcf] peer-checked:to-[#a9a9a9]',
            'dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 dark:shadow-[-2px_-2px_4px_#353535,2px_2px_4px_#1f1f1f]',
            'dark:peer-checked:from-gray-600 dark:peer-checked:to-gray-800',
            // Fix: Style child LED from the parent sibling using arbitrary variants
            'peer-checked:[&>div]:bg-yellow-400 peer-checked:[&>div]:shadow-[0_0_8px_2px_#fbbf24]'
          )}
        >
          {/* LED light */}
          <div
            className={cn(
              'h-[6px] w-[6px] rounded-full bg-gray-500 shadow-[0_0_5px_1px_rgba(0,0,0,0.2)] transition-all duration-300 ease-in-out'
            )}
          />
        </div>
      </label>
    </div>
  );
}
