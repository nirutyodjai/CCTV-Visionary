'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  touchSupport: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    screenSize: { width: 1920, height: 1080 },
    touchSupport: false,
    deviceType: 'desktop'
  });

  const updateDetection = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const orientation = width > height ? 'landscape' : 'portrait';
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    setDetection({
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      screenSize: { width, height },
      touchSupport,
      deviceType
    });
  }, []);

  useEffect(() => {
    updateDetection();
    
    const handleResize = () => updateDetection();
    const handleOrientationChange = () => {
      // Delay to ensure accurate dimensions after orientation change
      setTimeout(updateDetection, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateDetection]);

  return detection;
}

export function useResponsiveLayout() {
  const detection = useMobileDetection();
  
  return {
    ...detection,
    // Layout helpers
    sidebarCollapsed: detection.isMobile,
    showBottomNav: detection.isMobile,
    gridColumns: detection.isMobile ? 1 : detection.isTablet ? 2 : 3,
    compactMode: detection.isMobile || detection.isTablet,
    
    // Touch gesture helpers
    enableSwipeGestures: detection.touchSupport,
    enablePinchZoom: detection.touchSupport,
    minimumTouchTarget: detection.touchSupport ? 44 : 32, // 44px for touch, 32px for mouse
    
    // Performance helpers
    reducedAnimations: detection.isMobile, // Reduce animations on mobile for better performance
    virtualScrolling: detection.isMobile, // Enable virtual scrolling on mobile
  };
}
