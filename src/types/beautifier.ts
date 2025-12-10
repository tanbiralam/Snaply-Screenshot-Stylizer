export interface StyleSettings {
  padding: number;
  borderRadius: number;
  shadowIntensity: number;
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  useGradient: boolean;
  blurBackground: boolean;
  aspectRatio: '1:1' | '16:9' | '4:5' | '9:16' | 'auto';
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  settings: Partial<StyleSettings>;
}

export const defaultSettings: StyleSettings = {
  padding: 48,
  borderRadius: 16,
  shadowIntensity: 30,
  backgroundColor: '#ffffff',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  useGradient: false,
  blurBackground: false,
  aspectRatio: 'auto',
};

export const presets: Preset[] = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Blurred background with soft shadow',
    settings: {
      padding: 64,
      borderRadius: 24,
      shadowIntensity: 40,
      blurBackground: true,
      useGradient: true,
      gradientStart: '#a8edea',
      gradientEnd: '#fed6e3',
    },
  },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    description: 'Teal to purple gradient',
    settings: {
      padding: 56,
      borderRadius: 20,
      shadowIntensity: 35,
      useGradient: true,
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      blurBackground: false,
    },
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    description: 'Pink to orange warmth',
    settings: {
      padding: 56,
      borderRadius: 20,
      shadowIntensity: 35,
      useGradient: true,
      gradientStart: '#f093fb',
      gradientEnd: '#f5576c',
      blurBackground: false,
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean white background',
    settings: {
      padding: 40,
      borderRadius: 12,
      shadowIntensity: 20,
      backgroundColor: '#ffffff',
      useGradient: false,
      blurBackground: false,
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean dark background',
    settings: {
      padding: 40,
      borderRadius: 12,
      shadowIntensity: 25,
      backgroundColor: '#1a1a2e',
      useGradient: false,
      blurBackground: false,
    },
  },
  {
    id: 'heavy-shadow',
    name: 'Heavy Shadow',
    description: 'Dramatic drop shadow',
    settings: {
      padding: 72,
      borderRadius: 16,
      shadowIntensity: 60,
      backgroundColor: '#f8f9fa',
      useGradient: false,
      blurBackground: false,
    },
  },
  {
    id: 'rounded-card',
    name: 'Rounded Card',
    description: 'Extra rounded corners',
    settings: {
      padding: 48,
      borderRadius: 32,
      shadowIntensity: 30,
      backgroundColor: '#ffffff',
      useGradient: false,
      blurBackground: false,
    },
  },
  {
    id: 'ocean-gradient',
    name: 'Ocean Gradient',
    description: 'Blue to teal waves',
    settings: {
      padding: 56,
      borderRadius: 20,
      shadowIntensity: 30,
      useGradient: true,
      gradientStart: '#2193b0',
      gradientEnd: '#6dd5ed',
      blurBackground: false,
    },
  },
];
