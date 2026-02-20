export type TabId = 'dialog' | 'status' | 'textEffect' | 'flipCard' | 'formatPrompt' | 'export';
export type PromptLanguage = 'en' | 'zh' | 'bilingual';
export type PromptTone = 'strict' | 'gentle' | 'concise';
export type PlacementSuggestion = 'system' | 'author_note' | 'world_info';
export type ParagraphSeparator = 'pipe' | 'hr' | 'none' | 'custom';
export type TriggerFormat = 'braces_cn' | 'braces_en' | 'japanese' | 'cn_quotes' | 'custom';
export type FieldType = 'text' | 'progress' | 'badge';
export type MatchPattern = 'asterisk' | 'cn_parens' | 'brackets' | 'strikethrough' | 'custom';
export type Alignment = 'left' | 'center' | 'right';
export type AvatarMode = 'none' | 'initial' | 'emoji';
export type BubblePreset = 'line' | 'card' | 'quote';
export type GroupLayout = 'grid' | 'label' | 'compact' | 'highlight';

export interface CharacterConfig {
  id: string;
  name: string;
  triggerFormat: TriggerFormat;
  customRegex: string;
  // Bubble preset
  bubblePreset: BubblePreset;
  // Theme color (controls left border + name color)
  themeColor: string;
  // Avatar
  avatarMode: AvatarMode;
  avatarEmoji: string;
  // Legacy bubble style fields (used by 'card' preset)
  bubbleBgColor: string;
  useGradient: boolean;
  gradientColor2: string;
  gradientDirection: string;
  showBorder: boolean;
  borderColor: string;
  borderRadius: number;
  showShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  maxWidth: number;
  padding: number;
  align: Alignment;
  nameColor: string;
  nameFontSize: number;
  nameBold: boolean;
  showAvatar: boolean; // kept for compat but replaced by avatarMode
  textColor: string;
  textFontSize: number;
  lineHeight: number;
}

export interface StatusField {
  id: string;
  name: string;
  type: FieldType;
  group: string;
}

export interface GroupConfig {
  columns: number; // 0 = use global
  layout: GroupLayout;
  showBorder: boolean;
}

export interface StatusPanelConfig {
  title: string;
  fields: StatusField[];
  columns: number;
  bgColor: string;
  showBorder: boolean;
  borderColor: string;
  borderRadius: number;
  valueColor: string;
  labelColor: string;
  showGroupTitle: boolean;
  groupConfigs: Record<string, GroupConfig>;
  groupOrder: string[];
}

export interface TextEffectRule {
  id: string;
  name: string;
  matchPattern: MatchPattern;
  customRegex: string;
  color: string;
  fontSize: number;
  italic: boolean;
  bold: boolean;
  opacity: number;
  showBg: boolean;
  bgColor: string;
}

export interface FlipCardConfig {
  frontTag: string;
  backTag: string;
  numberTag: string;
  frontBg1: string;
  frontBg2: string;
  frontGradientDir: string;
  backBg1: string;
  backBg2: string;
  backGradientDir: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  padding: number;
  flipHint: string;
}

export interface ExportSettings {
  placement: number[];
  markdownOnly: boolean;
  runOnEdit: boolean;
}

export interface FormatPromptCharacter {
  name: string;
  needDialog: boolean;
  needStatus: boolean;
}

export interface FormatPromptConfig {
  language: PromptLanguage;
  tone: PromptTone;
  placementSuggestion: PlacementSuggestion;
  characters: FormatPromptCharacter[];
  useFlipCard: boolean;
  paragraphSeparator: ParagraphSeparator;
  customSeparator: string;
  useFloorCounter: boolean;
  floorStartNumber: number;
}

export interface ScriptEntry {
  id: string;
  scriptName: string;
  findRegex: string;
  replaceString: string;
  trimStrings: string[];
  placement: number[];
  disabled: boolean;
  markdownOnly: boolean;
  promptOnly: boolean;
  runOnEdit: boolean;
  substituteRegex: boolean;
  minDepth: null;
  maxDepth: null;
}
