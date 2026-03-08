import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: '导入后没有效果？',
    a: '1. 检查 SillyTavern 的「正则扩展」是否已开启\n2. 检查 AI 输出是否包含对应的标签格式（如 {角色名：内容}）\n3. 确认格式提示词已粘贴到角色卡中',
  },
  {
    q: '只有部分效果生效？',
    a: '确认格式提示词已完整粘贴，且 AI 确实在遵循格式输出。不同模型对格式的遵循程度不同，Claude 和 GPT-4 通常表现最好。',
  },
  {
    q: '想修改已导入的脚本？',
    a: '在本工具中调整配置后，重新导出 ZIP，然后在 SillyTavern 中删除旧脚本并导入新脚本即可。',
  },
  {
    q: '脚本顺序重要吗？',
    a: '非常重要！工具已自动按正确顺序排列：文字特效 → 对话气泡 → 段落分隔符 → 状态面板 → 翻页卡片。导入后请勿调整顺序。',
  },
  {
    q: '支持哪些酒馆版本？',
    a: '支持 SillyTavern 1.10+ 版本，需要正则扩展（Regex）功能已启用。',
  },
];

export const GuideTab = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">📖 使用说明</h2>
        <p className="text-sm text-muted-foreground">了解工具原理和导入方法，让美化效果顺利生效</p>
      </div>

      {/* Principle */}
      <section className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">🔧 工作原理</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          本工具的产出分为两部分，<span className="text-primary font-semibold">缺一不可</span>：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 space-y-2" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <h4 className="text-sm font-bold text-primary">正则脚本（JSON）</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>= 化妆师</strong>。它不改变 AI 说的内容，只改变「显示方式」。
              AI 输出 <code className="text-primary/80 font-mono bg-primary/10 px-1 rounded">{'{'}Seraphina：你好{'}'}</code> 这段文字后，
              正则脚本在浏览器端把它替换成带颜色、气泡、头像的 HTML。
            </p>
          </div>

          <div className="glass-panel p-4 space-y-2" style={{ borderColor: 'hsl(var(--accent) / 0.3)' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <h4 className="text-sm font-bold text-accent">格式提示词（TXT）</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>= 剧本</strong>。它告诉 AI「你要按这个格式写台词」，比如对话用
              <code className="text-accent/80 font-mono bg-accent/10 px-1 rounded">{'{'}角色名：内容{'}'}</code> 包裹，
              状态用标签包裹。如果 AI 不按格式输出，正则就匹配不到，美化不会生效。
            </p>
          </div>
        </div>

        <div className="text-center p-3 rounded-lg bg-muted/20">
          <p className="text-sm font-medium text-foreground">
            一句话总结：<span className="text-accent">提示词</span>让 AI 输出「原料」，<span className="text-primary">正则</span>把「原料」变成「成品」。
          </p>
        </div>
      </section>

      {/* Import steps */}
      <section className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">📥 导入酒馆步骤</h3>

        <div className="space-y-4">
          {[
            {
              step: 1,
              title: '导出文件',
              desc: '在「导出中心」标签页点击「全部导出 ZIP」',
              detail: '解压后得到两个文件：\n• sillytavern-regex-scripts.json — 正则脚本\n• format-prompt.txt — 格式提示词',
            },
            {
              step: 2,
              title: '导入正则脚本',
              desc: '打开 SillyTavern → 点击顶部扩展按钮 → 打开正则扩展（Regex）→ 导入 JSON 文件',
              detail: '导入后会看到脚本列表，工具已自动排好执行顺序：\n文字特效 → 对话气泡 → 段落分隔符 → 状态面板 → 翻页卡片',
            },
            {
              step: 3,
              title: '粘贴格式提示词',
              desc: '打开角色卡编辑 → 将 format-prompt.txt 的内容粘贴到「作者注释」或「系统提示」中',
              detail: '建议放在「作者注释（Author\'s Note）」中，这样每个角色卡可以有不同的格式配置。',
            },
            {
              step: 4,
              title: '测试效果',
              desc: '发送一条消息，检查 AI 回复是否正确显示美化样式',
              detail: '如果没有生效，请检查下方的「常见问题」部分。',
            },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {item.step}
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <pre className="text-xs text-muted-foreground/70 whitespace-pre-wrap leading-relaxed mt-1">{item.detail}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">❓ 常见问题</h3>

        <div className="space-y-2">
          {FAQ_LIST.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted/20 transition-colors"
              >
                <span className="font-medium text-foreground">{faq.q}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform shrink-0 ml-2 ${expandedFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-3">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{faq.a}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Re-trigger wizard */}
      <div className="text-center pb-8">
        <button
          onClick={() => {
            localStorage.removeItem('rtbs-welcomed');
            window.location.reload();
          }}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          🔄 重新运行新手向导
        </button>
      </div>
    </div>
  );
};
