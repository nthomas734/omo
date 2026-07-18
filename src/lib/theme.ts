// omo design tokens
// Dark dialect — deep ocean teal #162E38

export const theme = {
  // Backgrounds
  bg:        '#162E38',   // app background
  board:     '#0A1C24',   // card surface on dark
  surface:   '#0F2530',   // slightly lifted surface

  // Text
  cream:     '#F5EDE0',   // primary text on dark
  dim:       'rgba(245, 237, 224, 0.4)',
  dimmer:    'rgba(245, 237, 224, 0.15)',

  // Brass — the family accent
  brass:     '#C8A97E',
  brassLow:  'rgba(200, 169, 126, 0.5)',
  brassLower:'rgba(200, 169, 126, 0.15)',

  // Borders
  border:    'rgba(200, 169, 126, 0.12)',
  borderHover: 'rgba(200, 169, 126, 0.28)',

  // Tab bar
  tabBg:     'rgba(8, 20, 26, 0.9)',

  // Category dot colors (shared with ecosystem)
  cats: {
    life:        '#8AA4C2',
    apartments:  '#D4A657',
    travel:      '#A88BB0',
    gear:        '#7B9F8C',
    coffee:      '#A87B54',
    restaurants: '#B85C5C',
    other:       '#888780',
  },

  // Light dialect (ranking view)
  light: {
    bg:         '#F5F0E8',
    bgSubtle:   '#EDE8DF',
    surface:    '#FDFAF5',
    surfaceMid: '#F0EBE0',
    border:     '#DDD8CE',
    borderMid:  '#C8C2B6',
    ink:        '#1C1A16',
    ink2:       '#3A3730',
    ink3:       '#6B6760',
    ink4:       '#8A8680',
    brass:      '#B8944E',
    brassLight: '#F0E4C8',
  },

  // Score bar colors
  bars: {
    green: '#2D6B4A',
    gold:  '#B8944E',
    amber: '#C77B5C',
    red:   '#E24B4A',
  },
} as const;

export function scoreColor(value: number): string {
  if (value >= 8) return theme.bars.green;
  if (value >= 6.5) return theme.bars.gold;
  if (value >= 5) return theme.bars.amber;
  return theme.bars.red;
}

export function categoryColor(category: string): string {
  return theme.cats[category as keyof typeof theme.cats] ?? theme.cats.other;
}
