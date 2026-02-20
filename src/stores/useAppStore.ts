import { create } from 'zustand';
import type { TabId, CharacterConfig, StatusPanelConfig, StatusField, TextEffectRule, FlipCardConfig, ExportSettings, FormatPromptConfig, FormatPromptCharacter, GroupConfig } from '@/types';

const uuid = () => crypto.randomUUID();

const THEME_COLORS = ['#f472b6', '#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#2dd4bf', '#e2e8f0'];

const defaultCharacter = (index = 0): CharacterConfig => ({
  id: uuid(),
  name: '角色名',
  triggerFormat: 'braces_cn',
  customRegex: '',
  bubblePreset: 'line',
  themeColor: THEME_COLORS[index % THEME_COLORS.length],
  avatarMode: 'none',
  avatarEmoji: '🌸',
  bubbleBgColor: 'rgba(255,255,255,0.06)',
  useGradient: false,
  gradientColor2: '#a855f7',
  gradientDirection: '135deg',
  showBorder: false,
  borderColor: 'rgba(255,255,255,0.2)',
  borderRadius: 8,
  showShadow: false,
  shadowColor: 'rgba(0,0,0,0.2)',
  shadowBlur: 10,
  maxWidth: 100,
  padding: 12,
  align: 'left',
  nameColor: '#00e5ff',
  nameFontSize: 13,
  nameBold: true,
  showAvatar: false,
  textColor: 'rgba(255,255,255,0.9)',
  textFontSize: 15,
  lineHeight: 1.7,
});

const defaultField = (): StatusField => ({
  id: uuid(),
  name: '字段名',
  type: 'text',
  group: '基本信息',
});

const defaultGroupConfig = (): GroupConfig => ({
  columns: 0,
  layout: 'grid',
  showBorder: true,
});

const defaultStatusPanel = (): StatusPanelConfig => ({
  title: '角色状态',
  fields: [
    { id: uuid(), name: '时间', type: 'text', group: '基本信息' },
    { id: uuid(), name: '地点', type: 'text', group: '基本信息' },
    { id: uuid(), name: '服装', type: 'text', group: '外观' },
    { id: uuid(), name: '心情', type: 'badge', group: '状态' },
  ],
  columns: 2,
  bgColor: 'rgba(255,255,255,0.08)',
  showBorder: true,
  borderColor: 'rgba(255,255,255,0.2)',
  borderRadius: 12,
  valueColor: '#00e5ff',
  labelColor: '#ffffff',
  showGroupTitle: true,
  groupConfigs: {},
  groupOrder: ['基本信息', '外观', '状态'],
});

const defaultTextEffect = (): TextEffectRule => ({
  id: uuid(),
  name: '心理活动',
  matchPattern: 'asterisk',
  customRegex: '',
  color: '#999999',
  fontSize: 14,
  italic: false,
  bold: false,
  opacity: 0.8,
  showBg: false,
  bgColor: 'rgba(255,255,255,0.1)',
});

const defaultFlipCard = (): FlipCardConfig => ({
  frontTag: 'system-card',
  backTag: 'state',
  numberTag: 'Number-of-layers',
  frontBg1: '#0A1B3D',
  frontBg2: '#1C3F8C',
  frontGradientDir: '135deg',
  backBg1: '#1a0a3d',
  backBg2: '#3d1c8c',
  backGradientDir: '135deg',
  textColor: '#ffffff',
  fontSize: 14,
  borderRadius: 10,
  padding: 12,
  flipHint: '👆点击翻面',
});

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  characters: CharacterConfig[];
  addCharacter: () => void;
  updateCharacter: (id: string, updates: Partial<CharacterConfig>) => void;
  removeCharacter: (id: string) => void;
  setCharacters: (chars: CharacterConfig[]) => void;
  statusPanel: StatusPanelConfig;
  updateStatusPanel: (updates: Partial<StatusPanelConfig>) => void;
  addField: () => void;
  updateField: (id: string, updates: Partial<StatusField>) => void;
  removeField: (id: string) => void;
  setStatusPanel: (config: StatusPanelConfig) => void;
  getGroupConfig: (group: string) => GroupConfig;
  updateGroupConfig: (group: string, updates: Partial<GroupConfig>) => void;
  reorderGroups: (newOrder: string[]) => void;
  textEffects: TextEffectRule[];
  addTextEffect: () => void;
  updateTextEffect: (id: string, updates: Partial<TextEffectRule>) => void;
  removeTextEffect: (id: string) => void;
  setTextEffects: (effects: TextEffectRule[]) => void;
  flipCard: FlipCardConfig;
  updateFlipCard: (updates: Partial<FlipCardConfig>) => void;
  setFlipCard: (config: FlipCardConfig) => void;
  exportSettings: ExportSettings;
  updateExportSettings: (updates: Partial<ExportSettings>) => void;
  formatPrompt: FormatPromptConfig;
  updateFormatPrompt: (updates: Partial<FormatPromptConfig>) => void;
  updateFormatPromptChar: (name: string, updates: Partial<FormatPromptCharacter>) => void;
  addFormatPromptChar: (name: string) => void;
  removeFormatPromptChar: (name: string) => void;
  syncFormatPromptChars: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dialog',
  setActiveTab: (tab) => set({ activeTab: tab }),

  characters: [defaultCharacter(0)],
  addCharacter: () => set((s) => ({ characters: [...s.characters, defaultCharacter(s.characters.length)] })),
  updateCharacter: (id, updates) => set((s) => ({
    characters: s.characters.map(c => c.id === id ? { ...c, ...updates } : c),
  })),
  removeCharacter: (id) => set((s) => ({
    characters: s.characters.filter(c => c.id !== id),
  })),
  setCharacters: (chars) => set({ characters: chars }),

  statusPanel: defaultStatusPanel(),
  updateStatusPanel: (updates) => set((s) => ({
    statusPanel: { ...s.statusPanel, ...updates },
  })),
  addField: () => set((s) => ({
    statusPanel: { ...s.statusPanel, fields: [...s.statusPanel.fields, defaultField()] },
  })),
  updateField: (id, updates) => set((s) => {
    const newFields = s.statusPanel.fields.map(f => f.id === id ? { ...f, ...updates } : f);
    // Auto-update groupOrder when a new group appears
    const allGroups = new Set(newFields.map(f => f.group));
    const existingOrder = s.statusPanel.groupOrder || [];
    const newOrder = [...existingOrder.filter(g => allGroups.has(g))];
    allGroups.forEach(g => { if (!newOrder.includes(g)) newOrder.push(g); });
    return {
      statusPanel: { ...s.statusPanel, fields: newFields, groupOrder: newOrder },
    };
  }),
  removeField: (id) => set((s) => ({
    statusPanel: {
      ...s.statusPanel,
      fields: s.statusPanel.fields.filter(f => f.id !== id),
    },
  })),
  setStatusPanel: (config) => set({ statusPanel: config }),
  getGroupConfig: (group) => {
    return get().statusPanel.groupConfigs[group] || defaultGroupConfig();
  },
  updateGroupConfig: (group, updates) => set((s) => ({
    statusPanel: {
      ...s.statusPanel,
      groupConfigs: {
        ...s.statusPanel.groupConfigs,
        [group]: { ...(s.statusPanel.groupConfigs[group] || defaultGroupConfig()), ...updates },
      },
    },
  })),
  reorderGroups: (newOrder) => set((s) => ({
    statusPanel: { ...s.statusPanel, groupOrder: newOrder },
  })),

  textEffects: [defaultTextEffect()],
  addTextEffect: () => set((s) => ({ textEffects: [...s.textEffects, defaultTextEffect()] })),
  updateTextEffect: (id, updates) => set((s) => ({
    textEffects: s.textEffects.map(e => e.id === id ? { ...e, ...updates } : e),
  })),
  removeTextEffect: (id) => set((s) => ({
    textEffects: s.textEffects.filter(e => e.id !== id),
  })),
  setTextEffects: (effects) => set({ textEffects: effects }),

  flipCard: defaultFlipCard(),
  updateFlipCard: (updates) => set((s) => ({
    flipCard: { ...s.flipCard, ...updates },
  })),
  setFlipCard: (config) => set({ flipCard: config }),

  exportSettings: { placement: [2], markdownOnly: true, runOnEdit: true },
  updateExportSettings: (updates) => set((s) => ({
    exportSettings: { ...s.exportSettings, ...updates },
  })),

  formatPrompt: {
    language: 'en',
    tone: 'strict',
    placementSuggestion: 'system',
    characters: [],
    useFlipCard: true,
    paragraphSeparator: 'pipe',
    customSeparator: '',
    useFloorCounter: true,
    floorStartNumber: 0,
  },
  updateFormatPrompt: (updates) => set((s) => ({
    formatPrompt: { ...s.formatPrompt, ...updates },
  })),
  updateFormatPromptChar: (name, updates) => set((s) => ({
    formatPrompt: {
      ...s.formatPrompt,
      characters: s.formatPrompt.characters.map(c => c.name === name ? { ...c, ...updates } : c),
    },
  })),
  addFormatPromptChar: (name) => set((s) => ({
    formatPrompt: {
      ...s.formatPrompt,
      characters: [...s.formatPrompt.characters, { name, needDialog: true, needStatus: true }],
    },
  })),
  removeFormatPromptChar: (name) => set((s) => ({
    formatPrompt: {
      ...s.formatPrompt,
      characters: s.formatPrompt.characters.filter(c => c.name !== name),
    },
  })),
  syncFormatPromptChars: () => set((s) => {
    const names = new Set<string>();
    s.characters.forEach(c => { if (c.name) names.add(c.name); });
    const existing = new Map(s.formatPrompt.characters.map(c => [c.name, c]));
    const merged: FormatPromptCharacter[] = [];
    names.forEach(name => {
      merged.push(existing.get(name) || { name, needDialog: true, needStatus: true });
    });
    s.formatPrompt.characters.forEach(c => {
      if (!names.has(c.name)) merged.push(c);
    });
    return { formatPrompt: { ...s.formatPrompt, characters: merged } };
  }),
}));
