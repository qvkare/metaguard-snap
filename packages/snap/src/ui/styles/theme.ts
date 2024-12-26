export const colors = {
  // Primary colors
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',

  // Secondary colors
  secondary: '#7C4DFF',
  secondaryDark: '#651FFF',
  secondaryLight: '#B388FF',

  // Status colors
  success: '#4CAF50',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#29B6F6',

  // Risk level colors
  critical: '#D32F2F',
  high: '#F44336',
  medium: '#FFA726',
  low: '#66BB6A',

  // Neutral colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  text: '#212121',
  textSecondary: '#757575',
  disabled: '#BDBDBD',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const typography = {
  heading: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  subheading: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  body: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.4,
  },
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  round: '50%',
};

export const animations = {
  transition: 'all 0.2s ease-in-out',
  fadeIn: 'fadeIn 0.3s ease-in',
  slideIn: 'slideIn 0.3s ease-out',
};

export const layout = {
  maxWidth: '1200px',
  containerPadding: spacing.md,
  sectionSpacing: spacing.xl,
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  animations,
  layout,
}; 