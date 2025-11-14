/**
 * Retro 1980s calculator color palette
 * Professional black/white/chrome/grey business calculator aesthetic
 */

export const RetroColors = {
  // LCD Display Colors
  lcdAmber: '#FFBF00',
  lcdGreen: '#00FF00',
  lcdBackground: '#000000',

  // Calculator Body (Casing) - Dark grey/charcoal
  casingBeige: '#2A2A2A',
  casingBrown: '#4A4A4A',
  casingDark: '#1A1A1A',

  // Button Colors - Professional greys
  buttonBeige: '#E0E0E0',
  buttonBrown: '#808080',
  buttonOrange: '#C0C0C0',
  buttonRed: '#666666',
  buttonGray: '#A0A0A0',

  // Button States
  buttonBeigeHover: '#D0D0D0',
  buttonBeigePressed: '#C0C0C0',

  // Text Colors
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
  textGray: '#808080',

  // Receipt Paper
  paperWhite: '#FFFFFF',
  paperDots: '#1A1A1A',

  // Shadows for 3D Effect
  shadowLight: '#FFFFFF',
  shadowDark: '#2A2A2A',
  shadowMedium: '#606060',

  // Status Colors
  errorRed: '#CD5C5C',
  successGreen: '#6B8E23',
  warningYellow: '#FFD700',

  // History Colors
  additionGreen: '#90EE90',
  subtractionRed: '#FFB6C1',
};

export const AmberLcdPalette = {
  display: RetroColors.lcdAmber,
  background: RetroColors.lcdBackground,
  glow: 'rgba(255, 191, 0, 0.3)',
};

export const GreenLcdPalette = {
  display: RetroColors.lcdGreen,
  background: RetroColors.lcdBackground,
  glow: 'rgba(0, 255, 0, 0.2)',
};
