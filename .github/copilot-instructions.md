# CCTV Visionary - AI Coding Agent Instructions

## 🚨 AI COORDINATION PROTOCOL - READ FIRST

### Change Tracking & Coordination System
**MANDATORY**: Before making ANY changes, check this section for recent modifications and ongoing work.

#### Recent Modifications Log
```
📅 2025-07-13 21:15 UTC+7
🤖 Agent: GitHub Copilot (nirutyodjai)
📁 Action: Created .github/copilot-instructions.md
📝 Status: ✅ COMPLETED
🚫 DO NOT: Recreate or duplicate this file

📅 [DATE] [TIME] UTC+7
🤖 Agent: [AGENT_NAME] ([USER])
📁 Action: [DESCRIPTION]
📝 Status: [IN_PROGRESS|COMPLETED|BLOCKED]
🚫 DO NOT: [SPECIFIC_WARNINGS]
```

#### Current Active Work Areas
```
🟡 RESERVED AREAS (Do not modify):
- None currently

🔴 BLOCKED AREAS (Check before editing):
- None currently

🟢 AVAILABLE AREAS:
- All areas available for modification
```

#### Coordination Rules
1. **ALWAYS UPDATE THIS LOG** when starting work on any file/feature
2. **CHECK FOR CONFLICTS** before modifying core files (types.ts, services/, ai/flows/)
3. **MARK YOUR WORK** as IN_PROGRESS while editing, COMPLETED when done
4. **SET WARNINGS** for areas other agents should avoid
5. **USE THAI** for user-facing changes, English for technical documentation

---

## Architecture Overview

**CCTV Visionary** is a Thai-language web application for AI-powered CCTV and network system planning. Built with Next.js 15 + TypeScript, it combines visual floor plan design with Google Genkit AI assistance.

### Core System Boundaries

- **AI Layer** (`src/ai/`): Google Genkit flows for camera placement, cable routing, diagnostics, and topology generation
- **Service Layer** (`src/services/`): Domain services following singleton pattern with EventBus communication
- **Component Layer** (`src/components/`): React components organized by feature (canvas/, rack/, topology/, simulation/)
- **State Management**: Immer-based immutable updates with StateHistoryManager for undo/redo

### Key Data Flows

1. **Device Management**: `AnyDevice` union type → Service layer → Immer state updates → Canvas rendering
2. **AI Integration**: User action → AI flow (via actions.ts) → State update → UI feedback
3. **Cross-component**: EventBus pattern for service communication, SelectionContext for UI state

## Critical Development Patterns

### Change Tracking Pattern
```typescript
// REQUIRED: Log your changes when modifying core files
const changeLog = {
  timestamp: new Date().toISOString(),
  agent: 'AI_AGENT_NAME',
  user: 'USERNAME',
  action: 'DESCRIPTION',
  files: ['path/to/modified/files'],
  status: 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
};
// Update .github/copilot-instructions.md with this info
```

### Type System Architecture
```typescript
// Union types for device polymorphism
type AnyDevice = BaseDevice | CameraDevice | NetworkDevice | RackContainer;

// Service base class pattern
class BaseService {
  constructor(protected eventBus: EventBus) {}
  abstract initialize(): Promise<void>;
}
```

### State Management Pattern
```typescript
// Always use Immer for state updates
const newState = produce(projectState, draft => {
  // Mutate draft safely
});
updateProjectState(newState, 'description', 'action', metadata);
```

### AI Flow Integration
```typescript
// AI flows in src/ai/flows/ follow this pattern:
export const flowName = ai.defineFlow({
  name: 'flow-name',
  inputSchema: z.object({...}),
  outputSchema: z.object({...}),
  authPolicy: noAuth(),
}, async (input) => {...});
```

## Essential Commands

```bash
# AI development
npm run genkit:dev        # Start Genkit dev server
npm run genkit:watch      # Auto-reload AI flows

# Development
npm run dev               # Next.js dev server
npm run typecheck         # TypeScript validation
npm test                  # Jest test suite
```

## Project-Specific Conventions

### Component Organization
- **Canvas components**: Handle direct device manipulation and drawing
- **Sidebar components**: Toolbars, properties, project management
- **Topology components**: Network diagram generation and visualization
- **Simulation components**: 3D view and scenario testing

### Service Pattern
- Services extend `BaseService` and use dependency injection via `ServiceManager.getInstance()`
- EventBus for cross-service communication: `eventBus.emit()` / `eventBus.on()`
- Services are lazily initialized and follow singleton pattern

### State History System
```typescript
// Required for all state changes
updateProjectState(newState, 'Human readable description', 'add|remove|update|move|connect|disconnect', metadata);
```

### Mobile Support
- Uses `useMobileDetection()` hook for responsive behavior
- Touch gesture support for undo/redo (three-finger swipe)
- Separate mobile/desktop UI flows

## Integration Points

### Firebase Data Connect
- Schema in `dataconnect/schema/schema.gql` (currently example only)
- Generated connectors in `dataconnect-generated/`

### AI Model Configuration
- Single Genkit instance in `src/ai/genkit.ts` using `googleai/gemini-2.0-flash`
- All flows use `noAuth()` policy for development

### External Dependencies
- **React Flow**: Network topology visualization
- **Three.js**: 3D simulation views  
- **React DnD**: Drag-and-drop device placement
- **Framer Motion**: UI animations
- **Radix UI**: Design system components

## Thai Language Context

- UI text is primarily in Thai
- Component labels use Thai terms (e.g., 'กล้องวงจรปิด' for CCTV)
- Toast notifications and user feedback in Thai
- Error messages should be bilingual (Thai + English for debugging)

## Performance Considerations

- Use `React.memo()` for expensive canvas components
- Implement virtualization for large device lists
- AI flows include timing metadata for monitoring
- Canvas interactions are throttled for mobile performance

## Testing Strategy

- Jest configured with DOM testing library
- AI flows should have unit tests with mock inputs
- Canvas components need integration tests for drag/drop
- Mobile responsiveness testing required for all new features

---

## 📝 HOW TO UPDATE THIS FILE

When you make changes to the codebase:

1. **Add entry to Recent Modifications Log** with current Thai time (UTC+7)
2. **Mark areas as RESERVED** if you're working on them
3. **Update BLOCKED AREAS** if something depends on your work
4. **Set clear warnings** about what other agents should avoid
5. **Mark as COMPLETED** when finished

Example update:
```
📅 2025-07-13 22:30 UTC+7
🤖 Agent: Claude (john_doe)
📁 Action: เพิ่มระบบ authentication ใน auth.service.ts
📝 Status: IN_PROGRESS
🚫 DO NOT: แก้ไข auth-related types ใน src/lib/types.ts จนกว่าจะเสร็จ
```