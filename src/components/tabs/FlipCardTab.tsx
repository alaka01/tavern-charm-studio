import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppStore, TYPOGRAPHY_PRESETS } from '@/stores/useAppStore';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { SliderWithLabel } from '@/components/shared/SliderWithLabel';
import type { TypographyPreset, TypographyConfig } from '@/types';

const PRESET_META: { key: Exclude<TypographyPreset, 'custom'>; name: string; desc: string }[] = [
  { key: 'claude', name: 'Claude 风', desc: '宽松舒适，适合长文' },
  { key: 'novel', name: '小说风', desc: '首行缩进，文学质感' },
  { key: 'lightweight', name: '轻量简洁', desc: '最小改动，基础优化' },
  { key: 'cyber', name: '赛博霓虹', desc: '科幻辉光，终端氛围' },
];

const PREVIEW_TEXT = `她推开那扇斑驳的木门，昏暗的走廊里弥漫着旧书和干燥木头的气味。墙壁上的烛火摇曳不定，在石壁上投下忽长忽短的影子，像是什么活物在蠕动。

*这个地方比想象中还要阴沉。如果不是那封信，我绝不会踏进这里半步。*

她的脚步在地板上发出轻微的吱呀声。走廊尽头有一扇半掩的门，从门缝中透出一线暖黄色的光。

Seraphina：「你终于来了。我等了你很久。」

声音从光线的方向传来，低沉而平稳，像是被壁炉的热度烘暖过的。`;

function getTypographyStyle(t: TypographyConfig): React.CSSProperties {
  return {
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    color: t.textColor,
    wordBreak: 'break-word' as const,
    textAlign: t.textAlign as any,
    textIndent: t.textIndent ? `${t.textIndentSize}em` : undefined,
    textShadow: t.textShadow ? `0 0 ${t.textShadowBlur}px ${t.textShadowColor}` : undefined,
    padding: `${t.containerPadding}px ${t.containerPadding + 4}px`,
  };
}

// Mini preview lines for preset cards — show bg + text color
function PresetMiniPreview({ preset }: { preset: TypographyConfig }) {
  const indent = preset.textIndent;
  const gap = Math.max(2, preset.paragraphSpacing / 3);
  const lineColor = preset.textColor.replace(/[\d.]+\)$/, '0.35)').replace('#', '');
  const bgIsHex = preset.frontBg.startsWith('#');
  const barColor = bgIsHex ? preset.textColor.replace(/[\d.]+\)$/, '0.3)') : 'rgba(255,255,255,0.2)';
  return (
    <div
      className="mt-2 rounded p-1.5"
      style={{
        background: preset.frontBg === 'transparent' ? 'rgba(255,255,255,0.04)' : preset.frontBg,
        lineHeight: preset.lineHeight * 0.6,
      }}
    >
      {[0, 1, 2].map(i => (
        <div key={i} className="flex gap-1" style={{ marginBottom: gap, paddingLeft: indent ? 12 : 0 }}>
          <div className="h-[3px] rounded-full" style={{ width: i === 2 ? '60%' : '90%', background: barColor }} />
        </div>
      ))}
      {preset.textShadow && (
        <div className="h-[3px] w-[70%] rounded-full" style={{ background: 'rgba(0,229,255,0.25)' }} />
      )}
    </div>
  );
}

export const FlipCardTab = () => {
  const { flipCard, updateFlipCard } = useAppStore();
  const [showFront, setShowFront] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const typo = flipCard.typography;

  const selectPreset = (key: Exclude<TypographyPreset, 'custom'>) => {
    updateFlipCard({ typography: { ...TYPOGRAPHY_PRESETS[key] } });
  };

  const updateTypo = (updates: Partial<TypographyConfig>) => {
    updateFlipCard({ typography: { ...typo, ...updates, preset: 'custom' } });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {/* Tag config */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">触发标签配置</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">正面内容标签名</label>
              <input value={flipCard.frontTag} onChange={(e) => updateFlipCard({ frontTag: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">背面内容标签名</label>
              <input value={flipCard.backTag} onChange={(e) => updateFlipCard({ backTag: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">编号标签名</label>
              <input value={flipCard.numberTag} onChange={(e) => updateFlipCard({ numberTag: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 leading-relaxed">
            💡 在角色卡 prompt 中使用 <code className="text-primary font-mono">&lt;{flipCard.frontTag}&gt;</code> 正面内容 <code className="text-primary font-mono">&lt;/{flipCard.frontTag}&gt;</code> 等标签包裹内容即可触发翻页效果。
          </p>
        </div>

        {/* Card style - simplified */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">卡片样式</h4>
          <SliderWithLabel label="圆角" value={flipCard.borderRadius} onChange={(v) => updateFlipCard({ borderRadius: v })} min={0} max={30} unit="px" />
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">卡片边框</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={flipCard.cardBorder} onChange={(e) => updateFlipCard({ cardBorder: e.target.checked })} className="accent-primary" />
              {flipCard.cardBorder && (
                <ColorPicker label="" value={flipCard.cardBorderColor} onChange={(v) => updateFlipCard({ cardBorderColor: v })} />
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">正面翻转提示</label>
            <input value={flipCard.flipHint} onChange={(e) => updateFlipCard({ flipHint: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">背面翻转提示</label>
            <input value={flipCard.flipHintBack} onChange={(e) => updateFlipCard({ flipHintBack: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground" />
          </div>
        </div>

        {/* Typography Presets */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">正文排版风格</h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_META.map(({ key, name, desc }) => {
              const active = typo.preset === key;
              return (
                <button
                  key={key}
                  onClick={() => selectPreset(key)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    active
                      ? 'border-primary/60 bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                      : 'border-border bg-muted/20 hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
                  <PresetMiniPreview preset={TYPOGRAPHY_PRESETS[key]} />
                </button>
              );
            })}
          </div>
          {typo.preset === 'custom' && (
            <div className="text-xs text-accent font-medium px-1">✦ 自定义排版</div>
          )}

          {/* Custom adjustments collapsible */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCustom ? 'rotate-0' : '-rotate-90'}`} />
            自定义调整
          </button>

          {showCustom && (
            <div className="space-y-3 pt-1">
              <ColorPicker label="正面背景色" value={typo.frontBg} onChange={(v) => updateTypo({ frontBg: v })} />
              <ColorPicker label="背面背景色" value={typo.backBg} onChange={(v) => updateTypo({ backBg: v })} />
              <SliderWithLabel label="字号" value={typo.fontSize} onChange={(v) => updateTypo({ fontSize: v })} min={12} max={20} step={0.5} unit="px" />
              <SliderWithLabel label="行高" value={typo.lineHeight} onChange={(v) => updateTypo({ lineHeight: v })} min={1.2} max={2.2} step={0.05} unit="" />
              <SliderWithLabel label="字间距" value={typo.letterSpacing} onChange={(v) => updateTypo({ letterSpacing: v })} min={0} max={2} step={0.1} unit="px" />
              <ColorPicker label="文字颜色" value={typo.textColor} onChange={(v) => updateTypo({ textColor: v })} />
              <SliderWithLabel label="段落间距" value={typo.paragraphSpacing} onChange={(v) => updateTypo({ paragraphSpacing: v })} min={0} max={24} unit="px" />
              <SliderWithLabel label="容器内边距" value={typo.containerPadding} onChange={(v) => updateTypo({ containerPadding: v })} min={8} max={40} unit="px" />
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">首行缩进</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={typo.textIndent} onChange={(e) => updateTypo({ textIndent: e.target.checked })} className="accent-primary" />
                  {typo.textIndent && (
                    <input
                      type="number" min={0} max={3} step={0.5}
                      value={typo.textIndentSize}
                      onChange={(e) => updateTypo({ textIndentSize: parseFloat(e.target.value) || 0 })}
                      className="w-16 bg-input border border-border rounded px-2 py-0.5 text-xs text-foreground"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">文字阴影</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={typo.textShadow} onChange={(e) => updateTypo({ textShadow: e.target.checked })} className="accent-primary" />
                  {typo.textShadow && (
                    <>
                      <ColorPicker label="" value={typo.textShadowColor} onChange={(v) => updateTypo({ textShadowColor: v })} />
                      <input
                        type="number" min={1} max={20}
                        value={typo.textShadowBlur}
                        onChange={(e) => updateTypo({ textShadowBlur: parseInt(e.target.value) || 4 })}
                        className="w-14 bg-input border border-border rounded px-2 py-0.5 text-xs text-foreground"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
        <div className="glass-panel p-6" style={{ background: 'linear-gradient(180deg, #1a1c2e, #0e1026)' }}>
          <motion.div
            onClick={() => setShowFront(!showFront)}
            animate={{ rotateY: showFront ? 0 : 180 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            style={{
              background: showFront ? typo.frontBg : typo.backBg,
              borderRadius: flipCard.borderRadius,
              border: flipCard.cardBorder ? `1px solid ${flipCard.cardBorderColor}` : undefined,
              cursor: 'pointer',
              minHeight: 220,
              perspective: 1000,
            }}
          >
            {showFront ? (
              <div style={getTypographyStyle(typo)}>
                {PREVIEW_TEXT.split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: typo.paragraphSpacing }}>{para}</p>
                ))}
                {flipCard.flipHint && (
                  <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.35, marginTop: 14 }}>{flipCard.flipHint}</div>
                )}
              </div>
            ) : (
              <div style={{
                color: flipCard.textColor,
                fontSize: flipCard.fontSize,
                padding: `${typo.containerPadding}px ${typo.containerPadding + 4}px`,
                fontWeight: 'bold',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 180,
                transform: 'rotateY(180deg)',
              }}>
                这是卡片背面内容，显示角色状态或隐藏信息。
                {flipCard.flipHintBack && (
                  <div style={{ fontSize: 11, opacity: 0.35, marginTop: 14 }}>{flipCard.flipHintBack}</div>
                )}
              </div>
            )}
          </motion.div>
          <div className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-border">预览效果 · 点击卡片翻面</div>
        </div>
      </div>
    </div>
  );
};
