import { useState } from 'react';
import { X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { DEFAULT_SAMPLE_VALUES } from '@/components/tabs/StatusPanelTab';
import type { StatusField, CharacterConfig, TextEffectRule, StatusPanelConfig, FlipCardConfig } from '@/types';

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
}

function renderAvatar(c: CharacterConfig) {
  if (c.avatarMode === 'emoji') return <span style={{ fontSize: 16, marginRight: 4 }}>{c.avatarEmoji}</span>;
  if (c.avatarMode === 'initial') {
    const color = hashColor(c.name);
    return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: color, color: '#000', fontSize: 11, fontWeight: 'bold', marginRight: 4 }}>{c.name.charAt(0)}</span>;
  }
  return null;
}

function renderBubble(c: CharacterConfig, text: React.ReactNode, key: number) {
  if (c.bubblePreset === 'line') {
    return (
      <div key={key} style={{ margin: '4px 0', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${c.themeColor}`, borderRadius: '2px 8px 8px 2px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.themeColor, marginBottom: 4, display: 'flex', alignItems: 'center' }}>{renderAvatar(c)}{c.name}</div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>{text}</div>
      </div>
    );
  }
  if (c.bubblePreset === 'quote') {
    return (
      <div key={key} style={{ margin: '4px 0', padding: '8px 12px', borderLeft: `4px solid ${c.themeColor}`, color: 'rgba(255,255,255,0.85)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.themeColor, marginBottom: 2, display: 'flex', alignItems: 'center' }}>{renderAvatar(c)}{c.name}</div>
        <div style={{ fontSize: 15, lineHeight: 1.7 }}>{text}</div>
      </div>
    );
  }
  // card
  const bg = c.useGradient ? `linear-gradient(${c.gradientDirection}, ${c.bubbleBgColor}, ${c.gradientColor2})` : c.bubbleBgColor;
  return (
    <div key={key} style={{ display: 'flex', justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start' }}>
      <div style={{ background: bg, borderRadius: c.borderRadius, padding: c.padding, maxWidth: `${c.maxWidth}%`, margin: '4px 0', border: c.showBorder ? `1px solid ${c.borderColor}` : 'none', boxShadow: c.showShadow ? `0 2px ${c.shadowBlur}px ${c.shadowColor}` : 'none' }}>
        <div style={{ color: c.themeColor, fontSize: c.nameFontSize, fontWeight: c.nameBold ? 'bold' : 'normal', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>{renderAvatar(c)}{c.name}</div>
        <div style={{ color: c.textColor, fontSize: c.textFontSize, lineHeight: c.lineHeight }}>{text}</div>
      </div>
    </div>
  );
}

function applyTextEffects(text: string, effects: TextEffectRule[]): string {
  let result = text;
  effects.forEach(rule => {
    let regex: RegExp | null = null;
    try {
      switch (rule.matchPattern) {
        case 'asterisk': regex = /\*(.*?)\*/gm; break;
        case 'cn_parens': regex = /（(.*?)）/gm; break;
        case 'brackets': regex = /\[(.*?)\]/gm; break;
        case 'strikethrough': regex = /~~(.*?)~~/gm; break;
        case 'custom': {
          if (rule.customRegex) {
            const m = rule.customRegex.match(/^\/(.+)\/([gimsuy]*)$/);
            if (m) regex = new RegExp(m[1], m[2]);
          }
          break;
        }
      }
    } catch { /* skip */ }
    if (regex) {
      result = result.replace(regex, (_m, g1) => {
        const styles = [
          `color:${rule.color}`, `font-size:${rule.fontSize}px`, `opacity:${rule.opacity}`,
          rule.italic ? 'font-style:italic' : '', rule.bold ? 'font-weight:bold' : '',
          rule.showBg ? `background:${rule.bgColor};padding:2px 4px;border-radius:3px` : '',
        ].filter(Boolean).join(';');
        return `<span style="${styles}">${g1}</span>`;
      });
    }
  });
  return result;
}

function renderSeparator(separator: string, custom: string) {
  if (separator === 'none') return null;
  return <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '8px 0' }} />;
}

function StatusPanelPreview({ config }: { config: StatusPanelConfig }) {
  const groupFieldsMap = new Map<string, StatusField[]>();
  config.fields.forEach(f => {
    if (!groupFieldsMap.has(f.group)) groupFieldsMap.set(f.group, []);
    groupFieldsMap.get(f.group)!.push(f);
  });
  const orderedGroups: [string, StatusField[]][] = [];
  (config.groupOrder || []).forEach(g => {
    if (groupFieldsMap.has(g)) { orderedGroups.push([g, groupFieldsMap.get(g)!]); groupFieldsMap.delete(g); }
  });
  groupFieldsMap.forEach((gf, g) => orderedGroups.push([g, gf]));

  return (
    <div style={{ background: config.bgColor, borderRadius: config.borderRadius, border: config.showBorder ? `1px solid ${config.borderColor}` : 'none', padding: 12, color: config.labelColor }}>
      <div style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 12 }}>{config.title}</div>
      {orderedGroups.map(([gName, gFields], gi) => {
        const gc = config.groupConfigs[gName] || { columns: 0, layout: 'grid', showBorder: true };
        const cols = gc.columns > 0 ? gc.columns : config.columns;
        const isLast = gi === orderedGroups.length - 1;
        return (
          <div key={gName} style={{ marginBottom: isLast ? 0 : 4 }}>
            {config.showGroupTitle && <div style={{ fontWeight: 600, fontSize: 14, padding: '6px 8px', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', color: config.labelColor }}>{gName}</div>}
            {gc.layout === 'label' ? (
              <div style={{ padding: '2px 0' }}>
                {gFields.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
                    <span style={{ color: config.labelColor, fontSize: 13 }}>{f.name}</span>
                    <span style={{ color: config.valueColor, fontSize: 14 }}>{DEFAULT_SAMPLE_VALUES[f.name] || '示例值'}</span>
                  </div>
                ))}
              </div>
            ) : gc.layout === 'compact' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 8px' }}>
                {gFields.map(f => (
                  <span key={f.id} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: config.valueColor + '22', color: config.valueColor, fontSize: 12 }}>{f.name}: {DEFAULT_SAMPLE_VALUES[f.name] || '示例值'}</span>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
                {gFields.map(f => (
                  <div key={f.id} style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: config.labelColor, marginBottom: 2 }}>{f.name}</div>
                    {f.type === 'progress' ? (
                      <div>
                        <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                          <div style={{ width: '60%', height: '100%', borderRadius: 3, background: config.valueColor }} />
                        </div>
                        <span style={{ color: config.valueColor, fontSize: 11 }}>60%</span>
                      </div>
                    ) : f.type === 'badge' ? (
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: config.valueColor + '33', color: config.valueColor, fontSize: 12 }}>{DEFAULT_SAMPLE_VALUES[f.name] || '示例值'}</span>
                    ) : (
                      <span style={{ color: config.valueColor, fontSize: 14 }}>{DEFAULT_SAMPLE_VALUES[f.name] || '示例值'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!isLast && gc.showBorder && <div style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.15)', margin: '4px 0' }} />}
          </div>
        );
      })}
    </div>
  );
}

export const FullPreviewOverlay = () => {
  const [open, setOpen] = useState(false);
  const [showFront, setShowFront] = useState(true);
  const { characters, statusPanel, textEffects, flipCard, formatPrompt } = useAppStore();

  const char0 = characters[0] || { name: '角色名' } as CharacterConfig;
  const charName = char0.name || '角色名';

  // Build sample dialog content with text effects applied
  const narrativeLines = [
    { type: 'dialog' as const, char: char0, text: `欢迎来到这个世界。` },
    { type: 'narration' as const, text: `*她微微一笑，目光温柔地注视着你*` },
    { type: 'user' as const, text: `你好，很高兴见到你。` },
    { type: 'narration' as const, text: `（周围传来轻柔的音乐声）` },
    { type: 'dialog' as const, char: char0, text: `让我带你四处看看吧。` },
  ];

  const typo = flipCard.typography;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        title="完整预览"
      >
        <Eye size={16} />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: '#1a1c2e' }}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center text-xs text-muted-foreground mb-4">完整预览 · 模拟 SillyTavern 显示效果 · 点击卡片翻面</div>

          <motion.div
            onClick={() => setShowFront(!showFront)}
            style={{
              background: showFront ? typo.frontBg : typo.backBg,
              borderRadius: flipCard.borderRadius,
              border: flipCard.cardBorder ? `1px solid ${flipCard.cardBorderColor}` : undefined,
              cursor: 'pointer',
              minHeight: 300,
            }}
          >
            {showFront ? (
              <div style={{
                fontFamily: typo.fontFamily, fontSize: typo.fontSize, lineHeight: typo.lineHeight,
                letterSpacing: typo.letterSpacing, color: typo.textColor, wordBreak: 'break-word',
                textAlign: typo.textAlign as any,
                textIndent: typo.textIndent ? `${typo.textIndentSize}em` : undefined,
                textShadow: typo.textShadow ? `0 0 ${typo.textShadowBlur}px ${typo.textShadowColor}` : undefined,
                padding: `${typo.containerPadding}px ${typo.containerPadding + 4}px`,
              }}>
                {narrativeLines.map((line, i) => {
                  if (line.type === 'dialog' && line.char) {
                    return (
                      <div key={i} style={{ marginBottom: typo.paragraphSpacing }}>
                        {renderBubble(line.char, line.text, i)}
                      </div>
                    );
                  }
                  if (line.type === 'user') {
                    // Render user dialog as simple text or with second character if available
                    const userChar = characters[1] || { ...char0, name: '你', themeColor: '#38bdf8', bubblePreset: char0.bubblePreset } as CharacterConfig;
                    return (
                      <div key={i} style={{ marginBottom: typo.paragraphSpacing }}>
                        {renderBubble(userChar, line.text, i)}
                      </div>
                    );
                  }
                  // narration - apply text effects
                  const html = applyTextEffects(line.text, textEffects);
                  return (
                    <div key={i} style={{ marginBottom: typo.paragraphSpacing }}>
                      <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                  );
                })}

                {/* Separator between dialog sections */}
                {formatPrompt.paragraphSeparator !== 'none' && renderSeparator(formatPrompt.paragraphSeparator, formatPrompt.customSeparator)}

                {flipCard.flipHint && (
                  <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.35, marginTop: 14 }}>{flipCard.flipHint}</div>
                )}
              </div>
            ) : (
              <div style={{ padding: `${typo.containerPadding}px ${typo.containerPadding + 4}px` }}>
                <StatusPanelPreview config={statusPanel} />
                {flipCard.flipHintBack && (
                  <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.35, marginTop: 14 }}>{flipCard.flipHintBack}</div>
                )}
              </div>
            )}
          </motion.div>

          <div className="text-center text-xs text-muted-foreground mt-4">
            当前显示：{showFront ? '正面（对话内容）' : '背面（状态面板）'} · 点击切换
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
