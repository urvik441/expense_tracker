// App Theme and Colors Constants
// Keeping color variables centralized helps in maintaining a uniform look and implementing dark mode easily.

export const COLORS = {
  // Light Theme Palette
  light: {
    primary: '#6366f1',       // Indigo
    primaryLight: '#e0e7ff',
    primaryDark: '#4f46e5',
    background: '#f8fafc',    // Soft Slate Gray
    card: '#ffffff',
    text: '#0f172a',          // Dark Slate
    textSecondary: '#475569', // Muted Gray
    border: '#e2e8f0',        // Border Gray
    danger: '#ef4444',        // Red
    success: '#10b981',       // Green
    warning: '#f59e0b',       // Amber
    info: '#06b6d4',          // Cyan
    shadowColor: '#000000',
  },
  // Dark Theme Palette
  dark: {
    primary: '#818cf8',       // Lighter Indigo for Dark Mode
    primaryLight: '#312e81',
    primaryDark: '#6366f1',
    background: '#0f172a',    // Very Dark Slate
    card: '#1e293b',          // Card Slate Gray
    text: '#f8fafc',          // Off-white
    textSecondary: '#94a3b8', // Muted light gray
    border: '#334155',        // Darker border line
    danger: '#f87171',        // Soft red
    success: '#34d399',       // Soft green
    warning: '#fbbf24',       // Soft amber
    info: '#22d3ee',          // Soft cyan
    shadowColor: '#000000',
  }
};

export const SIZES = {
  radiusSmall: 8,
  radiusMedium: 12,
  radiusLarge: 16,
  radiusExtraLarge: 24,
  
  paddingSmall: 10,
  paddingMedium: 16,
  paddingLarge: 20,
  
  fontSmall: 12,
  fontMedium: 14,
  fontLarge: 16,
  fontExtraLarge: 20,
  fontTitle: 28,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  }
};
