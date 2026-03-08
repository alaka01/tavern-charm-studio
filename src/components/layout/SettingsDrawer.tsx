import { useState } from 'react';
import { Settings, RotateCcw, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export const SettingsDrawer = () => {
  const { resetToDefaults, exportConfig, importConfig } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetToDefaults();
    setConfirmReset(false);
    toast.success('已重置为默认配置');
  };

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tavern-charm-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('配置已导出');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const ok = importConfig(text);
        if (ok) toast.success('配置已导入');
        else toast.error('导入失败：JSON 格式无效');
      } catch {
        toast.error('导入失败：无法读取文件');
      }
    };
    input.click();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="设置">
          <Settings size={16} />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>⚙️ 设置</DrawerTitle>
          <DrawerDescription>管理你的工作室配置</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2 space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
          >
            <Download size={16} className="text-primary" />
            <div className="text-left">
              <div className="font-medium">导出配置</div>
              <div className="text-xs text-muted-foreground">保存当前所有设置为 JSON 文件</div>
            </div>
          </button>
          <button
            onClick={handleImport}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-sm"
          >
            <Upload size={16} className="text-primary" />
            <div className="text-left">
              <div className="font-medium">导入配置</div>
              <div className="text-xs text-muted-foreground">从 JSON 文件恢复设置</div>
            </div>
          </button>
          <button
            onClick={handleReset}
            onBlur={() => setConfirmReset(false)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-sm ${
              confirmReset ? 'bg-destructive/20 border border-destructive/40' : 'bg-muted/30 hover:bg-muted/50'
            }`}
          >
            <RotateCcw size={16} className={confirmReset ? 'text-destructive' : 'text-muted-foreground'} />
            <div className="text-left">
              <div className={`font-medium ${confirmReset ? 'text-destructive' : ''}`}>
                {confirmReset ? '再次点击确认重置' : '重置为默认配置'}
              </div>
              <div className="text-xs text-muted-foreground">
                {confirmReset ? '此操作不可撤销' : '将所有设置恢复为初始状态'}
              </div>
            </div>
          </button>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">关闭</button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
