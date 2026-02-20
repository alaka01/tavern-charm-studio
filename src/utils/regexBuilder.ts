import type { CharacterConfig, StatusPanelConfig, TextEffectRule, FlipCardConfig, ExportSettings, ScriptEntry } from '@/types';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const uid = char.id.slice(0, 8);
  let bg = char.bubbleBgColor;
  if (char.useGradient) {
    bg = `linear-gradient(${char.gradientDirection}, ${char.bubbleBgColor}, ${char.gradientColor2})`;
  }

  const bubbleStyle = [
    `font-family: Arial, sans-serif`,
    `background: ${bg}`,
    `border-radius: ${char.borderRadius}px`,
    `padding: ${char.padding}px`,
    `max-width: ${char.maxWidth}%`,
    `margin-bottom: 8px`,
    `word-wrap: break-word`,
    `overflow: hidden`,
    char.showBorder ? `border: 1px solid ${char.borderColor}` : '',
    char.showShadow ? `box-shadow: 0 2px ${char.shadowBlur}px ${char.shadowColor}` : '',
    char.align === 'right' ? 'margin-left: auto' : char.align === 'center' ? 'margin: 0 auto 8px' : '',
  ].filter(Boolean).join('; ');

  const nameStyle = [
    `color: ${char.nameColor}`,
    `font-size: ${char.nameFontSize}px`,
    char.nameBold ? 'font-weight: bold' : '',
    'margin-bottom: 4px',
    'display: flex',
    'align-items: center',
    'gap: 6px',
  ].filter(Boolean).join('; ');

  const textStyle = [
    `color: ${char.textColor}`,
    `font-size: ${char.textFontSize}px`,
    `line-height: ${char.lineHeight}`,
  ].join('; ');

  const avatarHtml = char.showAvatar
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${char.nameColor};color:#000;font-size:12px;font-weight:bold">${char.name.charAt(0)}</span>`
    : '';

  // For japanese/cn_quotes, $1 is char name, $2 is content; for others $1 is content
  const isNameCapturing = char.triggerFormat === 'japanese' || char.triggerFormat === 'cn_quotes';
  const nameDisplay = isNameCapturing ? '$1' : char.name;
  const contentRef = isNameCapturing ? '$2' : '$1';
  const replaceString = `<div style="${bubbleStyle}"><div style="${nameStyle}">${avatarHtml}${nameDisplay}</div><div style="${textStyle}">${contentRef}</div></div>`;

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

  // Build HTML
  const groups = new Map<string, typeof fields>();
  fields.forEach(f => {
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group)!.push(f);
  });

  let fieldIndex = 0;
  let contentHtml = '';

  groups.forEach((groupFields, groupName) => {
    if (config.showGroupTitle) {
      contentHtml += `<div style="width:100%;font-weight:bold;padding:4px 8px;margin:4px 0;border-bottom:1px solid ${config.borderColor};color:${config.labelColor}">${groupName}</div>`;
    }
    contentHtml += `<div style="display:grid;grid-template-columns:repeat(${config.columns},1fr);gap:4px;width:100%">`;
    groupFields.forEach(f => {
      fieldIndex++;
      let valueDisplay: string;
      if (f.type === 'badge') {
        valueDisplay = `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${config.valueColor}33;color:${config.valueColor};font-size:12px">$${fieldIndex}</span>`;
      } else if (f.type === 'progress') {
        valueDisplay = `<div style="width:100%;height:8px;border-radius:4px;background:rgba(255,255,255,0.1)"><div style="height:100%;border-radius:4px;background:${config.valueColor};width:50%"></div></div><span style="color:${config.valueColor};font-size:12px">$${fieldIndex}</span>`;
      } else {
        valueDisplay = `<span style="color:${config.valueColor};font-size:14px;text-shadow:1px 1px 2px rgba(0,0,0,0.5)">$${fieldIndex}</span>`;
      }
      contentHtml += `<div style="padding:4px 8px;text-align:center"><div style="color:${config.labelColor};font-size:12px;margin-bottom:2px">${f.name}</div>${valueDisplay}</div>`;
    });
    contentHtml += '</div>';
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
  else return null; // 'hr' and 'none' don't need a script

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

  const layoutStyle = `width:100%;justify-content:center;align-items:center;word-wrap:break-word;font-size:${config.fontSize}px;color:${config.textColor};padding:${config.padding}px;border-radius:${config.borderRadius}px;cursor:pointer`;
  const frontBg = `background:linear-gradient(${config.frontGradientDir},${config.frontBg1},${config.frontBg2})`;
  const backBg = `background:linear-gradient(${config.backGradientDir},${config.backBg1},${config.backBg2})`;

  const hint = config.flipHint
    ? `<div style="text-align:center;font-size:12px;opacity:0.5;margin-top:8px">${config.flipHint}</div>`
    : '';

  const replaceString = `<style>.radio{display:none}.f1$3,.f2$3{display:flex;${layoutStyle}}.f1$3{${frontBg}}.f2$3{${backBg};display:none}.r1$3:checked~.f1$3{display:flex}.r1$3:checked~.f2$3{display:none}.r2$3:checked~.f1$3{display:none}.r2$3:checked~.f2$3{display:flex}</style><div><input type="radio" id="R1$3" name="o$3" class="radio r1$3" checked><input type="radio" id="R2$3" name="o$3" class="radio r2$3"><div class="f1$3"><label for="R2$3" style="width:100%;cursor:pointer"><div style="padding:8px;font-weight:bold">$1${hint}</div></label></div><div class="f2$3"><label for="R1$3" style="width:100%;cursor:pointer"><div style="padding:8px;font-weight:bold">$2${hint}</div></label></div></div>`;

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
