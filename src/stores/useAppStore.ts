import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabId, CharacterConfig, StatusPanelConfig, StatusField, TextEffectRule, FlipCardConfig, ExportSettings, FormatPromptConfig, FormatPromptCharacter, GroupConfig, TypographyConfig, TypographyPreset } from '@/types';

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

const TYPOGRAPHY_PRESETS: Record<Exclude<TypographyPreset, 'custom'>, TypographyConfig> = {
  claude: {
    preset: 'claude',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif",
    fontSize: 15, lineHeight: 1.85, letterSpacing: 0.3,
    textColor: 'rgba(255,255,255,0.85)', textOpacity: 1,
    textIndent: false, textIndentSize: 0, paragraphSpacing: 12, containerPadding: 20,
    textShadow: false, textShadowColor: 'rgba(0,229,255,0.08)', textShadowBlur: 8,
    textAlign: 'justify',
    frontBg: '#1a1a2e', backBg: '#1e1e32',
  },
  novel: {
    preset: 'novel',
    fontFamily: "'Noto Serif SC', 'Source Han Serif SC', Georgia, serif",
    fontSize: 15.5, lineHeight: 1.75, letterSpacing: 0.5,
    textColor: 'rgba(237,224,212,0.88)', textOpacity: 1,
    textIndent: true, textIndentSize: 2, paragraphSpacing: 8, containerPadding: 24,
    textShadow: false, textShadowColor: 'rgba(0,0,0,0.1)', textShadowBlur: 4,
    textAlign: 'justify',
    frontBg: '#1c1917', backBg: '#1f1c19',
  },
  lightweight: {
    preset: 'lightweight',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif",
    fontSize: 14.5, lineHeight: 1.65, letterSpacing: 0.2,
    textColor: 'rgba(255,255,255,0.80)', textOpacity: 1,
    textIndent: false, textIndentSize: 0, paragraphSpacing: 6, containerPadding: 14,
    textShadow: false, textShadowColor: 'rgba(0,0,0,0.1)', textShadowBlur: 4,
    textAlign: 'left',
    frontBg: 'transparent', backBg: 'rgba(255,255,255,0.03)',
  },
  cyber: {
    preset: 'cyber',
    fontFamily: "'Space Grotesk', 'Noto Sans SC', monospace, sans-serif",
    fontSize: 14.5, lineHeight: 1.7, letterSpacing: 0.8,
    textColor: 'rgba(224,240,255,0.88)', textOpacity: 1,
    textIndent: false, textIndentSize: 0, paragraphSpacing: 10, containerPadding: 18,
    textShadow: true, textShadowColor: 'rgba(0,229,255,0.08)', textShadowBlur: 8,
    textAlign: 'left',
    frontBg: '#0a0e1a', backBg: '#0c1024',
  },
};

export { TYPOGRAPHY_PRESETS };

const defaultFlipCard = (): FlipCardConfig => ({
  frontTag: 'system-card',
  backTag: 'state',
  numberTag: 'Number-of-layers',
  textColor: '#ffffff',
  fontSize: 14,
  borderRadius: 10,
  padding: 12,
  flipHint: '👆 点击查看状态面板',
  flipHintBack: '👆 点击返回正文',
  cardBorder: false,
  cardBorderColor: 'rgba(255,255,255,0.1)',
  typography: { ...TYPOGRAPHY_PRESETS.claude },
});

const defaultExportSettings = (): ExportSettings => ({
  placement: [2], markdownOnly: true, runOnEdit: true,
});

const defaultFormatPrompt = (): FormatPromptConfig => ({
  language: 'en',
  tone: 'strict',
  placementSuggestion: 'system',
  characters: [],
  useFlipCard: true,
  paragraphSeparator: 'pipe',
  customSeparator: '',
  useFloorCounter: true,
  floorStartNumber: 0,
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
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'dialog' as TabId,
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

      exportSettings: defaultExportSettings(),
      updateExportSettings: (updates) => set((s) => ({
        exportSettings: { ...s.exportSettings, ...updates },
      })),

      formatPrompt: defaultFormatPrompt(),
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

      resetToDefaults: () => set({
        characters: [defaultCharacter(0)],
        statusPanel: defaultStatusPanel(),
        textEffects: [defaultTextEffect()],
        flipCard: defaultFlipCard(),
        exportSettings: defaultExportSettings(),
        formatPrompt: defaultFormatPrompt(),
      }),

      exportConfig: () => {
        const s = get();
        return JSON.stringify({
          characters: s.characters,
          statusPanel: s.statusPanel,
          textEffects: s.textEffects,
          flipCard: s.flipCard,
          exportSettings: s.exportSettings,
          formatPrompt: s.formatPrompt,
        }, null, 2);
      },

      importConfig: (json: string) => {
        try {
          const data = JSON.parse(json);
          const updates: Partial<AppState> = {};
          if (data.characters) updates.characters = data.characters;
          if (data.statusPanel) updates.statusPanel = data.statusPanel;
          if (data.textEffects) updates.textEffects = data.textEffects;
          if (data.flipCard) updates.flipCard = data.flipCard;
          if (data.exportSettings) updates.exportSettings = data.exportSettings;
          if (data.formatPrompt) updates.formatPrompt = data.formatPrompt;
          set(updates);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'tavern-charm-config',
      partialize: (state) => {
        const { activeTab, ...rest } = state;
        // Only persist data, not functions or activeTab
        return {
          characters: rest.characters,
          statusPanel: rest.statusPanel,
          textEffects: rest.textEffects,
          flipCard: rest.flipCard,
          exportSettings: rest.exportSettings,
          formatPrompt: rest.formatPrompt,
        };
      },
    }
  )
);
