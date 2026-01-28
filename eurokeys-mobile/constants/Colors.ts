/**
 * EuroKeys Theme Colors
 * Based on the web app's design system
 */

const eurokeysAccent = '#8b5cf6'; // Purple accent
const eurokeysAccentLight = '#a78bfa';

export default {
  light: {
    text: '#1e1e2e',
    secondaryText: '#64748b',
    background: '#f8fafc',
    card: 'rgba(255, 255, 255, 0.9)',
    tint: eurokeysAccent,
    tabIconDefault: '#94a3b8',
    tabIconSelected: eurokeysAccent,
    border: '#e2e8f0',
  },
  dark: {
    text: '#f8fafc',
    secondaryText: '#94a3b8',
    background: '#0a0a0f',
    card: 'rgba(20, 20, 30, 0.8)',
    tint: eurokeysAccentLight,
    tabIconDefault: '#64748b',
    tabIconSelected: eurokeysAccentLight,
    border: 'rgba(139, 92, 246, 0.3)',
    glow: 'rgba(139, 92, 246, 0.6)',
  },
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
