import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Helper Icons (Apple SF Symbols inspired) ---
const Icon = ({ children, className = "" }) => <div className={`h-6 w-6 flex items-center justify-center ${className}`}>{children}</div>;
const GripVertical = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg></Icon>;
const Plus = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></Icon>;
const Trash2 = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></Icon>;
const ChevronDown = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"/></svg></Icon>;
const Save = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></Icon>;
const Share2 = (props) => <Icon><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></Icon>;

// --- Block Data Definitions ---
const BLOCK_TYPES = { SOURCE: 'Source', FILTER: 'Filter', ACTION: 'Action' };
const BLOCK_DEFINITIONS = {
  [BLOCK_TYPES.SOURCE]: { label: 'Source', options: ['LinkedIn Sales Navigator', 'WARN Act Database', 'Google Search'], defaultConfig: { provider: 'LinkedIn Sales Navigator' }, color: 'blue' },
  [BLOCK_TYPES.FILTER]: { label: 'Filter', options: ['Job Title', 'Location', 'Industry', 'Layoff Date'], defaultConfig: { field: 'Job Title', value: '' }, color: 'green' },
  [BLOCK_TYPES.ACTION]: { label: 'Action', options: ['Scrape Contacts', 'Summarize Results', 'Export to CSV'], defaultConfig: { task: 'Scrape Contacts' }, color: 'purple' },
};
const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
};

let nextId = 1;

// --- Collapsible Block Component ---
const Block = ({ block, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto' };
  const definition = BLOCK_DEFINITIONS[block.type];
  const colors = colorMap[definition.color];

  const handleConfigChange = (key, value) => onUpdate(block.id, { ...block.config, [key]: value });
  
  const summary = useMemo(() => {
    if (block.type === BLOCK_TYPES.SOURCE) return block.config.provider;
    if (block.type === BLOCK_TYPES.FILTER) return `${block.config.field} is "${block.config.value || '...'}"`;
    if (block.type === BLOCK_TYPES.ACTION) return block.config.task;
    return '';
  }, [block.config, block.type]);

  return (
    <div ref={setNodeRef} style={style} className={`relative rounded-xl border ${colors.border} ${colors.bg} shadow-sm transition-all duration-300 mb-3`}>
      <div className="flex items-center p-3">
        <button {...attributes} {...listeners} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg cursor-grab active:cursor-grabbing"><GripVertical /></button>
        <div className="flex-grow ml-2" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center">
            <span className={`font-semibold ${colors.text}`}>{definition.label}</span>
            {!isExpanded && <span className="ml-3 text-gray-600 truncate">: {summary}</span>}
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}><ChevronDown /></button>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200/50">
          {block.type === BLOCK_TYPES.SOURCE && <select value={block.config.provider} onChange={(e) => handleConfigChange('provider', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white"><option disabled>Select a source...</option>{definition.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
          {block.type === BLOCK_TYPES.FILTER && <div className="flex gap-2"><select value={block.config.field} onChange={(e) => handleConfigChange('field', e.target.value)} className="p-2 border border-gray-300 rounded-md bg-white"><option disabled>Select a field...</option>{definition.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><input type="text" value={block.config.value} onChange={(e) => handleConfigChange('value', e.target.value)} placeholder="Enter value..." className="flex-grow p-2 border border-gray-300 rounded-md bg-white" /></div>}
          {block.type === BLOCK_TYPES.ACTION && <select value={block.config.task} onChange={(e) => handleConfigChange('task', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white"><option disabled>Select an action...</option>{definition.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
          <button onClick={() => onDelete(block.id)} className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"><Trash2 className="h-3 w-3"/> Remove Block</button>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function SolutionCanvas() {
  const [missionName, setMissionName] = useState('SoCal Tech Layoff Analysis');
  const [blocks, setBlocks] = useState([
    { id: `block-${nextId++}`, type: BLOCK_TYPES.SOURCE, config: BLOCK_DEFINITIONS[BLOCK_TYPES.SOURCE].defaultConfig },
    { id: `block-${nextId++}`, type: BLOCK_TYPES.FILTER, config: { ...BLOCK_DEFINITIONS[BLOCK_TYPES.FILTER].defaultConfig, field: 'Location', value: 'California' } },
    { id: `block-${nextId++}`, type: BLOCK_TYPES.FILTER, config: { ...BLOCK_DEFINITIONS[BLOCK_TYPES.FILTER].defaultConfig, field: 'Job Title', value: 'Software Engineer' } },
    { id: `block-${nextId++}`, type: BLOCK_TYPES.ACTION, config: { ...BLOCK_DEFINITIONS[BLOCK_TYPES.ACTION].defaultConfig, task: 'Scrape Contacts' } },
  ]);
  const [outputJson, setOutputJson] = useState('');
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const blockIds = useMemo(() => blocks.map(b => b.id), [blocks]);
  
  const addBlock = (type) => setBlocks(prev => [...prev, { id: `block-${nextId++}`, type, config: BLOCK_DEFINITIONS[type].defaultConfig }]);
  const updateBlock = useCallback((id, newConfig) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, config: newConfig } : b)), []);
  const deleteBlock = useCallback((id) => setBlocks(prev => prev.filter(b => b.id !== id)), []);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(item => item.id === active.id);
      const newIndex = blocks.findIndex(item => item.id === over.id);
      setBlocks(items => arrayMove(items, oldIndex, newIndex));
    }
  };
  
  const handleExecute = useCallback(() => {
      setOutputJson(JSON.stringify({ missionName, blocks: blocks.map(({ id, ...rest }) => rest) }, null, 2));
  }, [missionName, blocks]);

  useEffect(() => {
    handleExecute();
  }, [blocks, missionName, handleExecute]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row">
        {/* Main Canvas */}
        <main className="w-full md:w-2/3 p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">VLTRN Workspace</h1>
            <input type="text" value={missionName} onChange={(e) => setMissionName(e.target.value)} className="w-full text-lg p-2 mt-2 bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none transition-colors" placeholder="e.g., SoCal Tech Layoff Analysis"/>
          </header>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blockIds}>
              {blocks.map(block => <Block key={block.id} block={block} onUpdate={updateBlock} onDelete={deleteBlock} />)}
            </SortableContext>
          </DndContext>

          <div className="mt-6 flex items-center justify-start gap-2">
            {Object.entries(BLOCK_TYPES).map(([key, type]) => (
              <button key={key} onClick={() => addBlock(type)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border ${colorMap[BLOCK_DEFINITIONS[type].color].border} ${colorMap[BLOCK_DEFINITIONS[type].color].bg} ${colorMap[BLOCK_DEFINITIONS[type].color].text} hover:opacity-80`}>
                <Plus className="h-4 w-4"/> Add {BLOCK_DEFINITIONS[type].label}
              </button>
            ))}
          </div>
        </main>

        {/* Sidebar / Output Panel */}
        <aside className="w-full md:w-1/3 bg-white border-l border-gray-200 p-6 md:p-8 md:sticky md:top-0 md:h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Mission Blueprint</h2>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"><Save/></button>
                    <button className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"><Share2/></button>
                </div>
            </div>
            <div className="bg-gray-900 text-white p-4 rounded-lg h-[calc(100vh-200px)] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap break-all">{outputJson}</pre>
            </div>
             <button onClick={handleExecute} className="w-full mt-6 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Execute Mission
            </button>
        </aside>
      </div>
    </div>
  );
} 