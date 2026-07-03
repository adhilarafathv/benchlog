// ============================================================
// BenchLog — Theme Constants
// ============================================================

export const colors = {
  // Backgrounds
  background: '#0D0D0D',
  card: '#1A1A1A',
  cardElevated: '#222222',
  cardBorder: '#2A2A2A',
  surface: '#151515',

  // Accent
  accent: '#E53935',
  accentDark: '#C62828',
  accentLight: '#FF5252',
  accentGlow: 'rgba(229, 57, 53, 0.15)',
  accentBorder: 'rgba(229, 57, 53, 0.3)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textTertiary: '#616161',
  textMuted: '#4A4A4A',

  // Status
  success: '#4CAF50',
  successLight: 'rgba(76, 175, 80, 0.15)',
  warning: '#FF9800',
  warningLight: 'rgba(255, 152, 0, 0.15)',
  error: '#F44336',
  errorLight: 'rgba(244, 67, 54, 0.15)',
  info: '#2196F3',
  infoLight: 'rgba(33, 150, 243, 0.15)',

  // Workout category colors
  push: '#E53935',
  backBiceps: '#7C4DFF',
  legs: '#00BCD4',
  upper: '#FF9800',

  // Misc
  divider: '#2A2A2A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: '#333333',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const animations = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  },
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;
