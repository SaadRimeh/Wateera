export const COLORS = {
  // Backgrounds
  bgDark: '#070B14',
  bgCard: 'rgba(21, 29, 45, 0.75)',
  bgCardHover: 'rgba(30, 41, 64, 0.85)',
  bgGlass: 'rgba(255, 255, 255, 0.05)',
  bgGlassActive: 'rgba(255, 255, 255, 0.10)',
  bgModal: '#0D1321',

  // Borders
  borderGlass: 'rgba(255, 255, 255, 0.09)',
  borderActive: 'rgba(255, 255, 255, 0.22)',
  borderGlowPrimary: 'rgba(16, 185, 129, 0.35)',

  // Module Accents
  emerald: '#10B981',       // Gym & Health
  focusGreen: '#22C55E',    // Focus Timer
  cyan: '#06B6D4',          // Study
  violet: '#8B5CF6',        // Work
  amber: '#F59E0B',         // Finances Income & Debt
  rose: '#F43F5E',          // Finances Expense
  blue: '#3B82F6',          // Tasks general

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#0F172A',

  // System
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const GLASS_STYLE = {
  backgroundColor: COLORS.bgCard,
  borderColor: COLORS.borderGlass,
  borderWidth: 1,
  borderRadius: 18,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.35,
  shadowRadius: 16,
  elevation: 6,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  glowGreen: {
    shadowColor: COLORS.focusGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  glowCyan: {
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 7,
  },
  glowAmber: {
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 7,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const RADII = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};
