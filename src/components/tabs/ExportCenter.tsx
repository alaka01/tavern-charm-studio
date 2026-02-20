import { useState, useMemo } from 'react';
import { ChevronDown, Download, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';
import { buildDialogScript, buildStatusScript, buildTextEffectScript, buildFlipCardScript, buildSeparatorScript } from '@/utils/regexBuilder';
import { generateFormatPrompt } from '@/utils/promptBuilder';
import type { ScriptEntry } from '@/types';

interface ScriptWithSource extends ScriptEntry {
  source: string;
  order: number;
}

export const ExportCenter = () => {
  const { characters, statusPanel, textEffects, flipCard, exportSettings, updateExportSettings, formatPrompt, formatPrompt: { paragraphSeparator, customSeparator } } = useAppStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [previewScript, setPreviewScript] = useState<ScriptWithSource | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Scripts ordered by execution priority:
  // 1. Text effects  2. Dialog bubbles  3. Separator  4. Status panel  5. Flip card
  const allScripts = useMemo((): ScriptWithSource[] => {
    const scripts: ScriptWithSource[] = [];
    let order = 1;

    // 1. Text effects
    textEffects.forEach(rule => {
      if (rule.name) scripts.push({ ...buildTextEffectScript(rule, exportSettings), source: '✨ 文字特效', order: order++ });
    });

    // 2. Dialog bubbles
    characters.forEach(char => {
      if (char.name) scripts.push({ ...buildDialogScript(char, exportSettings), source: '🎨 对话气泡', order: order++ });
    });

    // 3. Separator
    const sepScript = buildSeparatorScript(paragraphSeparator, customSeparator, exportSettings);
    if (sepScript) scripts.push({ ...sepScript, source: '📝 段落分隔符', order: order++ });

    // 4. Status panel
    if (statusPanel.fields.length > 0) {
      const script = buildStatusScript(statusPanel, exportSettings);
      if (script) scripts.push({ ...script, source: '📊 状态面板', order: order++ });
    }

    // 5. Flip card (last - wraps already processed content)
    scripts.push({ ...buildFlipCardScript(flipCard, exportSettings), source: '📑 翻页卡片', order: order++ });

    return scripts;
  }, [characters, statusPanel, textEffects, flipCard, exportSettings, paragraphSeparator, customSeparator]);

  const promptText = useMemo(() => {
    return generateFormatPrompt({ characters, statusPanel, textEffects, flipCard, config: formatPrompt });
  }, [characters, statusPanel, textEffects, flipCard, formatPrompt]);

  const isEnabled = (id: string) => !disabledIds.has(id);
  const toggleScript = (id: string) => {
    setDisabledIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const stripSource = (s: ScriptWithSource): ScriptEntry => {
    const { source, order, ...rest } = s;
    return rest;
  };

  const exportAll = async () => {
    const enabled = allScripts.filter(s => isEnabled(s.id)).map(stripSource);
    const jsonStr = JSON.stringify(enabled, null, 2);
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('sillytavern-regex-scripts.json', jsonStr);
    zip.file('format-prompt.txt', promptText);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sillytavern-export.zip';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功！已打包下载正则脚本 + 格式提示词');
  };

  const exportJsonOnly = () => {
    const enabled = allScripts.filter(s => isEnabled(s.id)).map(stripSource);
    const blob = new Blob([JSON.stringify(enabled, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sillytavern-regex-scripts.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功！文件已下载');
  };

  const copyAll = async () => {
    const enabled = allScripts.filter(s => isEnabled(s.id)).map(stripSource);
    await navigator.clipboard.writeText(JSON.stringify(enabled, null, 2));
    toast.success('已复制到剪贴板！');
  };

  const exportSingle = (script: ScriptWithSource) => {
    const clean = stripSource(script);
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clean.scriptName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${clean.scriptName}`);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(promptText);
    toast.success('已复制提示词到剪贴板！');
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

  const importJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        toast.success(`成功导入 ${Array.isArray(data) ? data.length : 1} 条正则脚本`);
      } catch {
        toast.error('导入失败：JSON 格式无效');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={exportAll} className="glow-btn text-sm">
          <Download size={16} /> 全部导出（ZIP）
        </button>
        <button onClick={exportJsonOnly} className="glass-panel px-4 py-2 text-sm hover:border-primary transition-colors flex items-center gap-2">
          <Download size={16} /> 仅导出 JSON
        </button>
        <button onClick={copyAll} className="glass-panel px-4 py-2 text-sm hover:border-primary transition-colors flex items-center gap-2">
          <Copy size={16} /> 复制到剪贴板
        </button>
        <button onClick={importJson} className="glass-panel px-4 py-2 text-sm hover:border-primary transition-colors flex items-center gap-2">
          📥 导入 JSON
        </button>
      </div>

      {/* Execution order hint */}
      <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 leading-relaxed">
        💡 脚本按执行顺序排列：文字特效 → 对话气泡 → 段落分隔符 → 状态面板 → 翻页卡片。导入酒馆后请保持此顺序，以确保状态面板内容在翻页卡片包裹前已正确渲染。
      </div>

      {/* Script list */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          脚本列表（{allScripts.filter(s => isEnabled(s.id)).length}/{allScripts.length} 已启用）
        </h4>
        {allScripts.map(script => (
          <div key={script.id} className="glass-panel p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={isEnabled(script.id)}
                onChange={() => toggleScript(script.id)}
                className="accent-primary flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded mr-2">#{script.order}</span>
                  {script.scriptName}
                </div>
                <div className="text-xs text-muted-foreground">{script.source}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewScript(previewScript?.id === script.id ? null : script)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="预览"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => exportSingle(script)}
                className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                导出
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {previewScript && (
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">{previewScript.scriptName} - 预览</h4>
            <button onClick={() => setPreviewScript(null)} className="text-xs text-muted-foreground hover:text-foreground">关闭</button>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">findRegex:</div>
            <code className="block text-xs font-mono bg-muted/30 p-3 rounded-lg break-all text-primary">{previewScript.findRegex}</code>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">replaceString:</div>
            <code className="block text-xs font-mono bg-muted/30 p-3 rounded-lg break-all text-accent max-h-40 overflow-y-auto">{previewScript.replaceString}</code>
          </div>
        </div>
      )}

      {/* Format prompt section */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            className="flex items-center gap-2 text-sm font-semibold hover:text-foreground transition-colors"
          >
            <ChevronDown size={16} className={`transition-transform ${showPromptPreview ? 'rotate-180' : ''}`} />
            📝 配套格式提示词
          </button>
          <div className="flex gap-2">
            <button onClick={copyPrompt} className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1">
              <Copy size={12} /> 复制提示词
            </button>
            <button onClick={downloadPrompt} className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1">
              <Download size={12} /> 下载提示词
            </button>
          </div>
        </div>
        {showPromptPreview && (
          <pre className="text-xs font-mono bg-muted/20 p-4 rounded-lg whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed text-muted-foreground">
            {promptText}
          </pre>
        )}
      </div>

      {/* Advanced settings */}
      <div className="glass-panel p-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          高级设置
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-3 pt-3 border-t border-border">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">应用范围（placement）</label>
              <select
                value={exportSettings.placement[0]}
                onChange={(e) => updateExportSettings({ placement: [Number(e.target.value)] })}
                className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                <option value={1}>仅用户输入</option>
                <option value={2}>仅AI输出</option>
                <option value={0}>两者都匹配</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={exportSettings.markdownOnly} onChange={(e) => updateExportSettings({ markdownOnly: e.target.checked })} className="accent-primary" />
              仅 Markdown 模式（markdownOnly）
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={exportSettings.runOnEdit} onChange={(e) => updateExportSettings({ runOnEdit: e.target.checked })} className="accent-primary" />
              编辑时运行（runOnEdit）
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
