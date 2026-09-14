// ==============================================================================
// Hook Deteksi Tata Letak Responsif (Desktop > 1024px vs Mobile < 768px)
// Sesuai Spesifikasi PRD Bagian 2
// ==============================================================================

import { useState, useEffect } from 'react';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;    // < 768px
  isTablet: boolean;    // 768px - 1024px
  isDesktop: boolean;   // > 1024px
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useResponsive = (): ResponsiveInfo => {
  const getDimensions = () => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 1200, height: 800 }; // SSR/fallback default
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width <= 1024;
  const isDesktop = dimensions.width > 1024;
  const deviceType: 'mobile' | 'tablet' | 'desktop' = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    width: dimensions.width,
    height: dimensions.height,
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  };
};
