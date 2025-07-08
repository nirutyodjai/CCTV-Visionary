'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

/**
 * Enhanced Keyboard Shortcuts Hook
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[] = []) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.metaKey === !!shortcut.metaKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    shortcuts,
    addShortcut: (shortcut: KeyboardShortcut) => {
      shortcuts.push(shortcut);
    }
  };
}

/**
 * Default shortcuts for CCTV Planner
 */
export const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 's',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('save-project'));
    },
    description: 'Save project'
  },
  {
    key: 'z',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('undo'));
    },
    description: 'Undo last action'
  },
  {
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('redo'));
    },
    description: 'Redo last action'
  },
  {
    key: 'y',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('redo'));
    },
    description: 'Redo last action (alternative)'
  },
  {
    key: 'Delete',
    action: () => {
      document.dispatchEvent(new CustomEvent('delete-selected'));
    },
    description: 'Delete selected item'
  },
  {
    key: 'Backspace',
    action: () => {
      document.dispatchEvent(new CustomEvent('delete-selected'));
    },
    description: 'Delete selected item (alternative)'
  },
  {
    key: 'Escape',
    action: () => {
      document.dispatchEvent(new CustomEvent('cancel-action'));
    },
    description: 'Cancel current action'
  },
  {
    key: 'Enter',
    action: () => {
      document.dispatchEvent(new CustomEvent('confirm-action'));
    },
    description: 'Confirm current action'
  },
  {
    key: 'a',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('select-all'));
    },
    description: 'Select all items'
  },
  {
    key: 'c',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('copy-selected'));
    },
    description: 'Copy selected items'
  },
  {
    key: 'v',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('paste-items'));
    },
    description: 'Paste items'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('find-items'));
    },
    description: 'Find items'
  },
  {
    key: '=',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('zoom-in'));
    },
    description: 'Zoom in'
  },
  {
    key: '-',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('zoom-out'));
    },
    description: 'Zoom out'
  },
  {
    key: '0',
    ctrlKey: true,
    action: () => {
      document.dispatchEvent(new CustomEvent('zoom-reset'));
    },
    description: 'Reset zoom'
  }
];

/**
 * Display shortcuts help
 */
export function getShortcutsHelp(shortcuts: KeyboardShortcut[] = defaultShortcuts): string {
  return shortcuts.map(shortcut => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.metaKey) keys.push('Cmd');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    keys.push(shortcut.key);
    
    return `${keys.join(' + ')}: ${shortcut.description}`;
  }).join('\n');
}

/**
 * Custom event handlers for shortcuts
 */
export class ShortcutEventHandler {
  private static listeners = new Map<string, () => void>();

  static on(eventName: string, handler: () => void) {
    this.listeners.set(eventName, handler);
    
    document.addEventListener(eventName, handler);
    
    return () => {
      document.removeEventListener(eventName, handler);
      this.listeners.delete(eventName);
    };
  }

  static off(eventName: string) {
    const handler = this.listeners.get(eventName);
    if (handler) {
      document.removeEventListener(eventName, handler);
      this.listeners.delete(eventName);
    }
  }

  static trigger(eventName: string, data?: any) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
}
