import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { WelcomeModal } from '@/components/layout/WelcomeModal';
import { DialogBubbleTab } from '@/components/tabs/DialogBubbleTab';
import { StatusPanelTab } from '@/components/tabs/StatusPanelTab';
import { TextEffectTab } from '@/components/tabs/TextEffectTab';
import { FlipCardTab } from '@/components/tabs/FlipCardTab';
import { FormatPromptTab } from '@/components/tabs/FormatPromptTab';
import { ExportCenter } from '@/components/tabs/ExportCenter';
import { RegexPreviewPanel } from '@/components/shared/RegexPreviewPanel';
import { useAppStore } from '@/stores/useAppStore';

const TAB_COMPONENTS = {
  dialog: DialogBubbleTab,
  status: StatusPanelTab,
  textEffect: TextEffectTab,
  flipCard: FlipCardTab,
  formatPrompt: FormatPromptTab,
  export: ExportCenter,
} as const;

const Index = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <WelcomeModal />
      <Header />
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <TabComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <RegexPreviewPanel />
    </div>
  );
};

export default Index;
