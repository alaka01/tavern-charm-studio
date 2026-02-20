import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw, GripVertical } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { buildDialogScript, buildStatusScript, buildTextEffectScript, buildFlipCardScript, buildSeparatorScript } from '@/utils/regexBuilder';
import type { ScriptEntry } from '@/types';

function generateSampleText(store: ReturnType<typeof useAppStore.getState>): string {
  const { characters, statusPanel, textEffects, flipCard, formatPrompt } = store;
  const lines: string[] = [];

  const sep = formatPrompt.paragraphSeparator;
  let sepChar = '';
  if (sep === 'pipe') sepChar = '|';
  else if (sep === 'hr') sepChar = '---';
  else if (sep === 'custom') sepChar = formatPrompt.customSeparator || '';

  const addSep = (line: string) => sepChar ? `${line}${sepChar}` : line;
  const useFlip = formatPrompt.useFlipCard;

  if (useFlip) lines.push(`<${flipCard.frontTag}>`);

  lines.push(addSep('她缓步走进了房间，目光环顾四周。'));

  const hasAsterisk = textEffects.some(r => r.matchPattern === 'asterisk');
  const hasCnParens = textEffects.some(r => r.matchPattern === 'cn_parens');
  const hasBrackets = textEffects.some(r => r.matchPattern === 'brackets');

  if (hasAsterisk) lines.push(addSep('*不知道他在不在……*'));

  characters.forEach((char, i) => {
    if (!char.name) return;
    const sampleDialogs = ['你好，好久不见了。', '嗯，好久不见。坐吧。', '今天天气真好呢。'];
    const dialog = sampleDialogs[i % sampleDialogs.length];
    switch (char.triggerFormat) {
      case 'braces_cn': lines.push(addSep(`{${char.name}："${dialog}"}`)); break;
      case 'braces_en': lines.push(addSep(`{${char.name}: "${dialog}"}`)); break;
      case 'japanese': lines.push(addSep(`${char.name}：「${dialog}」`)); break;
      case 'cn_quotes': lines.push(addSep(`${char.name}：\u201c${dialog}\u201d`)); break;
      default: lines.push(addSep(`{${char.name}："${dialog}"}`));
    }
    if (i === 0 && hasCnParens) lines.push(addSep('（房间里弥漫着淡淡的花香。）'));
  });

  if (hasBrackets) lines.push(addSep('[系统：好感度 +1]'));
  lines.push(addSep('他微微点头，转身望向窗外。'));

  if (useFlip) {
    lines.push(`</${flipCard.frontTag}>`);
    lines.push(`<${flipCard.backTag}>`);
  }

  if (statusPanel.fields.length > 0) {
    statusPanel.fields.forEach(f => {
      let val = '示例值';
      if (f.type === 'progress') val = '75/100';
      if (f.name === '时间') val = '2024年3月15日—14:30';
      else if (f.name === '地点') val = '客厅';
      else if (f.name === '服装') val = '白色连衣裙';
      else if (f.name === '心情') val = '平静';
      lines.push(`${f.name}: ${val}`);
    });
  }

  if (useFlip) lines.push(`</${flipCard.backTag}>`);
  if (formatPrompt.useFloorCounter) {
    lines.push(`<${flipCard.numberTag}>${formatPrompt.floorStartNumber}</${flipCard.numberTag}>`);
  }

  return lines.join('\n');
}

function applyRegexScripts(text: string, scripts: ScriptEntry[]): string {
  let result = text;
  for (const script of scripts) {
    if (script.disabled) continue;
    try {
      const match = script.findRegex.match(/^\/(.+)\/([gimsuy]*)$/);
      if (!match) continue;
      const regex = new RegExp(match[1], match[2]);
      result = result.replace(regex, script.replaceString);
    } catch {
      // Skip invalid regex
    }
  }
  result = result.replace(/\n/g, '<br>');
  return result;
}

export const RegexPreviewPanel = () => {
  const store = useAppStore();
  const { characters, statusPanel, textEffects, flipCard, exportSettings, formatPrompt } = store;

  const [isOpen, setIsOpen] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const autoText = useMemo(() => {
    return generateSampleText(store);
  }, [characters, statusPanel, textEffects, flipCard, formatPrompt]);

  const displayText = editedText !== null ? editedText : autoText;

  // Scripts in correct execution order: text effects → dialog → separator → status → flip card
  const allScripts = useMemo((): ScriptEntry[] => {
    const scripts: ScriptEntry[] = [];
    textEffects.forEach(rule => {
      if (rule.name) scripts.push(buildTextEffectScript(rule, exportSettings));
    });
    characters.forEach(char => {
      if (char.name) scripts.push(buildDialogScript(char, exportSettings));
    });
    const sepScript = buildSeparatorScript(formatPrompt.paragraphSeparator, formatPrompt.customSeparator, exportSettings);
    if (sepScript) scripts.push(sepScript);
    if (statusPanel.fields.length > 0) {
      const script = buildStatusScript(statusPanel, exportSettings);
      if (script) scripts.push(script);
    }
    scripts.push(buildFlipCardScript(flipCard, exportSettings));
    return scripts;
  }, [characters, statusPanel, textEffects, flipCard, exportSettings, formatPrompt.paragraphSeparator, formatPrompt.customSeparator]);

  const renderedHtml = useMemo(() => {
    return applyRegexScripts(displayText, allScripts);
  }, [displayText, allScripts]);

  const handleReset = useCallback(() => {
    setEditedText(null);
    setIsEditing(false);
  }, []);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 glow-btn !rounded-full !px-4 !py-3 shadow-2xl flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <EyeOff size={18} /> : <Eye size={18} />}
        <span className="text-sm font-medium">预览效果</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-6 z-40 w-[520px] max-w-[calc(100vw-2rem)] max-h-[70vh] flex flex-col glass-panel border border-border shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #141626ee, #0e1026ee)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold">正则渲染预览</span>
                <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  {allScripts.length} 条脚本
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2 py-1 text-[10px] rounded-md transition-colors ${isEditing ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
                >
                  {isEditing ? '查看渲染' : '编辑文本'}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/30 transition-colors"
                  title="重置为自动生成文本"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={displayText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-full min-h-[300px] bg-transparent text-sm font-mono text-foreground p-4 resize-none outline-none leading-relaxed"
                  placeholder="在此输入或粘贴 AI 回复文本..."
                  spellCheck={false}
                />
              ) : (
                <div className="p-5">
                  <div className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    实时渲染 · 修改任意配置即可看到效果变化
                  </div>
                  <div
                    className="prose-preview"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: 'rgba(255, 255, 255, 0.85)',
                      letterSpacing: '0.3px',
                      wordBreak: 'break-word',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground flex-shrink-0">
              {isEditing ? '编辑完成后点击「查看渲染」查看效果' : '点击「编辑文本」可自定义测试文本 · 也可粘贴实际 AI 回复'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
