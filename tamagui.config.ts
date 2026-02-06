import { createTamagui, createTokens } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import { themes } from '@tamagui/themes'

// Custom pastel tokens
const pastelTokens = createTokens({
  color: {
    now1: '#fef2f2',
    now2: '#fee2e2',
    now3: '#fecaca',
    now4: '#fca5a5',
    now5: '#f87171',
    now6: '#ef4444',
    now9: '#991b1b',
    now12: '#450a0a',

    soon1: '#fefce8',
    soon2: '#fef9c3',
    soon3: '#fef08a',
    soon4: '#fdd835',
    soon5: '#facc15',
    soon6: '#eab308',
    soon9: '#854d0e',
    soon12: '#422006',

    chill1: '#ecfdf5',
    chill2: '#d1fae5',
    chill3: '#a7f3d0',
    chill4: '#6ee7b7',
    chill5: '#10b981',
    chill6: '#059669',
    chill9: '#047857',
    chill12: '#064e3b',

    pastelBackground: '#fdf4ff',
    pastelCard: '#ffffff',
    pastelBorder: '#e2e8f0',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    true: 20,
  },
  radius: {
    0: 0,
    1: 4,
    2: 6,
    3: 8,
    4: 12,
    5: 16,
    true: 9999,
  },
  zIndex: {
    0: 0,
  },
  size: {},
})

const config = createTamagui({
  tokens: pastelTokens,
  themes: {
    light: {
      ...themes.light,
      background: '$pastelBackground',
      backgroundHover: '$pastelCard',
      backgroundPress: '#f3e8ff',
      color: '$textPrimary',
      color2: '$textSecondary',
      color3: '#94a3b8',
      color4: '#e2e8f0',
      color5: '#f1f5f9',
      color8: '$pastelBackground',
      color10: '$pastelBackground',
    },
    dark: {
      ...themes.dark,
      background: '#0f172a',
      backgroundHover: '#1e293b',
      backgroundPress: '#334155',
      color: '#f8fafc',
      color2: '#cbd5e1',
      color3: '#94a3be',
      color4: '#475569',
      color5: '#1e293b',
      color8: '#0f172a',
      color10: '#0f172a',
    },
    now: {
      background: '$now1',
      backgroundHover: '$now2',
      backgroundPress: '$now3',
      color: '$now12',
      color2: '$now9',
      color3: '$now6',
    },
    soon: {
      background: '$soon1',
      backgroundHover: '$soon2',
      backgroundPress: '$soon3',
      color: '$soon12',
      color2: '$soon9',
      color3: '$soon6',
    },
    chill: {
      background: '$chill1',
      backgroundHover: '$chill2',
      backgroundPress: '$chill3',
      color: '$chill12',
      color2: '$chill9',
      color3: '$chill6',
    },
  },
  shorthands,
})

export default config
export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}