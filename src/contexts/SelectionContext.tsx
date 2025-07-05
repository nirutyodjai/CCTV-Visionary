'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { SelectableItem } from '@/lib/types';

type SelectionContextType = {
  selectedItem: SelectableItem | null;
  setSelectedItem: (item: SelectableItem | null) => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);

  return (
    <SelectionContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextType {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
