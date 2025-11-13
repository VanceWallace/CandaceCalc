/**
 * Retro 1980s calculator color palette
 * Inspired by Canon palm printer calculators
 */

export const RetroColors = {
  // LCD Display Colors
  lcdAmber: '#FFBF00',
  lcdGreen: '#00FF00',
  lcdBackground: '#000000',

  // Calculator Body (Casing)
  casingBeige: '#D4C5B9',
  casingBrown: '#8B7355',
  casingDark: '#5C4033',

  // Button Colors
  buttonBeige: '#E8DCC4',
  buttonBrown: '#A67C52',
  buttonOrange: '#FF8C00',
  buttonRed: '#CD5C5C',
  buttonGray: '#B0AEA4',

  // Button States
  buttonBeigeHover: '#D4C5B9',
  buttonBeigePressed: '#BFA99E',

  // Text Colors
  textDark: '#333333',
  textLight: '#FFFFFF',
  textGray: '#666666',

  // Receipt Paper
  paperWhite: '#F5F5DC',
  paperDots: '#333333',

  // Shadows for 3D Effect
  shadowLight: '#FFFFFF',
  shadowDark: '#4A4A4A',
  shadowMedium: '#888888',

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
