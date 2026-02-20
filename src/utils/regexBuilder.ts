import type { CharacterConfig, StatusPanelConfig, TextEffectRule, FlipCardConfig, ExportSettings, ScriptEntry, GroupConfig } from '@/types';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

function buildAvatarHtml(char: CharacterConfig): string {
  if (char.avatarMode === 'none') return '';
  if (char.avatarMode === 'emoji') {
    return `<span style="font-size:16px;margin-right:4px">${char.avatarEmoji}</span>`;
  }
  // 'initial' mode - color based on name hash
  const isNameCapturing = char.triggerFormat === 'japanese' || char.triggerFormat === 'cn_quotes';
  if (isNameCapturing) {
    // Can't hash dynamic name, use theme color
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${char.themeColor};color:#000;font-size:11px;font-weight:bold;margin-right:4px">?</span>`;
  }
  const color = hashColor(char.name);
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${color};color:#000;font-size:11px;font-weight:bold;margin-right:4px">${char.name.charAt(0)}</span>`;
}

function buildBubbleHtml(char: CharacterConfig, nameDisplay: string, contentRef: string): string {
  const avatar = buildAvatarHtml(char);

  if (char.bubblePreset === 'line') {
    // 简约竖线风
    return `<div style="margin:4px 0;padding:10px 14px;background:rgba(255,255,255,0.06);border-left:3px solid ${char.themeColor};border-radius:2px 8px 8px 2px"><div style="font-size:13px;font-weight:600;color:${char.themeColor};margin-bottom:4px">${avatar}${nameDisplay}</div><div style="font-size:15px;line-height:1.7;color:rgba(255,255,255,0.9)">${contentRef}</div></div>`;
  }

  if (char.bubblePreset === 'quote') {
    // 引用块风
    return `<div style="margin:4px 0;padding:8px 12px;border-left:4px solid ${char.themeColor};color:rgba(255,255,255,0.85)"><div style="font-size:12px;font-weight:600;color:${char.themeColor};margin-bottom:2px">${avatar}${nameDisplay}</div><div style="font-size:15px;line-height:1.7">${contentRef}</div></div>`;
  }

  // 'card' preset - classic bubble with full customization
  let bg = char.bubbleBgColor;
  if (char.useGradient) {
    bg = `linear-gradient(${char.gradientDirection}, ${char.bubbleBgColor}, ${char.gradientColor2})`;
  }
  const bubbleStyle = [
    `background:${bg}`,
    `border-radius:${char.borderRadius}px`,
    `padding:${char.padding}px`,
    `max-width:${char.maxWidth}%`,
    `margin:4px 0`,
    `word-wrap:break-word`,
    `overflow:hidden`,
    char.showBorder ? `border:1px solid ${char.borderColor}` : '',
    char.showShadow ? `box-shadow:0 2px ${char.shadowBlur}px ${char.shadowColor}` : '',
    char.align === 'right' ? 'margin-left:auto' : char.align === 'center' ? 'margin:4px auto' : '',
  ].filter(Boolean).join(';');
  const nameStyle = `color:${char.themeColor};font-size:${char.nameFontSize}px;${char.nameBold ? 'font-weight:bold;' : ''}margin-bottom:4px;display:flex;align-items:center;gap:4px`;
  const textStyle = `color:${char.textColor};font-size:${char.textFontSize}px;line-height:${char.lineHeight}`;
  return `<div style="${bubbleStyle}"><div style="${nameStyle}">${avatar}${nameDisplay}</div><div style="${textStyle}">${contentRef}</div></div>`;
}

export function buildDialogScript(char: CharacterConfig, settings: ExportSettings): ScriptEntry {
  let findRegex: string;
  const name = escapeRegex(char.name);

  switch (char.triggerFormat) {
    case 'braces_cn':
      findRegex = `/\\{${name}[：:]\\s*([^}]*)\\}/g`;
      break;
    case 'braces_en':
      findRegex = `/\\{${name}:\\s*([^}]*)\\}/g`;
      break;
    case 'japanese':
      findRegex = `/([^|>\\n]+?)[：:]\\s*「([^」]*)」/g`;
      break;
    case 'cn_quotes':
      findRegex = `/([^|>\\n]+?)[：:]\\s*\u201c([^\u201d]*)\u201d/g`;
      break;
    case 'custom':
      findRegex = char.customRegex || '/(?:)/g';
      break;
    default:
      findRegex = `/\\{${name}[：:]\\s*([^}]*)\\}/g`;
  }

  const isNameCapturing = char.triggerFormat === 'japanese' || char.triggerFormat === 'cn_quotes';
  const nameDisplay = isNameCapturing ? '$1' : char.name;
  const contentRef = isNameCapturing ? '$2' : '$1';

  const replaceString = buildBubbleHtml(char, nameDisplay, contentRef);

  return {
    id: crypto.randomUUID(),
    scriptName: `${char.name}对话框`,
    findRegex,
    replaceString,
    trimStrings: [],
    placement: [...settings.placement],
    disabled: false,
    markdownOnly: settings.markdownOnly,
    promptOnly: false,
    runOnEdit: settings.runOnEdit,
    substituteRegex: true,
    minDepth: null,
    maxDepth: null,
  };
}

function getGroupCols(config: StatusPanelConfig, groupName: string): number {
  const gc = config.groupConfigs?.[groupName];
  if (gc && gc.columns > 0) return gc.columns;
  return config.columns;
}

function getGroupLayout(config: StatusPanelConfig, groupName: string): string {
  return config.groupConfigs?.[groupName]?.layout || 'grid';
}

function getGroupBorder(config: StatusPanelConfig, groupName: string): boolean {
  const gc = config.groupConfigs?.[groupName];
  return gc?.showBorder ?? true;
}

export function buildStatusScript(config: StatusPanelConfig, settings: ExportSettings): ScriptEntry | null {
  const fields = config.fields;
  if (fields.length === 0) return null;

  const regexParts = fields.map((f, i) => {
    const escaped = escapeRegex(f.name);
    if (i < fields.length - 1) {
      return `${escaped}:\\s*(.*?)\\s*`;
    }
    return `${escaped}:\\s*(.*?)(?=\\s*$)`;
  });
  const findRegex = `/${regexParts.join('')}/gm`;

  // Build ordered groups
  const groupFieldsMap = new Map<string, typeof fields>();
  fields.forEach(f => {
    if (!groupFieldsMap.has(f.group)) groupFieldsMap.set(f.group, []);
    groupFieldsMap.get(f.group)!.push(f);
  });

  // Use groupOrder if available
  const orderedGroups: [string, typeof fields][] = [];
  const order = config.groupOrder || [];
  order.forEach(g => {
    if (groupFieldsMap.has(g)) {
      orderedGroups.push([g, groupFieldsMap.get(g)!]);
      groupFieldsMap.delete(g);
    }
  });
  groupFieldsMap.forEach((gFields, g) => orderedGroups.push([g, gFields]));

  let fieldIndex = 0;
  let contentHtml = '';
  const totalGroups = orderedGroups.length;

  orderedGroups.forEach(([groupName, groupFields], groupIdx) => {
    const cols = getGroupCols(config, groupName);
    const layout = getGroupLayout(config, groupName);
    const showBorder = getGroupBorder(config, groupName);
    const isLast = groupIdx === totalGroups - 1;

    if (config.showGroupTitle) {
      contentHtml += `<div style="width:100%;font-weight:600;font-size:14px;padding:6px 8px;margin:4px 0;border-bottom:1px solid rgba(255,255,255,0.15);color:${config.labelColor}">${groupName}</div>`;
    }

    if (layout === 'label') {
      // Left-right label style
      contentHtml += `<div style="width:100%;padding:2px 0">`;
      groupFields.forEach(f => {
        fieldIndex++;
        let valueDisplay = `<span style="color:${config.valueColor};font-size:14px">$${fieldIndex}</span>`;
        if (f.type === 'badge') {
          valueDisplay = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${config.valueColor}33;color:${config.valueColor};font-size:12px">$${fieldIndex}</span>`;
        }
        contentHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px"><span style="color:${config.labelColor};font-size:13px">${f.name}</span>${valueDisplay}</div>`;
      });
      contentHtml += '</div>';
    } else if (layout === 'compact') {
      // Inline tags
      contentHtml += `<div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px">`;
      groupFields.forEach(f => {
        fieldIndex++;
        contentHtml += `<span style="display:inline-block;padding:3px 10px;border-radius:12px;background:${config.valueColor}22;color:${config.valueColor};font-size:12px">${f.name}: $${fieldIndex}</span>`;
      });
      contentHtml += '</div>';
    } else if (layout === 'highlight') {
      // Single field highlight (KPI card)
      groupFields.forEach(f => {
        fieldIndex++;
        contentHtml += `<div style="text-align:center;padding:8px"><div style="color:${config.labelColor};font-size:12px;margin-bottom:4px">${f.name}</div><div style="color:${config.valueColor};font-size:22px;font-weight:bold">$${fieldIndex}</div></div>`;
      });
    } else {
      // Grid layout (default)
      contentHtml += `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;width:100%">`;
      groupFields.forEach(f => {
        fieldIndex++;
        let valueDisplay: string;
        if (f.type === 'badge') {
          valueDisplay = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${config.valueColor}33;color:${config.valueColor};font-size:12px">$${fieldIndex}</span>`;
        } else if (f.type === 'progress') {
          valueDisplay = `<div style="width:100%;height:8px;border-radius:4px;background:rgba(255,255,255,0.1)"><div style="height:100%;border-radius:4px;background:${config.valueColor};width:50%"></div></div><span style="color:${config.valueColor};font-size:12px">$${fieldIndex}</span>`;
        } else {
          valueDisplay = `<span style="color:${config.valueColor};font-size:14px">$${fieldIndex}</span>`;
        }
        contentHtml += `<div style="padding:4px 8px;text-align:center"><div style="color:${config.labelColor};font-size:12px;margin-bottom:2px">${f.name}</div>${valueDisplay}</div>`;
      });
      contentHtml += '</div>';
    }

    // Add separator between groups
    if (!isLast && showBorder) {
      contentHtml += `<div style="width:100%;border-bottom:1px solid rgba(255,255,255,0.15);margin:4px 0"></div>`;
    }
  });

  const panelStyle = [
    `width:100%`,
    `padding:8px`,
    `background:${config.bgColor}`,
    `border-radius:${config.borderRadius}px`,
    config.showBorder ? `border:1px solid ${config.borderColor}` : '',
    `color:${config.labelColor}`,
  ].filter(Boolean).join(';');

  const replaceString = `<div style="${panelStyle}"><div style="font-weight:bold;font-size:18px;text-align:center;padding:4px;margin-bottom:8px">${config.title}</div>${contentHtml}</div>`;

  return {
    id: crypto.randomUUID(),
    scriptName: `${config.title}状态面板`,
    findRegex,
    replaceString,
    trimStrings: [],
    placement: [...settings.placement],
    disabled: false,
    markdownOnly: settings.markdownOnly,
    promptOnly: false,
    runOnEdit: settings.runOnEdit,
    substituteRegex: true,
    minDepth: null,
    maxDepth: null,
  };
}

export function buildTextEffectScript(rule: TextEffectRule, settings: ExportSettings): ScriptEntry {
  const patterns: Record<string, string> = {
    asterisk: '/\\*(.*?)\\*/gm',
    cn_parens: '/（(.*?)）/gm',
    brackets: '/\\[(.*?)\\]/gm',
    strikethrough: '/~~(.*?)~~/gm',
  };

  const findRegex = rule.matchPattern === 'custom' ? (rule.customRegex || '/(?:)/g') : patterns[rule.matchPattern];

  const styles = [
    `color:${rule.color}`,
    `font-size:${rule.fontSize}px`,
    `opacity:${rule.opacity}`,
    rule.italic ? 'font-style:italic' : '',
    rule.bold ? 'font-weight:bold' : '',
    rule.showBg ? `background:${rule.bgColor};padding:2px 4px;border-radius:3px` : '',
  ].filter(Boolean).join(';');

  return {
    id: crypto.randomUUID(),
    scriptName: rule.name,
    findRegex,
    replaceString: `<span style="${styles}">$1</span>`,
    trimStrings: [],
    placement: [...settings.placement],
    disabled: false,
    markdownOnly: settings.markdownOnly,
    promptOnly: false,
    runOnEdit: settings.runOnEdit,
    substituteRegex: true,
    minDepth: null,
    maxDepth: null,
  };
}

export function buildSeparatorScript(separator: string, customSeparator: string, settings: ExportSettings): ScriptEntry | null {
  let sepChar = '';
  if (separator === 'pipe') sepChar = '|';
  else if (separator === 'custom') sepChar = customSeparator;
  else return null;

  if (!sepChar) return null;

  const escapedSep = escapeRegex(sepChar);
  return {
    id: crypto.randomUUID(),
    scriptName: '段落分隔符',
    findRegex: `/${escapedSep}/g`,
    replaceString: '<br><hr style="width:100%;border:none;border-top:1px solid rgba(255,255,255,0.15);margin:8px 0;">',
    trimStrings: [],
    placement: [...settings.placement],
    disabled: false,
    markdownOnly: settings.markdownOnly,
    promptOnly: false,
    runOnEdit: settings.runOnEdit,
    substituteRegex: true,
    minDepth: null,
    maxDepth: null,
  };
}

export function buildFlipCardScript(config: FlipCardConfig, settings: ExportSettings): ScriptEntry {
  const ft = escapeRegex(config.frontTag);
  const bt = escapeRegex(config.backTag);
  const nt = escapeRegex(config.numberTag);

  const findRegex = `/<${ft}>([\\s\\S]*?)<\\/${ft}>\\s*<${bt}>([\\s\\S]*?)<\\/${bt}>\\s*<${nt}>([\\s\\S]*?)<\\/${nt}>/`;

  const t = config.typography;
  const typoStyles = [
    `font-family:${t.fontFamily}`,
    `font-size:${t.fontSize}px`,
    `line-height:${t.lineHeight}`,
    `letter-spacing:${t.letterSpacing}px`,
    `color:${t.textColor}`,
    `word-break:break-word`,
    t.textAlign !== 'left' ? `text-align:${t.textAlign}` : '',
    t.textIndent ? `text-indent:${t.textIndentSize}em` : '',
    t.textShadow ? `text-shadow:0 0 ${t.textShadowBlur}px ${t.textShadowColor}` : '',
    `padding:${t.containerPadding}px ${t.containerPadding + 4}px`,
  ].filter(Boolean).join(';');

  const borderStyle = config.cardBorder ? `border:1px solid ${config.cardBorderColor};` : '';
  const frontStyle = `width:100%;justify-content:center;align-items:center;word-wrap:break-word;border-radius:${config.borderRadius}px;cursor:pointer;${borderStyle}`;
  const frontBg = `background:${t.frontBg}`;
  const backBg = `background:${t.backBg}`;

  const hintStyle = 'text-align:center;font-size:11px;opacity:0.35;margin-top:14px';
  const hintFront = config.flipHint
    ? `<div style="${hintStyle}">${config.flipHint}</div>`
    : '';
  const hintBack = config.flipHintBack
    ? `<div style="${hintStyle}">${config.flipHintBack}</div>`
    : '';

  const replaceString = `<style>.radio{display:none}.f1$3,.f2$3{display:flex;${frontStyle}}.f1$3{${frontBg}}.f2$3{${backBg}}.r1$3:checked~.f1$3{display:flex}.r1$3:checked~.f2$3{display:none}.r2$3:checked~.f1$3{display:none}.r2$3:checked~.f2$3{display:flex}</style><div><input type="radio" id="R1$3" name="o$3" class="radio r1$3" checked><input type="radio" id="R2$3" name="o$3" class="radio r2$3"><div class="f1$3"><label for="R2$3" style="width:100%;cursor:pointer"><div style="${typoStyles}">$1${hintFront}</div></label></div><div class="f2$3"><label for="R1$3" style="width:100%;cursor:pointer"><div style="padding:${t.containerPadding}px ${t.containerPadding + 4}px">$2${hintBack}</div></label></div></div>`;

  return {
    id: crypto.randomUUID(),
    scriptName: '翻页卡片',
    findRegex,
    replaceString,
    trimStrings: [],
    placement: [...settings.placement],
    disabled: false,
    markdownOnly: settings.markdownOnly,
    promptOnly: false,
    runOnEdit: false,
    substituteRegex: false,
    minDepth: null,
    maxDepth: null,
  };
}
