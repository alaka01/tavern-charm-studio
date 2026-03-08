import type { CharacterConfig, StatusPanelConfig, StatusField, TextEffectRule, FlipCardConfig, GroupConfig, TypographyConfig } from '@/types';
import { TYPOGRAPHY_PRESETS } from '@/stores/useAppStore';

const uuid = () => crypto.randomUUID();

export interface GlobalPreset {
  key: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  dialog: Partial<CharacterConfig>;
  statusPanel: Partial<StatusPanelConfig> & { fields: StatusField[]; groupOrder: string[] };
  textEffects: Omit<TextEffectRule, 'id'>[];
  flipCard: Partial<FlipCardConfig>;
}

const defaultGroupConfig = (): GroupConfig => ({ columns: 0, layout: 'grid', showBorder: true });

export const GLOBAL_PRESETS: GlobalPreset[] = [
  {
    key: 'warm-daily',
    name: '温暖日常',
    emoji: '🌸',
    description: '柔和温暖，适合日常 RP 和治愈系角色',
    tags: ['竖线气泡', '温柔粉', '网格面板', 'Claude 风排版'],
    dialog: {
      bubblePreset: 'line',
      themeColor: '#f472b6',
      avatarMode: 'initial',
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
    },
    statusPanel: {
      title: '角色状态',
      fields: [
        { id: uuid(), name: '时间', type: 'text', group: '基本信息' },
        { id: uuid(), name: '地点', type: 'text', group: '基本信息' },
        { id: uuid(), name: '心情', type: 'badge', group: '状态' },
        { id: uuid(), name: '服装', type: 'text', group: '外观' },
      ],
      columns: 2,
      bgColor: 'rgba(255,255,255,0.08)',
      showBorder: true,
      borderColor: 'rgba(244,114,182,0.3)',
      borderRadius: 12,
      valueColor: '#f472b6',
      labelColor: '#ffffff',
      showGroupTitle: true,
      groupConfigs: {},
      groupOrder: ['基本信息', '状态', '外观'],
    },
    textEffects: [
      { name: '心理活动', matchPattern: 'asterisk', customRegex: '', color: '#c4b5fd', fontSize: 14, italic: true, bold: false, opacity: 0.75, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', customRegex: '', color: '#93c5fd', fontSize: 14, italic: true, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
    ],
    flipCard: {
      typography: { ...TYPOGRAPHY_PRESETS.claude },
      cardBorder: false,
      cardBorderColor: 'rgba(244,114,182,0.2)',
      borderRadius: 10,
    },
  },
  {
    key: 'dark-gothic',
    name: '暗黑哥特',
    emoji: '🦇',
    description: '深沉神秘，适合暗黑系和恐怖题材角色',
    tags: ['卡片气泡', '深紫主题', '高亮面板', '小说风排版'],
    dialog: {
      bubblePreset: 'card',
      themeColor: '#a78bfa',
      avatarMode: 'emoji',
      avatarEmoji: '🌙',
      bubbleBgColor: 'rgba(88,28,135,0.15)',
      useGradient: false,
      borderRadius: 16,
      showBorder: true,
      borderColor: 'rgba(167,139,250,0.2)',
      showShadow: true,
      shadowColor: 'rgba(88,28,135,0.3)',
      shadowBlur: 12,
      padding: 14,
      nameFontSize: 14,
      nameBold: true,
      textColor: 'rgba(230,220,240,0.88)',
      textFontSize: 14,
      lineHeight: 1.7,
    },
    statusPanel: {
      title: '角色状态',
      fields: [
        { id: uuid(), name: '时间', type: 'text', group: '基本信息' },
        { id: uuid(), name: '地点', type: 'text', group: '基本信息' },
        { id: uuid(), name: '生命值', type: 'progress', group: '状态' },
        { id: uuid(), name: '心智', type: 'progress', group: '状态' },
        { id: uuid(), name: '状态', type: 'badge', group: '状态' },
      ],
      columns: 2,
      bgColor: 'rgba(88,28,135,0.12)',
      showBorder: true,
      borderColor: 'rgba(167,139,250,0.25)',
      borderRadius: 12,
      valueColor: '#a78bfa',
      labelColor: 'rgba(230,220,240,0.85)',
      showGroupTitle: true,
      groupConfigs: { '状态': { columns: 0, layout: 'highlight', showBorder: true } },
      groupOrder: ['基本信息', '状态'],
    },
    textEffects: [
      { name: '心理活动', matchPattern: 'asterisk', customRegex: '', color: '#a78bfa', fontSize: 14, italic: true, bold: false, opacity: 0.8, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', customRegex: '', color: '#7c3aed', fontSize: 14, italic: true, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
    ],
    flipCard: {
      typography: { ...TYPOGRAPHY_PRESETS.novel },
      cardBorder: true,
      cardBorderColor: 'rgba(167,139,250,0.15)',
      borderRadius: 12,
    },
  },
  {
    key: 'cyberpunk',
    name: '赛博朋克',
    emoji: '🌃',
    description: '霓虹辉光，适合科幻和现代都市题材',
    tags: ['引用块气泡', '薄荷青', '紧凑标签', '赛博霓虹排版'],
    dialog: {
      bubblePreset: 'quote',
      themeColor: '#2dd4bf',
      avatarMode: 'emoji',
      avatarEmoji: '⚡',
      bubbleBgColor: 'transparent',
      useGradient: false,
      borderRadius: 0,
      showBorder: false,
      showShadow: false,
      padding: 10,
      nameFontSize: 12,
      nameBold: true,
      textColor: 'rgba(224,240,255,0.88)',
      textFontSize: 15,
      lineHeight: 1.7,
    },
    statusPanel: {
      title: '系统终端',
      fields: [
        { id: uuid(), name: '时间', type: 'text', group: '环境' },
        { id: uuid(), name: '地点', type: 'text', group: '环境' },
        { id: uuid(), name: '能量', type: 'progress', group: '数据' },
        { id: uuid(), name: '信用', type: 'text', group: '数据' },
        { id: uuid(), name: '状态', type: 'badge', group: '数据' },
      ],
      columns: 2,
      bgColor: 'rgba(0,229,255,0.06)',
      showBorder: true,
      borderColor: 'rgba(45,212,191,0.3)',
      borderRadius: 8,
      valueColor: '#2dd4bf',
      labelColor: 'rgba(224,240,255,0.8)',
      showGroupTitle: true,
      groupConfigs: { '数据': { columns: 0, layout: 'compact', showBorder: true } },
      groupOrder: ['环境', '数据'],
    },
    textEffects: [
      { name: '心理活动', matchPattern: 'asterisk', customRegex: '', color: '#a855f7', fontSize: 14, italic: true, bold: false, opacity: 0.8, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', customRegex: '', color: '#00e5ff', fontSize: 14, italic: false, bold: false, opacity: 0.7, showBg: true, bgColor: 'rgba(0,229,255,0.08)' },
      { name: '系统提示', matchPattern: 'brackets', customRegex: '', color: '#f0c040', fontSize: 14, italic: false, bold: true, opacity: 0.9, showBg: true, bgColor: 'rgba(240,192,64,0.1)' },
    ],
    flipCard: {
      typography: { ...TYPOGRAPHY_PRESETS.cyber },
      cardBorder: true,
      cardBorderColor: 'rgba(45,212,191,0.15)',
      borderRadius: 6,
    },
  },
  {
    key: 'campus',
    name: '清新校园',
    emoji: '🌿',
    description: '明快清爽，适合校园和日常轻松题材',
    tags: ['竖线气泡', '天空蓝', '左右标签', '轻量简洁排版'],
    dialog: {
      bubblePreset: 'line',
      themeColor: '#38bdf8',
      avatarMode: 'initial',
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
    },
    statusPanel: {
      title: '角色状态',
      fields: [
        { id: uuid(), name: '时间', type: 'text', group: '基本信息' },
        { id: uuid(), name: '地点', type: 'text', group: '基本信息' },
        { id: uuid(), name: '心情', type: 'badge', group: '状态' },
        { id: uuid(), name: '服装', type: 'text', group: '外观' },
      ],
      columns: 2,
      bgColor: 'rgba(56,189,248,0.06)',
      showBorder: true,
      borderColor: 'rgba(56,189,248,0.25)',
      borderRadius: 12,
      valueColor: '#38bdf8',
      labelColor: '#ffffff',
      showGroupTitle: true,
      groupConfigs: { '基本信息': { columns: 0, layout: 'label', showBorder: true } },
      groupOrder: ['基本信息', '状态', '外观'],
    },
    textEffects: [
      { name: '心理活动', matchPattern: 'asterisk', customRegex: '', color: '#93c5fd', fontSize: 14, italic: true, bold: false, opacity: 0.75, showBg: false, bgColor: '' },
      { name: '旁白描写', matchPattern: 'cn_parens', customRegex: '', color: '#a5b4fc', fontSize: 14, italic: true, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
    ],
    flipCard: {
      typography: { ...TYPOGRAPHY_PRESETS.lightweight },
      cardBorder: false,
      cardBorderColor: 'rgba(56,189,248,0.15)',
      borderRadius: 10,
    },
  },
  {
    key: 'minimal',
    name: '极简纯净',
    emoji: '✨',
    description: '最小改动，只做关键优化，接近原版',
    tags: ['竖线气泡', '银白', '最少字段', '轻量排版'],
    dialog: {
      bubblePreset: 'line',
      themeColor: '#e2e8f0',
      avatarMode: 'none',
      bubbleBgColor: 'rgba(255,255,255,0.06)',
      useGradient: false,
      borderRadius: 8,
      showBorder: false,
      showShadow: false,
      padding: 12,
      nameFontSize: 13,
      nameBold: true,
      textColor: 'rgba(255,255,255,0.85)',
      textFontSize: 15,
      lineHeight: 1.7,
    },
    statusPanel: {
      title: '状态',
      fields: [
        { id: uuid(), name: '时间', type: 'text', group: '信息' },
        { id: uuid(), name: '地点', type: 'text', group: '信息' },
        { id: uuid(), name: '心情', type: 'text', group: '信息' },
      ],
      columns: 3,
      bgColor: 'rgba(255,255,255,0.05)',
      showBorder: true,
      borderColor: 'rgba(255,255,255,0.12)',
      borderRadius: 8,
      valueColor: '#e2e8f0',
      labelColor: 'rgba(255,255,255,0.7)',
      showGroupTitle: false,
      groupConfigs: {},
      groupOrder: ['信息'],
    },
    textEffects: [
      { name: '心理活动', matchPattern: 'asterisk', customRegex: '', color: '#999999', fontSize: 14, italic: false, bold: false, opacity: 0.7, showBg: false, bgColor: '' },
    ],
    flipCard: {
      typography: { ...TYPOGRAPHY_PRESETS.lightweight },
      cardBorder: false,
      cardBorderColor: 'rgba(255,255,255,0.1)',
      borderRadius: 8,
    },
  },
];

/** Apply a global preset to the store */
export function applyGlobalPreset(
  preset: GlobalPreset,
  store: {
    setCharacters: (chars: CharacterConfig[]) => void;
    characters: CharacterConfig[];
    setStatusPanel: (config: StatusPanelConfig) => void;
    statusPanel: StatusPanelConfig;
    setTextEffects: (effects: TextEffectRule[]) => void;
    setFlipCard: (config: FlipCardConfig) => void;
    flipCard: FlipCardConfig;
    updateCharacter: (id: string, updates: Partial<CharacterConfig>) => void;
  },
) {
  // Update all characters with dialog preset
  const updatedChars = store.characters.map(c => ({
    ...c,
    ...preset.dialog,
  }));
  store.setCharacters(updatedChars);

  // Status panel - merge with defaults
  const fullStatus: StatusPanelConfig = {
    ...store.statusPanel,
    ...preset.statusPanel,
  };
  store.setStatusPanel(fullStatus);

  // Text effects
  const effects: TextEffectRule[] = preset.textEffects.map(e => ({
    ...e,
    id: crypto.randomUUID(),
  }));
  store.setTextEffects(effects);

  // Flip card
  const fullFlip: FlipCardConfig = {
    ...store.flipCard,
    ...preset.flipCard,
  };
  store.setFlipCard(fullFlip);
}
