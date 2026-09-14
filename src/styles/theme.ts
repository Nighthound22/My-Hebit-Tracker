// ==============================================================================
// Aura Design Tokens & Dark Theme Constants
// ==============================================================================

import { QuadrantMeta } from '../types';

export const COLORS = {
  // Backgrounds
  bgPrimary: '#0A0C13',
  bgSecondary: '#111422',
  bgCard: 'rgba(20, 24, 41, 0.7)',
  bgCardHover: 'rgba(28, 34, 58, 0.85)',
  bgGlass: 'rgba(17, 20, 34, 0.65)',
  bgElevated: '#171B2F',
  
  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  borderHover: 'rgba(139, 92, 246, 0.35)',
  borderActive: 'rgba(6, 182, 212, 0.5)',

  // Primary Neon Accents
  auraViolet: '#8B5CF6',
  auraVioletLight: '#A78BFA',
  auraVioletGlow: 'rgba(139, 92, 246, 0.25)',

  cyberCyan: '#06B6D4',
  cyberCyanLight: '#22D3EE',
  cyberCyanGlow: 'rgba(6, 182, 212, 0.25)',

  emeraldGreen: '#10B981',
  emeraldLight: '#34D399',
  emeraldGlow: 'rgba(16, 185, 129, 0.25)',

  sunsetAmber: '#F59E0B',
  amberLight: '#FBBF24',
  amberGlow: 'rgba(245, 158, 11, 0.25)',

  coralRed: '#EF4444',
  coralLight: '#F87171',
  coralGlow: 'rgba(239, 68, 68, 0.25)',

  // Text Colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDim: '#475569',
};

export const QUADRANTS_CONFIG: Record<1 | 2 | 3 | 4, QuadrantMeta> = {
  1: {
    id: 1,
    title: 'Do First',
    subtitle: 'Urgent & Important',
    description: 'Deadline mendesak & dampak besar. Prioritaskan sekarang!',
    color: '#EF4444',
    bgGlass: 'rgba(239, 68, 68, 0.08)',
    borderAccent: 'rgba(239, 68, 68, 0.3)',
    badgeColor: '#EF4444',
  },
  2: {
    id: 2,
    title: 'Schedule',
    subtitle: 'Not Urgent & Important',
    description: 'Tujuan jangka panjang, belajar & pengembangan diri.',
    color: '#8B5CF6',
    bgGlass: 'rgba(139, 92, 246, 0.08)',
    borderAccent: 'rgba(139, 92, 246, 0.3)',
    badgeColor: '#8B5CF6',
  },
  3: {
    id: 3,
    title: 'Delegate',
    subtitle: 'Urgent & Not Important',
    description: 'Tugas administratif, rutinitas cepat, atau delegasikan.',
    color: '#F59E0B',
    bgGlass: 'rgba(245, 158, 11, 0.08)',
    borderAccent: 'rgba(245, 158, 11, 0.3)',
    badgeColor: '#F59E0B',
  },
  4: {
    id: 4,
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    description: 'Distraksi, hal-hal yang buang waktu & perlu dikurangi.',
    color: '#64748B',
    bgGlass: 'rgba(100, 116, 139, 0.08)',
    borderAccent: 'rgba(100, 116, 139, 0.25)',
    badgeColor: '#64748B',
  },
};

export const TIMEBLOCK_CATEGORIES = {
  Kerja: {
    label: 'Kerja / Coding',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#93C5FD',
  },
  Ibadah: {
    label: 'Ibadah / Spiritual',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#6EE7B7',
  },
  Istirahat: {
    label: 'Istirahat / Break',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    text: '#FCD34D',
  },
  Belajar: {
    label: 'Belajar / Upskill',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    text: '#C4B5FD',
  },
};
