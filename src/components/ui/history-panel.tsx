
import React from 'react';
import type { StateHistoryManager, HistoryItem } from '@/lib/state-history';

interface HistoryPanelProps {
  historyManager: StateHistoryManager;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ historyManager, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">History</h3>
      <div className="flex space-x-2">
        <button onClick={onUndo} disabled={!canUndo} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">Undo</button>
        <button onClick={onRedo} disabled={!canRedo} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">Redo</button>
      </div>
      <ul className="mt-4 space-y-2">
        {historyManager.getHistory().map((item: HistoryItem, index: number) => (
          <li key={index} className="text-sm text-gray-700">{item.description}</li>
        ))}
      </ul>
    </div>
  );
};
