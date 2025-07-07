import '@testing-library/jest-dom';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  __esModule: true,
  X: jest.fn(() => 'X'),
  Check: jest.fn(() => 'Check'),
  AlertTriangle: jest.fn(() => 'AlertTriangle'),
  Info: jest.fn(() => 'Info'),
  GripVertical: jest.fn(() => 'GripVertical'),
  Trash2: jest.fn(() => 'Trash2'),
  Zap: jest.fn(() => 'Zap'),
  ArrowRight: jest.fn(() => 'ArrowRight'),
  Bot: jest.fn(() => 'Bot'),
  Network: jest.fn(() => 'Network'),
  FileText: jest.fn(() => 'FileText'),
  ListChecks: jest.fn(() => 'ListChecks'),
  Server: jest.fn(() => 'Server'),
  Map: jest.fn(() => 'Map'),
  MousePointerClick: jest.fn(() => 'MousePointerClick'),
  Settings: jest.fn(() => 'Settings'),
  ClipboardCheck: jest.fn(() => 'ClipboardCheck'),
  DraftingCompass: jest.fn(() => 'DraftingCompass'),
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Sarabun: () => ({
    variable: '--font-sans',
  }),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn(),
  }),
}));
