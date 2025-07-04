'use client';

import React from 'react';
import { useSidebar } from './sidebar';
import { cn } from '@/lib/utils';

export function SidebarToggle() {
  const { open, toggleSidebar, isMobile, openMobile } = useSidebar();
  
  const scale = 0.4; // 120px * 0.4 = 48px (w-12), 60px * 0.4 = 24px (h-6)
  const baseWidth = 120;
  const baseHeight = 60;


  return (
     <div
      className={cn("flex items-center justify-center")}
      style={{
        width: `${baseWidth * scale}px`,
        height: `${baseHeight * scale}px`,
      }}
    >
      <div 
        className="holo-switch-wrapper"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center', 
        }}
      >
        <div className="toggle-container">
          <div className="toggle-wrap">
            <input 
              className="toggle-input" 
              id="sidebar-holo-toggle" 
              type="checkbox"
              checked={isMobile ? openMobile : open}
              onChange={toggleSidebar}
              aria-label="Toggle Sidebar"
            />
            <label className="toggle-track" htmlFor="sidebar-holo-toggle">
              <div className="track-lines">
                <div className="track-line" />
              </div>
              <div className="toggle-thumb">
                <div className="thumb-core" />
                <div className="thumb-inner" />
                <div className="thumb-scan" />
                <div className="thumb-particles">
                  <div className="thumb-particle" /><div className="thumb-particle" /><div className="thumb-particle" /><div className="thumb-particle" /><div className="thumb-particle" />
                </div>
              </div>
              <div className="toggle-data">
                <div className="data-text off">CLOSE</div>
                <div className="data-text on">OPEN</div>
                <div className="status-indicator off" />
                <div className="status-indicator on" />
              </div>
              <div className="energy-rings">
                <div className="energy-ring" /><div className="energy-ring" /><div className="energy-ring" />
              </div>
              <div className="interface-lines">
                <div className="interface-line" /><div className="interface-line" /><div className="interface-line" /><div className="interface-line" /><div className="interface-line" /><div className="interface-line" />
              </div>
              <div className="toggle-reflection" />
              <div className="holo-glow" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
