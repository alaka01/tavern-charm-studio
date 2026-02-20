import type { CharacterConfig, TextEffectRule } from '@/types';

export interface DialogPreset {
  name: string;
  icon: string;
  apply: () => Partial<CharacterConfig>;
}

export const dialogPresets: DialogPreset[] = [
  {
    name: '简约竖线',
    icon: '📐',
    apply: () => ({
      bubblePreset: 'line' as const,
      bubbleBgColor: 'rgba(255,255,255,0.06)',
      useGradient: false,
      borderRadius: 8,
      showBorder: false,
      showShadow: false,
      padding: 12,
      nameFontSize: 13,
      nameBold: true,
      textColor: 'rgba(255,255,255,0.9)',
      textFontSize: 15,
      lineHeight: 1.7,
    }),
  },
  {
    name: '卡片气泡',
    icon: '💬',
    apply: () => ({
      bubblePreset: 'card' as const,
      bubbleBgColor: 'rgba(255,255,255,0.12)',
      useGradient: false,
      borderRadius: 16,
      showBorder: true,
      borderColor: 'rgba(255,255,255,0.15)',
      showShadow: true,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 8,
      padding: 14,
      nameFontSize: 14,
      nameBold: true,
      textColor: '#d0d0d0',
      textFontSize: 14,
      lineHeight: 1.6,
    }),
  },
  {
    name: '引用块',
    icon: '📝',
    apply: () => ({
      bubblePreset: 'quote' as const,
      bubbleBgColor: 'transparent',
      useGradient: false,
      borderRadius: 0,
      showBorder: false,
      showShadow: false,
      padding: 10,
      nameFontSize: 12,
      nameBold: true,
      textColor: 'rgba(255,255,255,0.85)',
      textFontSize: 15,
      lineHeight: 1.7,
    }),
  },
];

export interface TextEffectPresetItem {
  name: string;
  matchPattern: TextEffectRule['matchPattern'];
  color: string;
  italic: boolean;
  bold: boolean;
  opacity: number;
  showBg: boolean;
  bgColor: string;
}

export const textEffectPresetSets: Record<string, { label: string; icon: string; items: TextEffectPresetItem[] }> = {
  standard: {
    label: '标准文学',
    icon: '📝',
    items: [
      { name: '心理活动', matchPattern: 'asterisk', color: '#999999', italic: false, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', color: '#a0a0b0', italic: true, bold: false, opacity: 0.8, showBg: false, bgColor: '' },
      { name: '系统提示', matchPattern: 'brackets', color: '#00e5ff', italic: false, bold: false, opacity: 0.6, showBg: true, bgColor: 'rgba(0,229,255,0.1)' },
    ],
  },
  cyber: {
    label: '赛博风格',
    icon: '🌃',
    items: [
      { name: '心理活动', matchPattern: 'asterisk', color: '#a855f7', italic: true, bold: false, opacity: 0.8, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', color: '#00e5ff', italic: false, bold: false, opacity: 0.7, showBg: true, bgColor: 'rgba(0,229,255,0.08)' },
      { name: '系统提示', matchPattern: 'brackets', color: '#f0c040', italic: false, bold: true, opacity: 0.9, showBg: true, bgColor: 'rgba(240,192,64,0.1)' },
    ],
  },
  soft: {
    label: '柔和淡雅',
    icon: '🌸',
    items: [
      { name: '心理活动', matchPattern: 'asterisk', color: '#c4b5fd', italic: true, bold: false, opacity: 0.75, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', color: '#93c5fd', italic: true, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
      { name: '系统提示', matchPattern: 'brackets', color: '#fda4af', italic: false, bold: false, opacity: 0.65, showBg: true, bgColor: 'rgba(253,164,175,0.08)' },
    ],
  },
};
