import { useState, useMemo } from 'react';
import { Copy, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';
import { buildDialogScript, buildStatusScript, buildTextEffectScript, buildFlipCardScript, buildSeparatorScript } from '@/utils/regexBuilder';
import type { ScriptEntry } from '@/types';

interface MatchResult {
  scriptName: string;
  source: string;
  matchCount: number;
}

function parseRegex(regexStr: string): RegExp | null {
  try {
    const m = regexStr.match(/^\/(.+)\/([gimsuy]*)$/s);
    if (m) return new RegExp(m[1], m[2]);
  } catch { /* skip */ }
  return null;
}

function generateSampleText(store: ReturnType<typeof useAppStore.getState>): string {
  const char = store.characters[0];
  const charName = char?.name || '角色';
  let text = '';

  // Build dialog based on character's trigger format
  const fmt = char?.triggerFormat || 'braces_cn';
  const wrap = (name: string, content: string) => {
    switch (fmt) {
      case 'braces_cn': return `{${name}：${content}}`;
      case 'braces_en': return `{${name}: ${content}}`;
      case 'japanese': return `${name}：「${content}」`;
      case 'cn_quotes': return `${name}：\u201c${content}\u201d`;
      default: return `{${name}：${content}}`;
    }
  };

  text += `${wrap(charName, '你好啊，今天天气真不错呢。')}\n\n`;
  text += `*她微微一笑，轻轻点了点头。*\n\n`;
  text += `（阳光透过窗帘洒落在桌面上，空气中弥漫着咖啡的香气。）\n\n`;
  text += `${wrap(charName, '要不要一起去散步？')}\n\n`;

  // Status panel
  const fields = store.statusPanel.fields;
  if (fields.length > 0) {
    const sampleValues: Record<string, string> = {
      '时间': '傍晚', '地点': '花园', '心情': '愉悦', '生命值': '80%',
      '服装': '白色连衣裙', '能量': '75%', '信用': '1200', '状态': '正常',
      '心智': '稳定',
    };
    const fieldValues = fields.map(f => `${f.name}：${sampleValues[f.name] || '示例值'}`).join('\n');
    text += `${fieldValues}`;
  }

  return text;
}

export const RegexTestTab = () => {
  const store = useAppStore();
  const { characters, statusPanel, textEffects, flipCard, exportSettings, formatPrompt } = store;
  const [inputText, setInputText] = useState('');

  // Build all scripts (same order as ExportCenter)
  const allScripts = useMemo(() => {
    const scripts: { script: ScriptEntry; source: string }[] = [];

    textEffects.forEach(rule => {
      if (rule.name) scripts.push({ script: buildTextEffectScript(rule, exportSettings), source: '✨ 文字特效' });
    });
    characters.forEach(char => {
      if (char.name) scripts.push({ script: buildDialogScript(char, exportSettings), source: '🎨 对话气泡' });
    });
    const sepScript = buildSeparatorScript(formatPrompt.paragraphSeparator, formatPrompt.customSeparator, exportSettings);
    if (sepScript) scripts.push({ script: sepScript, source: '📝 段落分隔符' });
    if (statusPanel.fields.length > 0) {
      const s = buildStatusScript(statusPanel, exportSettings);
      if (s) scripts.push({ script: s, source: '📊 状态面板' });
    }
    scripts.push({ script: buildFlipCardScript(flipCard, exportSettings), source: '📑 翻页卡片' });

    return scripts;
  }, [characters, statusPanel, textEffects, flipCard, exportSettings, formatPrompt]);

  // Apply regex replacements and count matches
  const { resultHtml, matchResults } = useMemo(() => {
    let html = inputText;
    const results: MatchResult[] = [];

    allScripts.forEach(({ script, source }) => {
      const regex = parseRegex(script.findRegex);
      if (!regex) {
        results.push({ scriptName: script.scriptName, source, matchCount: 0 });
        return;
      }

      // Count matches
      const matches = [...html.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
      results.push({ scriptName: script.scriptName, source, matchCount: matches.length });

      // Apply replacement
      if (matches.length > 0) {
        try {
          const r = new RegExp(regex.source, regex.flags);
          html = html.replace(r, script.replaceString);
        } catch { /* skip */ }
      }
    });

    // Convert newlines to <br> for display
    html = html.replace(/\n/g, '<br>');

    return { resultHtml: html, matchResults: results };
  }, [inputText, allScripts]);

  const loadSample = () => {
    setInputText(generateSampleText(useAppStore.getState()));
    toast.success('已加载示例文本');
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(resultHtml);
    toast.success('已复制渲染结果');
  };

  const totalMatches = matchResults.reduce((sum, r) => sum + r.matchCount, 0);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-foreground">🧪 正则测试</h2>
        <p className="text-xs text-muted-foreground">输入模拟 AI 输出文本，实时预览正则替换效果</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={loadSample} className="glass-panel px-3 py-1.5 text-sm hover:border-primary transition-colors flex items-center gap-1.5">
          <FileText size={14} /> 加载示例文本
        </button>
        <button onClick={() => setInputText('')} className="glass-panel px-3 py-1.5 text-sm hover:border-destructive transition-colors flex items-center gap-1.5 text-muted-foreground">
          <Trash2 size={14} /> 清空
        </button>
        {resultHtml && (
          <button onClick={copyResult} className="glass-panel px-3 py-1.5 text-sm hover:border-primary transition-colors flex items-center gap-1.5 text-muted-foreground">
            <Copy size={14} /> 复制渲染结果
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Input */}
        <div className="lg:w-1/2 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">输入文本</h4>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={'{角色名：这里是对话内容}\n\n*心理活动描写*\n\n（旁白描述）\n\n时间：傍晚\n地点：花园\n心情：愉悦'}
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ minHeight: '50vh' }}
          />
        </div>

        {/* Preview */}
        <div className="lg:w-1/2 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">渲染预览</h4>
          <div
            className="rounded-xl overflow-y-auto"
            style={{ background: '#1a1c2e', color: '#e2e8f0', minHeight: '50vh', padding: 16 }}
          >
            {inputText ? (
              <div dangerouslySetInnerHTML={{ __html: resultHtml }} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground" style={{ minHeight: '45vh' }}>
                在左侧输入文本或点击「加载示例文本」
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match status */}
      {inputText && (
        <div className="glass-panel p-4 space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            匹配状态（共 {totalMatches} 处匹配）
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {matchResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-muted/10">
                <span className={r.matchCount > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                  {r.matchCount > 0 ? '✓' : '✗'}
                </span>
                <span className="truncate flex-1 text-foreground">{r.scriptName}</span>
                <span className={`text-xs ${r.matchCount > 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {r.matchCount > 0 ? `${r.matchCount} 处` : '未匹配'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
