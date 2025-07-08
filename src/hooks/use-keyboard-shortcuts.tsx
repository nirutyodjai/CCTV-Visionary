
import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

export const defaultShortcuts: Shortcut[] = [];

export const ShortcutEventHandler = {
  on: (event: string, callback: () => void) => {
    // Dummy implementation for now
    return () => {};
  },
  off: (event: string, callback: () => void) => {
    // Dummy implementation for now
  }
};

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find((s) => {
        return (
          s.key === event.key &&
          s.ctrlKey === event.ctrlKey &&
          s.shiftKey === event.shiftKey
        );
      });

      if (shortcut) {
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
