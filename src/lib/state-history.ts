/**
 * Advanced Undo/Redo System for CCTV Planner
 * Supports branching history and selective undo operations
 */

export interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  state: any;
  action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect';
  metadata?: {
    deviceType?: string;
    deviceId?: string;
    operation?: string;
  };
}

export interface HistoryBranch {
  id: string;
  name: string;
  entries: HistoryEntry[];
  createdAt: number;
}

export class StateHistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private branches: HistoryBranch[] = [];
  private currentBranch: string = 'main';
  private maxHistorySize: number = 50;
  private skipNext: boolean = false;

  /**
   * Add a new state to history
   */
  pushState(
    state: any, 
    description: string, 
    action: HistoryEntry['action'],
    metadata?: HistoryEntry['metadata']
  ): void {
    if (this.skipNext) {
      this.skipNext = false;
      return;
    }

    // Remove any entries after current index (when user undoes then makes new changes)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Create new history entry
    const entry: HistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      description,
      state: this.deepClone(state),
      action,
      metadata
    };

    // Add to history
    this.history.push(entry);
    this.currentIndex++;

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    // Auto-save to localStorage for persistence
    this.saveToStorage();
  }

  /**
   * Undo last action
   */
  undo(): any | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    const entry = this.history[this.currentIndex];
    
    // Mark next state change to be skipped (to avoid recording undo as new action)
    this.skipNext = true;
    
    return this.deepClone(entry.state);
  }

  /**
   * Redo last undone action
   */
  redo(): any | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const entry = this.history[this.currentIndex];
    
    // Mark next state change to be skipped
    this.skipNext = true;
    
    return this.deepClone(entry.state);
  }

  /**
   * Get description of last undo operation
   */
  getLastUndoDescription(): string {
    if (this.canUndo()) {
      return this.history[this.currentIndex - 1].description;
    }
    return '';
  }

  /**
   * Get description of last redo operation
   */
  getLastRedoDescription(): string {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description;
    }
    return '';
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history entry
   */
  getCurrentEntry(): HistoryEntry | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get history summary for UI
   */
  getHistorySummary(): {
    canUndo: boolean;
    canRedo: boolean;
    undoDescription?: string;
    redoDescription?: string;
    totalEntries: number;
    currentIndex: number;
  } {
    const canUndo = this.canUndo();
    const canRedo = this.canRedo();
    
    return {
      canUndo,
      canRedo,
      undoDescription: canUndo ? this.history[this.currentIndex].description : undefined,
      redoDescription: canRedo ? this.history[this.currentIndex + 1].description : undefined,
      totalEntries: this.history.length,
      currentIndex: this.currentIndex
    };
  }

  /**
   * Get recent history for display
   */
  getRecentHistory(limit: number = 10): HistoryEntry[] {
    const start = Math.max(0, this.currentIndex - limit + 1);
    const end = this.currentIndex + 1;
    return this.history.slice(start, end).reverse();
  }

  /**
   * Create a new branch from current state
   */
  createBranch(name: string): string {
    const branchId = `branch_${Date.now()}`;
    const currentState = this.getCurrentEntry()?.state;
    
    const newBranch: HistoryBranch = {
      id: branchId,
      name,
      entries: currentState ? [this.history[this.currentIndex]] : [],
      createdAt: Date.now()
    };

    this.branches.push(newBranch);
    return branchId;
  }

  /**
   * Switch to a different branch
   */
  switchBranch(branchId: string): boolean {
    const branch = this.branches.find(b => b.id === branchId);
    if (!branch) return false;

    // Save current branch
    this.saveBranch();
    
    // Load new branch
    this.history = [...branch.entries];
    this.currentIndex = this.history.length - 1;
    this.currentBranch = branchId;
    
    return true;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.branches = [];
    this.currentBranch = 'main';
    this.saveToStorage();
  }

  /**
   * Get specific state by index
   */
  getStateAtIndex(index: number): any | null {
    if (index >= 0 && index < this.history.length) {
      return this.deepClone(this.history[index].state);
    }
    return null;
  }

  /**
   * Jump to specific history entry
   */
  jumpToEntry(entryId: string): { state: any; description: string } | null {
    const index = this.history.findIndex(entry => entry.id === entryId);
    if (index === -1) return null;

    this.currentIndex = index;
    this.skipNext = true;
    
    const entry = this.history[index];
    return {
      state: this.deepClone(entry.state),
      description: `Jumped to: ${entry.description}`
    };
  }

  /**
   * Save current branch to branches array
   */
  private saveBranch(): void {
    const existingBranch = this.branches.find(b => b.id === this.currentBranch);
    if (existingBranch) {
      existingBranch.entries = [...this.history];
    }
  }

  /**
   * Deep clone object to prevent reference issues
   */
  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned: any = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
    return obj;
  }

  /**
   * Save to localStorage for persistence
   */
  private saveToStorage(): void {
    try {
      const data = {
        history: this.history,
        currentIndex: this.currentIndex,
        branches: this.branches,
        currentBranch: this.currentBranch
      };
      localStorage.setItem('cctv_planner_history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): boolean {
    try {
      const data = localStorage.getItem('cctv_planner_history');
      if (!data) return false;

      const parsed = JSON.parse(data);
      this.history = parsed.history || [];
      this.currentIndex = parsed.currentIndex ?? -1;
      this.branches = parsed.branches || [];
      this.currentBranch = parsed.currentBranch || 'main';
      
      return true;
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
      return false;
    }
  }

  /**
   * Get storage stats
   */
  getStorageStats(): {
    historySize: number;
    branchCount: number;
    storageUsed: string;
  } {
    const data = {
      history: this.history,
      branches: this.branches
    };
    
    const sizeInBytes = new Blob([JSON.stringify(data)]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      historySize: this.history.length,
      branchCount: this.branches.length,
      storageUsed: `${sizeInKB} KB`
    };
  }

  /**
   * Get current history entries
   */
  getHistory(): HistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get statistics for UI
   */
  getStats(): {
    totalEntries: number;
    actionTypes: Record<string, number>;
    currentPosition: number;
  } {
    const actionTypes: Record<string, number> = {};
    
    this.history.forEach(entry => {
      actionTypes[entry.action] = (actionTypes[entry.action] || 0) + 1;
    });

    return {
      totalEntries: this.history.length,
      actionTypes,
      currentPosition: this.currentIndex + 1
    };
  }
}
