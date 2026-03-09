import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { emoji: '✨', title: '{ emoji: '✨', title: '欢迎来到 Charm ST', desc: '这是一个可视化工具，帮助你为 SillyTavern 角色卡生成精美的正则美化脚本。\n无需编程知识！' },', desc: '这是一个可视化工具，帮助你为 SillyTavern 角色卡生成精美的正则美化脚本。\n无需编程知识！' },
  { emoji: '🎯', title: '简单三步完成', desc: '① 在各标签页中配置你想要的样式\n② 实时预览效果\n③ 一键导出 JSON 正则脚本' },
  { emoji: '🚀', title: '准备好了吗？', desc: '导出的脚本可直接导入 SillyTavern 使用。\n让我们开始美化你的角色卡吧！' },
];

export const WelcomeModal = () => {
  const [show, setShow] = useState(() => !localStorage.getItem('rtbs-welcomed'));
  const [step, setStep] = useState(0);

  const close = () => {
    localStorage.setItem('rtbs-welcomed', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="glass-panel p-8 max-w-md w-full text-center space-y-6"
          >
            <div className="text-5xl">{steps[step].emoji}</div>
            <h2 className="text-xl font-bold text-foreground">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{steps[step].desc}</p>

            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>

            <div className="flex justify-center gap-3">
              {step < 2 ? (
                <>
                  <button onClick={close} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">跳过</button>
                  <button onClick={() => setStep(step + 1)} className="glow-btn text-sm">下一步</button>
                </>
              ) : (
                <button onClick={close} className="glow-btn px-8 py-2.5 text-sm">开始使用 🎉</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
