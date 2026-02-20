import { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { SliderWithLabel } from '@/components/shared/SliderWithLabel';
import type { StatusField, GroupLayout } from '@/types';

const SAMPLE_VALUES: Record<string, string> = {
  '时间': '傍晚', '地点': '学校走廊', '服装': '校服', '心情': '开心',
  '生命值': '80', '魔力': '45', '体力': '60',
};

const LAYOUT_OPTIONS: { value: GroupLayout; label: string }[] = [
  { value: 'grid', label: '网格平铺' },
  { value: 'label', label: '左右标签式' },
  { value: 'compact', label: '紧凑标签式' },
  { value: 'highlight', label: '单字段高亮式' },
];

export const StatusPanelTab = () => {
  const { statusPanel, updateStatusPanel, addField, updateField, removeField, getGroupConfig, updateGroupConfig } = useAppStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (g: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  // Build ordered groups
  const groupFieldsMap = new Map<string, StatusField[]>();
  statusPanel.fields.forEach(f => {
    if (!groupFieldsMap.has(f.group)) groupFieldsMap.set(f.group, []);
    groupFieldsMap.get(f.group)!.push(f);
  });

  const orderedGroups: [string, StatusField[]][] = [];
  const order = statusPanel.groupOrder || [];
  order.forEach(g => {
    if (groupFieldsMap.has(g)) {
      orderedGroups.push([g, groupFieldsMap.get(g)!]);
      groupFieldsMap.delete(g);
    }
  });
  groupFieldsMap.forEach((gFields, g) => orderedGroups.push([g, gFields]));

  const moveGroup = (groupName: string, direction: -1 | 1) => {
    const currentOrder = orderedGroups.map(([g]) => g);
    const idx = currentOrder.indexOf(groupName);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;
    [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
    updateStatusPanel({ groupOrder: currentOrder });
  };

  const renderGroupPreview = (groupName: string, gFields: StatusField[], isLast: boolean) => {
    const gc = getGroupConfig(groupName);
    const cols = gc.columns > 0 ? gc.columns : statusPanel.columns;
    const layout = gc.layout;

    return (
      <div key={groupName} style={{ marginBottom: isLast ? 0 : 4 }}>
        {statusPanel.showGroupTitle && (
          <div style={{ fontWeight: 600, fontSize: 14, padding: '6px 8px', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', color: statusPanel.labelColor }}>
            {groupName}
          </div>
        )}

        {layout === 'label' ? (
          <div style={{ padding: '2px 0' }}>
            {gFields.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
                <span style={{ color: statusPanel.labelColor, fontSize: 13 }}>{f.name}</span>
                {f.type === 'badge' ? (
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: statusPanel.valueColor + '33', color: statusPanel.valueColor, fontSize: 12 }}>
                    {SAMPLE_VALUES[f.name] || '示例值'}
                  </span>
                ) : (
                  <span style={{ color: statusPanel.valueColor, fontSize: 14 }}>{SAMPLE_VALUES[f.name] || '示例值'}</span>
                )}
              </div>
            ))}
          </div>
        ) : layout === 'compact' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 8px' }}>
            {gFields.map(f => (
              <span key={f.id} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: statusPanel.valueColor + '22', color: statusPanel.valueColor, fontSize: 12 }}>
                {f.name}: {SAMPLE_VALUES[f.name] || '示例值'}
              </span>
            ))}
          </div>
        ) : layout === 'highlight' ? (
          <div>
            {gFields.map(f => (
              <div key={f.id} style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ color: statusPanel.labelColor, fontSize: 12, marginBottom: 4 }}>{f.name}</div>
                <div style={{ color: statusPanel.valueColor, fontSize: 22, fontWeight: 'bold' }}>{SAMPLE_VALUES[f.name] || '示例值'}</div>
              </div>
            ))}
          </div>
        ) : (
          // Grid (default)
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
            {gFields.map(f => (
              <div key={f.id} style={{ padding: '6px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: statusPanel.labelColor, marginBottom: 2 }}>{f.name}</div>
                {f.type === 'badge' ? (
                  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: statusPanel.valueColor + '33', color: statusPanel.valueColor, fontSize: 12 }}>
                    {SAMPLE_VALUES[f.name] || '示例值'}
                  </span>
                ) : f.type === 'progress' ? (
                  <div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{ width: '60%', height: '100%', borderRadius: 3, background: statusPanel.valueColor }} />
                    </div>
                    <span style={{ color: statusPanel.valueColor, fontSize: 11 }}>60%</span>
                  </div>
                ) : (
                  <span style={{ color: statusPanel.valueColor, fontSize: 14 }}>
                    {SAMPLE_VALUES[f.name] || '示例值'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!isLast && gc.showBorder && (
          <div style={{ width: '100%', borderBottom: '1px solid rgba(255,255,255,0.15)', margin: '4px 0' }} />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {/* Global settings */}
        <div className="glass-panel p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">面板标题</label>
            <input value={statusPanel.title} onChange={(e) => updateStatusPanel({ title: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">默认每行列数</label>
            <select value={statusPanel.columns} onChange={(e) => updateStatusPanel({ columns: Number(e.target.value) })} className="w-full bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}列</option>)}
            </select>
          </div>
          <ColorPicker label="背景颜色" value={statusPanel.bgColor} onChange={(v) => updateStatusPanel({ bgColor: v })} />
          <ColorPicker label="字段值颜色" value={statusPanel.valueColor} onChange={(v) => updateStatusPanel({ valueColor: v })} />
          <ColorPicker label="字段名颜色" value={statusPanel.labelColor} onChange={(v) => updateStatusPanel({ labelColor: v })} />
          <SliderWithLabel label="圆角" value={statusPanel.borderRadius} onChange={(v) => updateStatusPanel({ borderRadius: v })} min={0} max={24} unit="px" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={statusPanel.showBorder} onChange={(e) => updateStatusPanel({ showBorder: e.target.checked })} className="accent-primary" />
            显示边框
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={statusPanel.showGroupTitle} onChange={(e) => updateStatusPanel({ showGroupTitle: e.target.checked })} className="accent-primary" />
            显示分组标题
          </label>
        </div>

        {/* Group configs */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">分组配置</h4>
          {orderedGroups.map(([groupName, gFields], groupIdx) => {
            const gc = getGroupConfig(groupName);
            const isCollapsed = collapsedGroups.has(groupName);
            return (
              <div key={groupName} className="glass-panel p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleGroup(groupName)} className="p-0.5 text-muted-foreground hover:text-foreground">
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <span className="text-sm font-medium flex-1">{groupName}</span>
                  <span className="text-[10px] text-muted-foreground">{gFields.length}个字段</span>
                  <div className="flex gap-1">
                    <button onClick={() => moveGroup(groupName, -1)} disabled={groupIdx === 0} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
                    <button onClick={() => moveGroup(groupName, 1)} disabled={groupIdx === orderedGroups.length - 1} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-2 pl-5">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">列数</label>
                        <select value={gc.columns} onChange={(e) => updateGroupConfig(groupName, { columns: Number(e.target.value) })} className="w-full bg-input border border-border rounded-md px-2 py-1 text-xs text-foreground">
                          <option value={0}>跟随全局</option>
                          {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}列</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">布局</label>
                        <select value={gc.layout} onChange={(e) => updateGroupConfig(groupName, { layout: e.target.value as GroupLayout })} className="w-full bg-input border border-border rounded-md px-2 py-1 text-xs text-foreground">
                          {LAYOUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <input type="checkbox" checked={gc.showBorder} onChange={(e) => updateGroupConfig(groupName, { showBorder: e.target.checked })} className="accent-primary" />
                      分组间显示分隔线
                    </label>

                    {/* Fields in this group */}
                    {gFields.map(field => (
                      <div key={field.id} className="flex items-center gap-1.5">
                        <input value={field.name} onChange={(e) => updateField(field.id, { name: e.target.value })} className="flex-1 min-w-[60px] bg-input border border-border rounded-md px-2 py-0.5 text-xs text-foreground" placeholder="字段名" />
                        <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as any })} className="bg-input border border-border rounded-md px-1 py-0.5 text-[10px] text-foreground">
                          <option value="text">文本</option>
                          <option value="progress">进度条</option>
                          <option value="badge">标签</option>
                        </select>
                        <input value={field.group} onChange={(e) => updateField(field.id, { group: e.target.value })} className="w-16 bg-input border border-border rounded-md px-1 py-0.5 text-[10px] text-foreground" placeholder="分组" />
                        <button onClick={() => removeField(field.id)} className="p-0.5 hover:bg-destructive/20 text-destructive rounded-md"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={addField} className="w-full py-2 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-all text-sm">
            ➕ 添加字段
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
        <div className="glass-panel p-4" style={{ background: 'linear-gradient(180deg, #141626, #0e1026)' }}>
          <div style={{
            background: statusPanel.bgColor,
            borderRadius: statusPanel.borderRadius,
            border: statusPanel.showBorder ? `1px solid ${statusPanel.borderColor}` : 'none',
            padding: 12,
            color: statusPanel.labelColor,
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 12 }}>
              {statusPanel.title}
            </div>
            {orderedGroups.map(([groupName, gFields], i) =>
              renderGroupPreview(groupName, gFields, i === orderedGroups.length - 1)
            )}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-border">预览效果</div>
        </div>
      </div>
    </div>
  );
};
