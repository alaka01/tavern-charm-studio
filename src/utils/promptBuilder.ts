import type {
  CharacterConfig,
  StatusPanelConfig,
  TextEffectRule,
  FlipCardConfig,
  FormatPromptConfig,
} from '@/types';

interface PromptContext {
  characters: CharacterConfig[];
  statusPanel: StatusPanelConfig;
  textEffects: TextEffectRule[];
  flipCard: FlipCardConfig;
  config: FormatPromptConfig;
}

interface PromptWarning {
  message: string;
  targetTab: string;
}

const L = (ctx: PromptContext, en: string, zh: string) => {
  if (ctx.config.language === 'zh') return zh;
  if (ctx.config.language === 'bilingual') return `${en}\n${zh}`;
  return en;
};

const emphasis = (ctx: PromptContext, word: string) => {
  if (ctx.config.tone === 'strict') return word.toUpperCase();
  return word;
};

function buildStructureSection(ctx: PromptContext): string {
  if (!ctx.config.useFlipCard) return '';
  const { frontTag, backTag, numberTag } = ctx.flipCard;

  const intro = ctx.config.tone === 'strict'
    ? L(ctx,
        `You ${emphasis(ctx, 'must')} ${emphasis(ctx, 'strictly')} follow this exact reply structure:`,
        `你必须严格按照以下结构回复：`)
    : L(ctx,
        `Please format your reply using this structure:`,
        `请按照以下结构来格式化你的回复：`);

  let structure = `<${frontTag}>\n(narrative content and dialogues here)\n</${frontTag}>\n<${backTag}>\n(status bar here)\n</${backTag}>`;
  if (ctx.config.useFloorCounter) {
    structure += `\n<${numberTag}>N</${numberTag}>`;
  }

  return `${intro}\n\n${structure}\n`;
}

function getTriggerDesc(char: CharacterConfig, ctx: PromptContext): string {
  switch (char.triggerFormat) {
    case 'braces_cn':
      return L(ctx,
        `Wrap ${char.name}'s speech in curly braces with a Chinese colon: {${char.name}："dialogue content"}`,
        `用花括号和中文冒号包裹${char.name}的对话：{${char.name}："对话内容"}`);
    case 'braces_en':
      return L(ctx,
        `Wrap ${char.name}'s speech in curly braces with an English colon: {${char.name}: "dialogue content"}`,
        `用花括号和英文冒号包裹${char.name}的对话：{${char.name}: "对话内容"}`);
    case 'japanese':
      return L(ctx,
        `${char.name}'s dialogue ${emphasis(ctx, 'must')} use this exact format — the character name and colon before the brackets are ${emphasis(ctx, 'mandatory')} and cannot be omitted:\n  ${char.name}：「dialogue content」\n\n  Wrong (forbidden): 「dialogue content」 (missing character name)\n  Wrong (forbidden): ${char.name}：dialogue content (missing brackets)`,
        `${char.name}的对话必须使用以下格式，角色名和冒号不可省略：\n  ${char.name}：「对话内容」\n\n  错误格式（禁止）：「对话内容」（缺少角色名）\n  错误格式（禁止）：${char.name}：对话内容（缺少书名号）`);
    case 'cn_quotes':
      return L(ctx,
        `${char.name}'s dialogue ${emphasis(ctx, 'must')} use this exact format — the character name and colon before the quotes are ${emphasis(ctx, 'mandatory')} and cannot be omitted:\n  ${char.name}：\u201cdialogue content\u201d\n\n  Wrong (forbidden): \u201cdialogue content\u201d (missing character name)`,
        `${char.name}的对话必须使用以下格式，角色名和冒号不可省略：\n  ${char.name}：\u201c对话内容\u201d\n\n  错误格式（禁止）：\u201c对话内容\u201d（缺少角色名）`);
    case 'custom':
      return L(ctx,
        `For ${char.name}'s speech, use custom format matching regex: ${char.customRegex}`,
        `${char.name}的对话使用自定义格式，对应正则：${char.customRegex}`);
  }
  return '';
}

function buildDialogSection(ctx: PromptContext): string {
  const dialogChars = ctx.config.characters.filter(c => c.needDialog);
  if (dialogChars.length === 0) return '';

  const charConfigs = new Map(ctx.characters.map(c => [c.name, c]));
  const lines: string[] = [];

  const heading = L(ctx, '## Dialogue Format', '## 对话格式');
  lines.push(heading);
  lines.push('');

  dialogChars.forEach(fc => {
    const cc = charConfigs.get(fc.name);
    if (cc) {
      lines.push(`- ${getTriggerDesc(cc, ctx)}`);
    } else {
      // Character only in format prompt, use default braces_cn
      lines.push(`- ${L(ctx,
        `Wrap ${fc.name}'s speech in curly braces: {${fc.name}："dialogue content"}`,
        `用花括号包裹${fc.name}的对话：{${fc.name}："对话内容"}`
      )}`);
    }
  });

  // Example
  const names = dialogChars.map(c => c.name);
  if (names.length >= 1) {
    lines.push('');
    lines.push(L(ctx, 'Example:', '示例：'));
    const n1 = names[0];
    const cc1 = charConfigs.get(n1);
    const fmt = cc1?.triggerFormat || 'braces_cn';
    if (fmt === 'braces_cn') {
      lines.push(`{${n1}："你好，很高兴认识你。"}`);
    } else if (fmt === 'japanese') {
      lines.push(`${n1}：「你好，很高兴认识你。」`);
    } else if (fmt === 'cn_quotes') {
      lines.push(`${n1}：\u201c你好，很高兴认识你。\u201d`);
    } else {
      lines.push(`{${n1}: "你好，很高兴认识你。"}`);
    }
  }

  return lines.join('\n') + '\n';
}

function getEffectDesc(rule: TextEffectRule, ctx: PromptContext): string {
  const patternLabels: Record<string, { en: string; zh: string; example: string }> = {
    asterisk: { en: 'asterisks', zh: '星号', example: '*内心想法*' },
    cn_parens: { en: 'Chinese parentheses', zh: '中文括号', example: '（场景描写）' },
    brackets: { en: 'square brackets', zh: '方括号', example: '[系统提示]' },
    strikethrough: { en: 'tildes for strikethrough', zh: '删除线标记', example: '~~删除内容~~' },
  };

  const p = patternLabels[rule.matchPattern];
  if (p) {
    return L(ctx,
      `Wrap ${rule.name} text in ${p.en}: ${p.example}`,
      `用${p.zh}包裹${rule.name}文本：${p.example}`);
  }
  return L(ctx,
    `For ${rule.name}, use custom pattern: ${rule.customRegex}`,
    `${rule.name}使用自定义格式：${rule.customRegex}`);
}

function buildTextEffectSection(ctx: PromptContext): string {
  if (ctx.textEffects.length === 0) return '';

  const lines: string[] = [];
  lines.push(L(ctx, '## Text Effect Formatting', '## 文字特效格式'));
  lines.push('');

  ctx.textEffects.forEach(rule => {
    if (rule.name) lines.push(`- ${getEffectDesc(rule, ctx)}`);
  });

  return lines.join('\n') + '\n';
}

function buildSeparatorSection(ctx: PromptContext): string {
  const sep = ctx.config.paragraphSeparator;
  if (sep === 'none') return '';

  let sepChar = '|';
  if (sep === 'hr') sepChar = '---';
  else if (sep === 'custom') sepChar = ctx.config.customSeparator || '|';

  return L(ctx,
    `## Paragraph Separator\nAdd a \`${sepChar}\` at the end of each paragraph to mark paragraph boundaries. Do ${emphasis(ctx, 'not')} add \`${sepChar}\` inside the status bar.\n`,
    `## 段落分隔符\n在每段末尾添加 \`${sepChar}\` 作为段落分隔标记。不要在状态栏内使用 \`${sepChar}\`。\n`);
}

function buildStatusSection(ctx: PromptContext): string {
  if (ctx.statusPanel.fields.length === 0) return '';

  const lines: string[] = [];
  lines.push(L(ctx,
    `## Status Bar Format\n\nGenerate a status bar at the end of ${emphasis(ctx, 'every')} reply. ${emphasis(ctx, 'Every')} field is mandatory and cannot be omitted. Use ${emphasis(ctx, 'exactly')} this format:`,
    `## 状态栏格式\n\n每次回复末尾必须生成状态栏。所有字段均为必填，不可省略。请严格使用以下格式：`));
  lines.push('');

  ctx.statusPanel.fields.forEach(f => {
    let example = 'XXX';
    if (f.type === 'progress') example = '75/100';
    lines.push(`${f.name}: ${example}`);
  });

  lines.push('');
  lines.push(L(ctx,
    `If a character is absent from the current scene, write "不在场" for their fields.`,
    `如果角色不在当前场景中，对应字段写"不在场"。`));

  return lines.join('\n') + '\n';
}

function buildFloorCounterSection(ctx: PromptContext): string {
  if (!ctx.config.useFloorCounter) return '';
  const tag = ctx.flipCard.numberTag;
  const start = ctx.config.floorStartNumber;

  return L(ctx,
    `## Floor Counter\nOutput a floor counter immediately after the status bar:\n<${tag}>N</${tag}>\nStart from ${start}, increment by 1 with each reply.\n`,
    `## 楼层计数器\n在状态栏后输出楼层计数：\n<${tag}>N</${tag}>\n从 ${start} 开始，每次回复递增 1。\n`);
}

function buildExampleSection(ctx: PromptContext): string {
  const lines: string[] = [];
  lines.push(L(ctx, '## Complete Reply Example', '## 完整回复示例'));
  lines.push('');

  const dialogChars = ctx.config.characters.filter(c => c.needDialog);
  const charConfigs = new Map(ctx.characters.map(c => [c.name, c]));

  const sep = ctx.config.paragraphSeparator;
  let sepStr = '';
  if (sep === 'pipe') sepStr = '|';
  else if (sep === 'hr') sepStr = '---';
  else if (sep === 'custom') sepStr = ctx.config.customSeparator || '';

  const addSep = (line: string) => sepStr ? `${line}${sepStr}` : line;

  // Wrap in flip card tags if enabled
  if (ctx.config.useFlipCard) {
    lines.push(`<${ctx.flipCard.frontTag}>`);
  }

  // Narrative
  const hasAsterisk = ctx.textEffects.some(r => r.matchPattern === 'asterisk');
  const hasCnParens = ctx.textEffects.some(r => r.matchPattern === 'cn_parens');

  lines.push(addSep('她缓步走进了房间，目光环顾四周。'));
  if (hasAsterisk) lines.push(addSep('*不知道他在不在……*'));

  // Dialogue examples
  if (dialogChars.length >= 1) {
    const n = dialogChars[0].name;
    const cc = charConfigs.get(n);
    const fmt = cc?.triggerFormat || 'braces_cn';
    if (fmt === 'braces_cn') lines.push(addSep(`{${n}："你好，好久不见了。"}`));
    else if (fmt === 'japanese') lines.push(addSep(`${n}：「你好，好久不见了。」`));
    else if (fmt === 'cn_quotes') lines.push(addSep(`${n}：\u201c你好，好久不见了。\u201d`));
    else lines.push(addSep(`{${n}: "你好，好久不见了。"}`));
  }

  if (hasCnParens) lines.push(addSep('（房间里弥漫着淡淡的花香。）'));

  if (dialogChars.length >= 2) {
    const n = dialogChars[1].name;
    const cc = charConfigs.get(n);
    const fmt = cc?.triggerFormat || 'braces_cn';
    if (fmt === 'braces_cn') lines.push(addSep(`{${n}："嗯，好久不见。坐吧。"}`));
    else if (fmt === 'japanese') lines.push(addSep(`${n}：「嗯，好久不见。坐吧。」`));
    else if (fmt === 'cn_quotes') lines.push(addSep(`${n}：\u201c嗯，好久不见。坐吧。\u201d`));
    else lines.push(addSep(`{${n}: "嗯，好久不见。坐吧。"}`));
  }

  if (ctx.config.useFlipCard) {
    lines.push(`</${ctx.flipCard.frontTag}>`);
    lines.push(`<${ctx.flipCard.backTag}>`);
  }

  // Status bar
  if (ctx.statusPanel.fields.length > 0) {
    const maxShow = 8;
    const fields = ctx.statusPanel.fields;
    const shown = fields.slice(0, maxShow);
    shown.forEach(f => {
      let val = '示例值';
      if (f.type === 'progress') val = '75/100';
      if (f.name === '时间') val = '2024年3月15日—14:30';
      else if (f.name === '地点') val = '客厅';
      else if (f.name === '服装') val = '白色连衣裙';
      else if (f.name === '心情') val = '平静';
      lines.push(`${f.name}: ${val}`);
    });
    if (fields.length > maxShow) {
      lines.push(`...（${L(ctx, `all ${fields.length} fields must be present`, `实际输出时所有 ${fields.length} 个字段必须完整`)}）`);
    }
  }

  if (ctx.config.useFlipCard) {
    lines.push(`</${ctx.flipCard.backTag}>`);
  }

  if (ctx.config.useFloorCounter) {
    lines.push(`<${ctx.flipCard.numberTag}>${ctx.config.floorStartNumber}</${ctx.flipCard.numberTag}>`);
  }

  return lines.join('\n') + '\n';
}

export function generateFormatPrompt(ctx: PromptContext): string {
  const sections: string[] = [];

  // Title
  const title = ctx.config.tone === 'strict'
    ? L(ctx, `# OUTPUT FORMAT REQUIREMENTS\n\nYou ${emphasis(ctx, 'must strictly')} follow ALL formatting rules below. Any deviation will be considered an error.`, 
           `# 输出格式要求\n\n你必须严格遵守以下所有格式规则。任何偏差都将被视为错误。`)
    : ctx.config.tone === 'gentle'
    ? L(ctx, `# Output Format Guide\n\nPlease follow these formatting guidelines for your responses:`,
           `# 输出格式指南\n\n请按照以下格式指南来组织你的回复：`)
    : L(ctx, `# Format Rules`, `# 格式规则`);

  sections.push(title);

  const structure = buildStructureSection(ctx);
  if (structure) sections.push(structure);

  const dialog = buildDialogSection(ctx);
  if (dialog) sections.push(dialog);

  const textEffect = buildTextEffectSection(ctx);
  if (textEffect) sections.push(textEffect);

  const separator = buildSeparatorSection(ctx);
  if (separator) sections.push(separator);

  const status = buildStatusSection(ctx);
  if (status) sections.push(status);

  const floorCounter = buildFloorCounterSection(ctx);
  if (floorCounter) sections.push(floorCounter);

  sections.push(buildExampleSection(ctx));

  return sections.join('\n');
}

export function detectWarnings(ctx: PromptContext): PromptWarning[] {
  const warnings: PromptWarning[] = [];

  // Characters with dialog bubbles but not in format prompt
  ctx.characters.forEach(c => {
    if (c.name && !ctx.config.characters.some(fc => fc.name === c.name)) {
      warnings.push({
        message: `角色"${c.name}"配置了对话气泡，但未出现在格式提示词的角色列表中`,
        targetTab: 'dialog',
      });
    }
  });

  // Field names with regex special chars
  ctx.statusPanel.fields.forEach(f => {
    if (/[.*+?^${}()|[\]\\]/.test(f.name)) {
      warnings.push({
        message: `状态栏字段"${f.name}"包含正则特殊字符，可能导致匹配异常`,
        targetTab: 'status',
      });
    }
  });

  // Flip card enabled but not in prompt
  if (ctx.config.useFlipCard === false && ctx.flipCard.frontTag) {
    // Not a warning if user intentionally disabled
  }

  // Text effects without format prompt coverage
  ctx.textEffects.forEach(rule => {
    if (rule.name && rule.matchPattern !== 'custom') {
      // These are covered automatically
    }
  });

  // Field names overlapping character names
  const charNames = new Set(ctx.characters.map(c => c.name));
  ctx.statusPanel.fields.forEach(f => {
    if (charNames.has(f.name)) {
      warnings.push({
        message: `状态栏字段名"${f.name}"与对话气泡角色名重复，可能导致正则误匹配`,
        targetTab: 'status',
      });
    }
  });

  return warnings;
}

export function estimateTokens(text: string): number {
  let tokens = 0;
  // Rough: CJK chars ~2 tokens each, English words ~1.3 tokens each
  const cjkMatch = text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g);
  const cjkCount = cjkMatch?.length || 0;
  tokens += cjkCount * 2;

  const nonCjk = text.replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g, '');
  const words = nonCjk.split(/\s+/).filter(Boolean);
  tokens += Math.round(words.length * 1.3);

  return tokens;
}
