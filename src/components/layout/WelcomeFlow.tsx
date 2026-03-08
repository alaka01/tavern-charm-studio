import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, SkipForward } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { GLOBAL_PRESETS, applyGlobalPreset } from '@/utils/globalPresets';
import type { TriggerFormat } from '@/types';

type Stage = 'welcome' | 'wizard';

const TRIGGER_OPTIONS: { value: TriggerFormat; label: string; example: string }[] = [
  { value: 'braces_cn', label: '{角色名：内容}', example: '{Seraphina：你好}' },
  { value: 'braces_en', label: '{角色名:内容}', example: '{Seraphina:Hello}' },
  { value: 'japanese', label: '角色名：「内容」', example: 'Seraphina：「你好」' },
  { value: 'cn_quotes', label: '角色名：\u201c内容\u201d', example: 'Seraphina：\u201c你好\u201d' },
];

export const WelcomeFlow = () => {
  const [show, setShow] = useState(() => !localStorage.getItem('rtbs-welcomed'));
  const [stage, setStage] = useState<Stage>('welcome');
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string>('warm-daily');
  const [charName, setCharName] = useState('');
  const [triggerFormat, setTriggerFormat] = useState<TriggerFormat>('braces_cn');

  const store = useAppStore();

  const close = useCallback(() => {
    localStorage.setItem('rtbs-welcomed', 'true');
    setShow(false);
  }, []);

  const startWizard = useCallback(() => {
    setStage('wizard');
    setWizardStep(0);
  }, []);

  const applyPreset = useCallback(() => {
    const preset = GLOBAL_PRESETS.find(p => p.key === selectedPreset);
    if (preset) {
      applyGlobalPreset(preset, store);
    }
  }, [selectedPreset, store]);

  const finishWizard = useCallback(() => {
    // Apply preset
    applyPreset();

    // Apply character name if provided
    if (charName.trim()) {
      const chars = store.characters;
      if (chars.length > 0) {
        store.updateCharacter(chars[0].id, {
          name: charName.trim(),
          triggerFormat,
        });
      }
    }

    close();
  }, [applyPreset, charName, triggerFormat, store, close]);

  const nextStep = useCallback(() => {
    if (wizardStep === 0) {
      applyPreset();
    }
    if (wizardStep < 2) {
      setWizardStep(wizardStep + 1);
    } else {
      finishWizard();
    }
  }, [wizardStep, applyPreset, finishWizard]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #141b2d 50%, #1a1040 100%)' }}
      >
        {stage === 'welcome' && <WelcomePage onStart={startWizard} onSkip={close} />}
        {stage === 'wizard' && (
          <WizardPage
            step={wizardStep}
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            charName={charName}
            onCharNameChange={setCharName}
            triggerFormat={triggerFormat}
            onTriggerFormatChange={setTriggerFormat}
            onNext={nextStep}
            onBack={() => setWizardStep(Math.max(0, wizardStep - 1))}
            onSkip={close}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── Welcome Page ─── */
function WelcomePage({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="max-w-3xl w-full mx-4 text-center space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          让酒馆对话变得更好看
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          本工具生成两样东西 —— <span className="text-primary font-medium">正则脚本</span>（控制显示样式）和
          <span className="text-accent font-medium">格式提示词</span>（告诉 AI 按什么格式输出），两者配合才能生效。
        </p>
      </div>

      {/* Before / After illustration */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        <div className="glass-panel p-5 w-full max-w-[280px] space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI 原始输出</div>
          <div className="text-left text-sm text-muted-foreground/70 font-mono leading-relaxed space-y-1.5">
            <p>{'{'}Seraphina：你好，欢迎来到这里。{'}'}</p>
            <p>*她微微一笑*</p>
            <p>时间: 傍晚 地点: 花园</p>
          </div>
        </div>

        <div className="text-2xl text-muted-foreground">→</div>

        <div className="glass-panel p-5 w-full max-w-[280px] space-y-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">美化后效果</div>
          <div className="text-left space-y-2">
            {/* Bubble preview */}
            <div style={{ padding: '8px 12px', borderLeft: '3px solid #f472b6', background: 'rgba(255,255,255,0.06)', borderRadius: '2px 8px 8px 2px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f472b6', marginBottom: 3 }}>Seraphina</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>你好，欢迎来到这里。</div>
            </div>
            {/* Italic text */}
            <div style={{ fontSize: 13, color: '#c4b5fd', fontStyle: 'italic', opacity: 0.8 }}>她微微一笑</div>
            {/* Status mini */}
            <div style={{ display: 'flex', gap: 12, fontSize: 11, padding: '6px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
              <span><span style={{ color: 'rgba(255,255,255,0.5)' }}>时间</span> <span style={{ color: '#f472b6' }}>傍晚</span></span>
              <span><span style={{ color: 'rgba(255,255,255,0.5)' }}>地点</span> <span style={{ color: '#f472b6' }}>花园</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <button onClick={onStart} className="glow-btn px-8 py-3 text-base gap-2">
          快速开始 <ArrowRight size={18} />
        </button>
        <button onClick={onSkip} className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
          我已了解，跳过 <SkipForward size={14} className="inline ml-1" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Wizard Page ─── */
interface WizardProps {
  step: number;
  selectedPreset: string;
  onSelectPreset: (key: string) => void;
  charName: string;
  onCharNameChange: (name: string) => void;
  triggerFormat: TriggerFormat;
  onTriggerFormatChange: (f: TriggerFormat) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

function WizardPage(props: WizardProps) {
  const { step, onNext, onBack, onSkip } = props;
  const steps = ['选风格', '填角色', '导出说明'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl w-full mx-4 flex flex-col h-[90vh] max-h-[800px]"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6 px-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
              i < step ? 'bg-primary text-primary-foreground' :
              i === step ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <StepStyle selectedPreset={props.selectedPreset} onSelectPreset={props.onSelectPreset} />}
            {step === 1 && <StepCharacter charName={props.charName} onCharNameChange={props.onCharNameChange} triggerFormat={props.triggerFormat} onTriggerFormatChange={props.onTriggerFormatChange} />}
            {step === 2 && <StepExport />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
        <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">跳过向导</button>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={onBack} className="glass-panel px-4 py-2 text-sm flex items-center gap-1.5 hover:border-primary transition-colors">
              <ArrowLeft size={14} /> 上一步
            </button>
          )}
          <button onClick={onNext} className="glow-btn px-6 py-2 text-sm">
            {step === 2 ? '完成并进入编辑器' : '下一步'} {step < 2 && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Step 1: Style Selection ─── */
function StepStyle({ selectedPreset, onSelectPreset }: { selectedPreset: string; onSelectPreset: (key: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground">选择一个整体风格</h2>
        <p className="text-sm text-muted-foreground mt-1">一键应用对话气泡 + 状态面板 + 文字特效 + 翻页排版的完整配置</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GLOBAL_PRESETS.map(preset => {
          const active = selectedPreset === preset.key;
          return (
            <button
              key={preset.key}
              onClick={() => onSelectPreset(preset.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                active
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]'
                  : 'border-border bg-muted/10 hover:border-muted-foreground/30 hover:bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{preset.emoji}</span>
                <span className={`font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{preset.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>

              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden" style={{ background: preset.flipCard.typography?.frontBg || '#1a1a2e' }}>
                <div className="p-3 space-y-1.5">
                  {/* Mini bubble */}
                  <div style={{
                    borderLeft: `3px solid ${preset.dialog.themeColor}`,
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '2px 6px 6px 2px',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: preset.dialog.themeColor }}>角色名</div>
                    <div className="h-[3px] w-[70%] rounded-full mt-1" style={{ background: `${preset.dialog.textColor || 'rgba(255,255,255,0.3)'}` }} />
                  </div>
                  {/* Mini text lines */}
                  <div className="space-y-1 pt-1">
                    <div className="h-[2px] w-[85%] rounded-full" style={{ background: preset.flipCard.typography?.textColor?.toString().replace(/[\d.]+\)$/, '0.25)') || 'rgba(255,255,255,0.2)' }} />
                    <div className="h-[2px] w-[60%] rounded-full" style={{ background: preset.flipCard.typography?.textColor?.toString().replace(/[\d.]+\)$/, '0.15)') || 'rgba(255,255,255,0.15)' }} />
                  </div>
                  {/* Mini status */}
                  <div className="flex gap-1 pt-1">
                    {[1,2].map(i => (
                      <div key={i} className="flex-1 rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-[2px] w-[50%] rounded-full" style={{ background: preset.statusPanel.valueColor + '60' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {preset.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{tag}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 2: Character Info ─── */
function StepCharacter({ charName, onCharNameChange, triggerFormat, onTriggerFormatChange }: {
  charName: string; onCharNameChange: (n: string) => void;
  triggerFormat: TriggerFormat; onTriggerFormatChange: (f: TriggerFormat) => void;
}) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground">填写角色信息</h2>
        <p className="text-sm text-muted-foreground mt-1">输入主角色名，其他参数已从风格预设继承</p>
      </div>

      <div className="glass-panel p-5 space-y-5">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block font-medium">角色名</label>
          <input
            value={charName}
            onChange={e => onCharNameChange(e.target.value)}
            placeholder="例如：Seraphina"
            className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1.5">留空则使用默认名称，进入编辑器后可随时修改</p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block font-medium">对话触发格式</label>
          <div className="space-y-2">
            {TRIGGER_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  triggerFormat === opt.value
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <input
                  type="radio"
                  name="trigger"
                  checked={triggerFormat === opt.value}
                  onChange={() => onTriggerFormatChange(opt.value)}
                  className="accent-primary"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground font-mono">{opt.example}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Export & Usage ─── */
function StepExport() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground">🎉 配置完成！</h2>
        <p className="text-sm text-muted-foreground mt-1">进入编辑器后，可在「导出中心」导出脚本</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground">导入酒馆的步骤：</h4>
        <div className="space-y-3">
          {[
            { step: '1', text: '在「导出中心」点击「全部导出 ZIP」', sub: '解压得到 JSON 正则脚本 + TXT 格式提示词' },
            { step: '2', text: '打开 SillyTavern → 扩展 → 正则（Regex）', sub: '导入 JSON 文件，确认脚本列表顺序正确' },
            { step: '3', text: '打开角色卡编辑 → 粘贴格式提示词', sub: '放入「作者注释」或「系统提示」中' },
            { step: '4', text: '发送一条消息测试效果', sub: '确认美化生效，如未生效请查看使用说明' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <div className="text-sm text-foreground">{item.text}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">💡 原理简述</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-primary font-medium">正则脚本</span> = 化妆师，在浏览器端把 AI 输出的标记文本替换成 HTML 样式。
          <span className="text-accent font-medium">格式提示词</span> = 剧本，告诉 AI 按指定格式写对话和状态。两者缺一不可。
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        进入编辑器后，可在导航栏找到「📖 使用说明」查看详细教程
      </p>
    </div>
  );
}
