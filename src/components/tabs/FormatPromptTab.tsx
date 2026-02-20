import { useEffect, useMemo, useState } from 'react';
import { Copy, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';
import { generateFormatPrompt, detectWarnings, estimateTokens } from '@/utils/promptBuilder';
import type { PromptLanguage, PromptTone, PlacementSuggestion, ParagraphSeparator } from '@/types';

const placementLabels: Record<PlacementSuggestion, string> = {
  system: '系统提示词（System Prompt）',
  author_note: '角色卡作者注释（Author\'s Note）',
  world_info: '世界书条目（World Info / Lorebook）',
};

export const FormatPromptTab = () => {
  const {
    characters, statusPanel, textEffects, flipCard,
    formatPrompt, updateFormatPrompt, updateFormatPromptChar,
    addFormatPromptChar, removeFormatPromptChar, syncFormatPromptChars,
    setActiveTab,
  } = useAppStore();

  const [newCharName, setNewCharName] = useState('');

  // Sync characters from tab1 on mount / change
  useEffect(() => {
    syncFormatPromptChars();
  }, [characters, syncFormatPromptChars]);

  const ctx = useMemo(() => ({
    characters, statusPanel, textEffects, flipCard, config: formatPrompt,
  }), [characters, statusPanel, textEffects, flipCard, formatPrompt]);

  const promptText = useMemo(() => generateFormatPrompt(ctx), [ctx]);
  const warnings = useMemo(() => detectWarnings(ctx), [ctx]);
  const tokens = useMemo(() => estimateTokens(promptText), [promptText]);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(promptText);
    toast.success('已复制到剪贴板！');
  };

  const downloadPrompt = () => {
    const blob = new Blob([promptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'format-prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('提示词已下载！');
  };

  const handleAddChar = () => {
    const name = newCharName.trim();
    if (!name) return;
    if (formatPrompt.characters.some(c => c.name === name)) {
      toast.error('角色名已存在');
      return;
    }
    addFormatPromptChar(name);
    setNewCharName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      {/* Left: Config */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold">📝 格式提示词配置</h3>

        {/* Basic settings */}
        <div className="glass-panel p-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">基础设置</h4>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">提示词语言</label>
            <select
              value={formatPrompt.language}
              onChange={e => updateFormatPrompt({ language: e.target.value as PromptLanguage })}
              className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              <option value="en">英文（推荐）</option>
              <option value="zh">中文</option>
              <option value="bilingual">双语</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">语气风格</label>
            <select
              value={formatPrompt.tone}
              onChange={e => updateFormatPrompt({ tone: e.target.value as PromptTone })}
              className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              <option value="strict">严格命令式（推荐）</option>
              <option value="gentle">温和引导式</option>
              <option value="concise">简洁列表式</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">建议插入位置</label>
            <div className="space-y-1.5">
              {(Object.entries(placementLabels) as [PlacementSuggestion, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="placement"
                    checked={formatPrompt.placementSuggestion === key}
                    onChange={() => updateFormatPrompt({ placementSuggestion: key })}
                    className="accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Character list */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">角色名列表</h4>
          <div className="flex flex-wrap gap-2">
            {formatPrompt.characters.map(c => (
              <div key={c.name} className="glass-panel px-3 py-2 text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <button onClick={() => removeFormatPromptChar(c.name)} className="text-muted-foreground hover:text-destructive text-[10px]">✕</button>
                </div>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={c.needDialog} onChange={e => updateFormatPromptChar(c.name, { needDialog: e.target.checked })} className="accent-primary" />
                    <span className="text-muted-foreground">对话</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={c.needStatus} onChange={e => updateFormatPromptChar(c.name, { needStatus: e.target.checked })} className="accent-primary" />
                    <span className="text-muted-foreground">状态栏</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newCharName}
              onChange={e => setNewCharName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddChar()}
              placeholder="手动添加角色名"
              className="flex-1 bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            />
            <button onClick={handleAddChar} className="px-3 py-1.5 text-xs glow-btn">添加</button>
          </div>
        </div>

        {/* Reply structure */}
        <div className="glass-panel p-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">回复结构配置</h4>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formatPrompt.useFlipCard} onChange={e => updateFormatPrompt({ useFlipCard: e.target.checked })} className="accent-primary" />
            使用翻页卡片包裹
          </label>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">段落分隔符</label>
            <select
              value={formatPrompt.paragraphSeparator}
              onChange={e => updateFormatPrompt({ paragraphSeparator: e.target.value as ParagraphSeparator })}
              className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              <option value="pipe">| （竖线）</option>
              <option value="hr">--- （Markdown 分割线）</option>
              <option value="none">无</option>
              <option value="custom">自定义</option>
            </select>
            {formatPrompt.paragraphSeparator === 'custom' && (
              <input
                value={formatPrompt.customSeparator}
                onChange={e => updateFormatPrompt({ customSeparator: e.target.value })}
                placeholder="输入自定义分隔符"
                className="mt-2 w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formatPrompt.useFloorCounter} onChange={e => updateFormatPrompt({ useFloorCounter: e.target.checked })} className="accent-primary" />
            楼层计数器
          </label>
          {formatPrompt.useFloorCounter && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">起始数字</label>
              <input
                type="number"
                value={formatPrompt.floorStartNumber}
                onChange={e => updateFormatPrompt({ floorStartNumber: Number(e.target.value) })}
                className="w-24 bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              />
            </div>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="glass-panel p-4 space-y-2 border-gold/30">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-gold">
              <AlertTriangle size={14} /> 潜在问题检测
            </h4>
            {warnings.map((w, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(w.targetTab as any)}
                className="block w-full text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                ⚠️ {w.message}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">生成的格式提示词</h3>
          <div className="flex gap-2">
            <button onClick={copyPrompt} className="glass-panel px-3 py-1.5 text-xs hover:border-primary transition-colors flex items-center gap-1.5">
              <Copy size={12} /> 复制
            </button>
            <button onClick={downloadPrompt} className="glass-panel px-3 py-1.5 text-xs hover:border-primary transition-colors flex items-center gap-1.5">
              <Download size={12} /> 下载 .txt
            </button>
          </div>
        </div>

        <div className="glass-panel p-4 max-h-[70vh] overflow-y-auto">
          <HighlightedPrompt text={promptText} />
        </div>

        <div className="text-xs text-muted-foreground text-right">
          约 {promptText.length} 字 / ~{tokens} tokens
        </div>
      </div>
    </div>
  );
};

/** Simple syntax highlight for the prompt preview */
function HighlightedPrompt({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
      {lines.map((line, i) => (
        <div key={i}>{highlightLine(line)}</div>
      ))}
    </pre>
  );
}

function highlightLine(line: string): React.ReactNode {
  // Headings
  if (/^#{1,3}\s/.test(line)) {
    return <span className="text-primary font-bold">{line}</span>;
  }

  // Tag names <xxx>
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Highlight <tags> in cyan, MUST/EVERY/STRICTLY in gold, field examples in muted
  const tagRegex = /(<\/?[a-zA-Z0-9_-]+>)/g;
  const emphasisRegex = /\b(MUST|EVERY|STRICTLY|NOT|ALL|EXACTLY)\b/g;

  // Simple approach: split by tags first
  const tagParts = remaining.split(tagRegex);
  tagParts.forEach(part => {
    if (tagRegex.test(part)) {
      tagRegex.lastIndex = 0;
      parts.push(<span key={key++} className="text-primary">{part}</span>);
    } else {
      // Within non-tag parts, highlight emphasis words
      const emphParts = part.split(emphasisRegex);
      emphParts.forEach(ep => {
        if (emphasisRegex.test(ep)) {
          emphasisRegex.lastIndex = 0;
          parts.push(<span key={key++} className="text-gold font-bold">{ep}</span>);
        } else if (ep.startsWith('XXX') || ep === '示例值') {
          parts.push(<span key={key++} className="text-muted-foreground">{ep}</span>);
        } else {
          parts.push(<span key={key++}>{ep}</span>);
        }
      });
    }
  });

  return <>{parts}</>;
}
