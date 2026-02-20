import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { SliderWithLabel } from '@/components/shared/SliderWithLabel';
import { dialogPresets } from '@/utils/templates';
import type { AvatarMode, BubblePreset } from '@/types';

const TRIGGER_OPTIONS = [
  { value: 'braces_cn', label: '{角色名：内容}' },
  { value: 'braces_en', label: '{角色名:内容}' },
  { value: 'japanese', label: '「内容」' },
  { value: 'cn_quotes', label: '\u201c内容\u201d' },
  { value: 'custom', label: '自定义正则' },
];

const ALIGN_OPTIONS = [
  { value: 'left', label: '居左' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '居右' },
];

const THEME_COLORS = [
  { color: '#f472b6', name: '温柔粉' },
  { color: '#38bdf8', name: '天空蓝' },
  { color: '#34d399', name: '翡翠绿' },
  { color: '#fbbf24', name: '琥珀金' },
  { color: '#a78bfa', name: '薰衣紫' },
  { color: '#fb7185', name: '珊瑚红' },
  { color: '#2dd4bf', name: '薄荷青' },
  { color: '#e2e8f0', name: '银白' },
];

const AVATAR_OPTIONS: { value: AvatarMode; label: string }[] = [
  { value: 'none', label: '无头像' },
  { value: 'initial', label: '首字彩色圆形' },
  { value: 'emoji', label: '自定义 emoji' },
];

const PRESET_OPTIONS: { value: BubblePreset; label: string; icon: string }[] = [
  { value: 'line', label: '简约竖线风', icon: '📐' },
  { value: 'card', label: '卡片气泡风', icon: '💬' },
  { value: 'quote', label: '引用块风', icon: '📝' },
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export const DialogBubbleTab = () => {
  const { characters, addCharacter, updateCharacter, removeCharacter } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(characters[0]?.id ?? null);

  const applyPreset = (presetIndex: number) => {
    const updates = dialogPresets[presetIndex].apply();
    characters.forEach(c => updateCharacter(c.id, updates));
  };

  const sampleDialogs = characters.length >= 2
    ? [
        { char: characters[0], text: '你好，很高兴认识你。' },
        { char: characters[1], text: '我也是。今天天气真好呢。' },
        { char: characters[0], text: '嗯，要不要一起去散步？' },
      ]
    : [
        { char: characters[0], text: '你好，很高兴认识你。' },
        { char: characters[0], text: '今天天气真好呢。' },
        { char: characters[0], text: '要不要一起去散步？' },
      ];

  const renderAvatar = (c: typeof characters[0]) => {
    if (c.avatarMode === 'emoji') {
      return <span style={{ fontSize: 16, marginRight: 4 }}>{c.avatarEmoji}</span>;
    }
    if (c.avatarMode === 'initial') {
      const color = hashColor(c.name);
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: '50%',
          background: color, color: '#000', fontSize: 11, fontWeight: 'bold', marginRight: 4,
        }}>
          {c.name.charAt(0)}
        </span>
      );
    }
    return null;
  };

  const renderBubblePreview = (c: typeof characters[0], text: string, i: number) => {
    if (c.bubblePreset === 'line') {
      return (
        <div key={i} style={{
          margin: '4px 0', padding: '10px 14px',
          background: 'rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${c.themeColor}`,
          borderRadius: '2px 8px 8px 2px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.themeColor, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
            {renderAvatar(c)}{c.name}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)' }}>{text}</div>
        </div>
      );
    }
    if (c.bubblePreset === 'quote') {
      return (
        <div key={i} style={{
          margin: '4px 0', padding: '8px 12px',
          borderLeft: `4px solid ${c.themeColor}`,
          color: 'rgba(255,255,255,0.85)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: c.themeColor, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            {renderAvatar(c)}{c.name}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.7 }}>{text}</div>
        </div>
      );
    }
    // Card
    const bg = c.useGradient
      ? `linear-gradient(${c.gradientDirection}, ${c.bubbleBgColor}, ${c.gradientColor2})`
      : c.bubbleBgColor;
    return (
      <div key={i} style={{ display: 'flex', justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start' }}>
        <div style={{
          background: bg, borderRadius: c.borderRadius, padding: c.padding,
          maxWidth: `${c.maxWidth}%`, margin: '4px 0',
          border: c.showBorder ? `1px solid ${c.borderColor}` : 'none',
          boxShadow: c.showShadow ? `0 2px ${c.shadowBlur}px ${c.shadowColor}` : 'none',
        }}>
          <div style={{ color: c.themeColor, fontSize: c.nameFontSize, fontWeight: c.nameBold ? 'bold' : 'normal', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            {renderAvatar(c)}{c.name}
          </div>
          <div style={{ color: c.textColor, fontSize: c.textFontSize, lineHeight: c.lineHeight }}>{text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Config */}
      <div className="lg:w-1/2 space-y-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {/* Bubble Presets */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">气泡预设风格</h4>
          <div className="flex gap-2 flex-wrap">
            {PRESET_OPTIONS.map(p => (
              <button
                key={p.value}
                onClick={() => {
                  const presetIdx = dialogPresets.findIndex(dp => dp.apply().bubblePreset === p.value);
                  if (presetIdx >= 0) applyPreset(presetIdx);
                  else characters.forEach(c => updateCharacter(c.id, { bubblePreset: p.value }));
                }}
                className={`preset-btn ${characters[0]?.bubblePreset === p.value ? '!border-primary !bg-primary/10' : ''}`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {characters.map((char) => (
            <motion.div
              key={char.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  value={char.name}
                  onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                  className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm flex-1 mr-2 text-foreground"
                  placeholder="角色名"
                />
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpandedId(expandedId === char.id ? null : char.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                    {expandedId === char.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {characters.length > 1 && (
                    <button onClick={() => removeCharacter(char.id)} className="p-1.5 hover:bg-destructive/20 text-destructive rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === char.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    {/* Theme color */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">角色主题色</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {THEME_COLORS.map(tc => (
                          <button
                            key={tc.color}
                            onClick={() => updateCharacter(char.id, { themeColor: tc.color })}
                            className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${char.themeColor === tc.color ? 'border-white scale-110' : 'border-transparent'}`}
                            style={{ background: tc.color }}
                            title={tc.name}
                          />
                        ))}
                        <input
                          type="color"
                          value={char.themeColor}
                          onChange={(e) => updateCharacter(char.id, { themeColor: e.target.value })}
                          className="w-7 h-7 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Trigger format */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">对话触发格式</label>
                      <select value={char.triggerFormat} onChange={(e) => updateCharacter(char.id, { triggerFormat: e.target.value as any })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                        {TRIGGER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    {char.triggerFormat === 'custom' && (
                      <input value={char.customRegex} onChange={(e) => updateCharacter(char.id, { customRegex: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground" placeholder="/pattern/flags" />
                    )}

                    {/* Avatar mode */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">头像显示</h4>
                      <div className="flex gap-2 flex-wrap">
                        {AVATAR_OPTIONS.map(o => (
                          <button
                            key={o.value}
                            onClick={() => updateCharacter(char.id, { avatarMode: o.value })}
                            className={`preset-btn ${char.avatarMode === o.value ? '!border-primary !bg-primary/10' : ''}`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      {char.avatarMode === 'emoji' && (
                        <input
                          value={char.avatarEmoji}
                          onChange={(e) => updateCharacter(char.id, { avatarEmoji: e.target.value })}
                          className="w-20 bg-input border border-border rounded-lg px-3 py-1.5 text-lg text-center"
                          placeholder="🌸"
                          maxLength={2}
                        />
                      )}
                    </div>

                    {/* Card-specific styles */}
                    {char.bubblePreset === 'card' && (
                      <div className="space-y-3 pt-2 border-t border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">卡片样式详细设置</h4>
                        <ColorPicker label="背景颜色" value={char.bubbleBgColor} onChange={(v) => updateCharacter(char.id, { bubbleBgColor: v })} />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input type="checkbox" checked={char.useGradient} onChange={(e) => updateCharacter(char.id, { useGradient: e.target.checked })} className="accent-primary" />
                          使用渐变
                        </label>
                        {char.useGradient && <ColorPicker label="渐变色2" value={char.gradientColor2} onChange={(v) => updateCharacter(char.id, { gradientColor2: v })} />}
                        <SliderWithLabel label="圆角" value={char.borderRadius} onChange={(v) => updateCharacter(char.id, { borderRadius: v })} min={0} max={30} unit="px" />
                        <SliderWithLabel label="内边距" value={char.padding} onChange={(v) => updateCharacter(char.id, { padding: v })} min={4} max={24} unit="px" />
                        <SliderWithLabel label="最大宽度" value={char.maxWidth} onChange={(v) => updateCharacter(char.id, { maxWidth: v })} min={30} max={100} unit="%" />
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">对齐方式</label>
                          <select value={char.align} onChange={(e) => updateCharacter(char.id, { align: e.target.value as any })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                            {ALIGN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input type="checkbox" checked={char.showBorder} onChange={(e) => updateCharacter(char.id, { showBorder: e.target.checked })} className="accent-primary" />
                          显示边框
                        </label>
                        {char.showBorder && <ColorPicker label="边框颜色" value={char.borderColor} onChange={(v) => updateCharacter(char.id, { borderColor: v })} />}
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input type="checkbox" checked={char.showShadow} onChange={(e) => updateCharacter(char.id, { showShadow: e.target.checked })} className="accent-primary" />
                          显示阴影
                        </label>
                        {char.showShadow && (
                          <>
                            <ColorPicker label="阴影颜色" value={char.shadowColor} onChange={(v) => updateCharacter(char.id, { shadowColor: v })} />
                            <SliderWithLabel label="模糊度" value={char.shadowBlur} onChange={(v) => updateCharacter(char.id, { shadowBlur: v })} min={0} max={30} unit="px" />
                          </>
                        )}
                      </div>
                    )}

                    {/* Text styles */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">文字样式</h4>
                      <SliderWithLabel label="角色名字号" value={char.nameFontSize} onChange={(v) => updateCharacter(char.id, { nameFontSize: v })} min={10} max={20} unit="px" />
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={char.nameBold} onChange={(e) => updateCharacter(char.id, { nameBold: e.target.checked })} className="accent-primary" />
                        角色名加粗
                      </label>
                      <ColorPicker label="对话文字颜色" value={char.textColor} onChange={(v) => updateCharacter(char.id, { textColor: v })} />
                      <SliderWithLabel label="对话字号" value={char.textFontSize} onChange={(v) => updateCharacter(char.id, { textFontSize: v })} min={12} max={20} unit="px" />
                      <SliderWithLabel label="行高" value={char.lineHeight} onChange={(v) => updateCharacter(char.id, { lineHeight: v })} min={1.2} max={2.2} step={0.1} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        <button onClick={addCharacter} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-all text-sm">
          ➕ 添加角色
        </button>
      </div>

      {/* Preview */}
      <div className="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
        <div className="glass-panel p-6" style={{ background: 'linear-gradient(180deg, #141626, #0e1026)' }}>
          {/* Narrative text sample */}
          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px', marginBottom: 8 }}>
            她缓步走进了房间，目光环顾四周。
          </div>
          <div className="space-y-0">
            {sampleDialogs.map((dialog, i) => renderBubblePreview(dialog.char, dialog.text, i))}
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px', marginTop: 8 }}>
            他微微点头，转身望向窗外。
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-border">预览效果</div>
        </div>
      </div>
    </div>
  );
};
