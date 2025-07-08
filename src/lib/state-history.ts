
import type { ProjectState } from './types';

export interface HistoryItem {
  state: ProjectState;
  description: string;
  action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect';
  metadata?: any;
}

export class StateHistoryManager {
  clearHistory() {
      throw new Error('Method not implemented.');
  }
  private history: HistoryItem[] = [];
  private currentIndex: number = -1;

  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  pushState(
    state: ProjectState, 
    description: string, 
    action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect', 
    metadata?: any
  ) {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push({ state, description, action, metadata });
    this.currentIndex++;
  }

  undo(): ProjectState | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex].state;
    }
    return null;
  }

  redo(): ProjectState | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex].state;
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getHistory(): HistoryItem[] {
    return this.history;
  }

  getLastUndoDescription(): string {
    if (this.currentIndex >= 0 && this.history.length > this.currentIndex + 1) {
      return this.history[this.currentIndex + 1].description;
    }
    return '';
  }

  getLastRedoDescription(): string {
    if (this.currentIndex < this.history.length && this.history[this.currentIndex]) {
      return this.history[this.currentIndex].description;
    }
    return '';
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}
