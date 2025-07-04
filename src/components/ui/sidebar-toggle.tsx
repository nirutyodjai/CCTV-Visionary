'use client';

import React from 'react';
import { useSidebar } from './sidebar';

export function SidebarToggle() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  if (isMobile) {
    return null;
  }

  // The provided CSS has fixed sizes, which is too large for the header.
  // We scale it down to match the other toggles.
  const scale = 0.4;

  return (
    <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden holo-switch-wrapper">
       <div 
          className="toggle-container"
          // We need to adjust the container height to compensate for the scale, to avoid large empty space.
          style={{ transform: `scale(${scale})`, height: `calc(60px * ${scale})` }}
        >
        <div className="toggle-wrap">
          <input 
            className="toggle-input" 
            id="sidebar-holo-toggle" 
            type="checkbox"
            checked={open}
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
  );
}
