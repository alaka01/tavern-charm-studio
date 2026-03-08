import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { SettingsDrawer } from '@/components/layout/SettingsDrawer';
import { FullPreviewOverlay } from '@/components/shared/FullPreviewOverlay';
import type { TabId } from '@/types';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'dialog', icon: '🎨', label: '对话气泡' },
  { id: 'status', icon: '📊', label: '状态面板' },
  { id: 'textEffect', icon: '✨', label: '文字特效' },
  { id: 'flipCard', icon: '📑', label: '翻页卡片' },
  { id: 'formatPrompt', icon: '📝', label: '格式提示词' },
  { id: 'regexTest', icon: '🧪', label: '正则测试' },
  { id: 'export', icon: '📦', label: '导出中心' },
  { id: 'guide', icon: '📖', label: '使用说明' },
];

export const Header = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          <h1 className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden md:block whitespace-nowrap">
            酒馆正则美化工作室
          </h1>
          <nav className="flex gap-0.5 overflow-x-auto flex-1 scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(187 100% 50%), hsl(271 91% 65%))' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
          <FullPreviewOverlay />
          <SettingsDrawer />
        </div>
      </div>
    </header>
  );
};
