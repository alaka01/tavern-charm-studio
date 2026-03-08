import { useState, useCallback } from 'react';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { SliderWithLabel } from '@/components/shared/SliderWithLabel';
import type { StatusField, GroupLayout } from '@/types';

export const DEFAULT_SAMPLE_VALUES: Record<string, string> = {
  '时间': '傍晚', '地点': '学校走廊', '服装': '校服', '心情': '开心',
  '生命值': '80', '魔力': '45', '体力': '60', '金币': '120',
  '装备': '铁剑', '状态': '正常', '技能': '火球术',
};

/** Inline-editable value cell for preview */
function EditableValue({ fieldName, value, color, fontSize, style, sampleValues, onUpdate }: {
  fieldName: string; value: string; color: string; fontSize: number;
  style?: React.CSSProperties; sampleValues: Record<string, string>;
  onUpdate: (name: string, val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = useCallback(() => {
    setEditing(false);
    onUpdate(fieldName, draft);
  }, [fieldName, draft, onUpdate]);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && commit()}
        style={{ ...style, color, fontSize, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '1px 4px', outline: 'none', width: '100%', textAlign: 'inherit' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => { setDraft(value); setEditing(true); }}
      style={{ ...style, color, fontSize, cursor: 'default' }}
      title="双击编辑示例值"
    >
      {value}
    </span>
  );
}

const LAYOUT_OPTIONS: { value: GroupLayout; label: string }[] = [
  { value: 'grid', label: '网格平铺' },
  { value: 'label', label: '左右标签式' },
  { value: 'compact', label: '紧凑标签式' },
  { value: 'highlight', label: '单字段高亮式' },
];

const QUICK_TEMPLATES = [
  {
    name: '🎮 RPG 冒险',
    fields: [
      { name: '生命值', type: 'progress' as const, group: '战斗属性' },
      { name: '魔力', type: 'progress' as const, group: '战斗属性' },
      { name: '体力', type: 'progress' as const, group: '战斗属性' },
      { name: '金币', type: 'text' as const, group: '物品' },
      { name: '装备', type: 'text' as const, group: '物品' },
      { name: '状态', type: 'badge' as const, group: '状态' },
    ],
  },
  {
    name: '🏫 校园日常',
    fields: [
      { name: '时间', type: 'text' as const, group: '基本信息' },
      { name: '地点', type: 'text' as const, group: '基本信息' },
      { name: '心情', type: 'badge' as const, group: '状态' },
      { name: '服装', type: 'text' as const, group: '外观' },
    ],
  },
  {
    name: '🧙 奇幻世界',
    fields: [
      { name: '时间', type: 'text' as const, group: '环境' },
      { name: '地点', type: 'text' as const, group: '环境' },
      { name: '装备', type: 'text' as const, group: '装备' },
      { name: '状态', type: 'badge' as const, group: '角色状态' },
      { name: '技能', type: 'text' as const, group: '角色状态' },
    ],
  },
];

export const StatusPanelTab = () => {
  const { statusPanel, updateStatusPanel, addField, updateField, removeField, getGroupConfig, updateGroupConfig } = useAppStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  const [sampleValues, setSampleValues] = useState<Record<string, string>>({ ...DEFAULT_SAMPLE_VALUES });

  const updateSampleValue = useCallback((name: string, val: string) => {
    setSampleValues(prev => ({ ...prev, [name]: val }));
  }, []);

  const getSample = (name: string) => sampleValues[name] || DEFAULT_SAMPLE_VALUES[name] || '示例值';

  const toggleGroup = (g: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    const fields = template.fields.map(f => ({
      id: crypto.randomUUID(),
      ...f,
    }));
    const groups = [...new Set(fields.map(f => f.group))];
    updateStatusPanel({ fields, groupOrder: groups });
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
                  <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={12} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: statusPanel.valueColor + '33' }} sampleValues={sampleValues} onUpdate={updateSampleValue} />
                ) : (
                  <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={14} sampleValues={sampleValues} onUpdate={updateSampleValue} />
                )}
              </div>
            ))}
          </div>
        ) : layout === 'compact' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 8px' }}>
            {gFields.map(f => (
              <span key={f.id} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: statusPanel.valueColor + '22', color: statusPanel.valueColor, fontSize: 12 }}>
                {f.name}: <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={12} sampleValues={sampleValues} onUpdate={updateSampleValue} />
              </span>
            ))}
          </div>
        ) : layout === 'highlight' ? (
          <div>
            {gFields.map(f => (
              <div key={f.id} style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ color: statusPanel.labelColor, fontSize: 12, marginBottom: 4 }}>{f.name}</div>
                <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={22} style={{ fontWeight: 'bold' }} sampleValues={sampleValues} onUpdate={updateSampleValue} />
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
                  <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={12} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: statusPanel.valueColor + '33' }} sampleValues={sampleValues} onUpdate={updateSampleValue} />
                ) : f.type === 'progress' ? (
                  <div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{ width: '60%', height: '100%', borderRadius: 3, background: statusPanel.valueColor }} />
                    </div>
                    <span style={{ color: statusPanel.valueColor, fontSize: 11 }}>60%</span>
                  </div>
                ) : (
                  <EditableValue fieldName={f.name} value={getSample(f.name)} color={statusPanel.valueColor} fontSize={14} sampleValues={sampleValues} onUpdate={updateSampleValue} />
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
        {/* Quick templates */}
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">快速模板</h4>
          <div className="flex gap-2 flex-wrap">
            {QUICK_TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => applyTemplate(t)}
                className="preset-btn"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Panel title */}
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
        </div>

        {/* Style settings - collapsed */}
        <div className="glass-panel p-4">
          <button
            onClick={() => setShowStyleSettings(!showStyleSettings)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showStyleSettings ? 'rotate-0' : '-rotate-90'}`} />
            样式设置
            <span className="text-[10px] ml-1 opacity-60">可选 · 不调整也能正常使用</span>
          </button>
          {showStyleSettings && (
            <div className="space-y-3 pt-3">
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
          )}
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

                    {/* Fields - compact inline */}
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
          <div className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-border">预览效果 · 双击字段值可编辑</div>
        </div>
      </div>
    </div>
  );
};
