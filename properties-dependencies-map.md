# Properties System Dependencies Map

## 📋 ภาพรวมของระบบ Properties Panel

### 🏗️ โครงสร้างหลัก (Core Architecture)

```
src/components/sidebar/properties-panel.tsx (Main Component)
├── SelectionContext ← จัดการ state ของไอเทมที่เลือก
├── Properties Components
│   ├── camera-properties.tsx
│   ├── network-device-properties.tsx  
│   ├── rack-properties.tsx
│   └── architectural-element-properties.tsx
└── Action Handlers (callbacks)
    ├── onUpdateDevice
    ├── onRemoveDevice
    ├── onStartCabling
    ├── onViewRack
    ├── onRemoveArchElement
    └── onUpdateArchElement
```

## 🔗 Dependencies & Interfaces

### 1. Type Definitions (`src/lib/types.ts`)

**Core Interfaces:**
```typescript
// Base device interface
BaseDevice {
  id: string
  type: DeviceType
  label: string
  x: number, y: number
  rotation: number
  price?: number
  powerConsumption?: number
}

// Extended device interfaces
CameraDevice extends BaseDevice
NetworkDevice extends BaseDevice  
RackContainer extends BaseDevice

// Union type for all devices
AnyDevice = BaseDevice | CameraDevice | NetworkDevice | RackContainer

// Architectural elements
ArchitecturalElement {
  id: string
  type: ArchitecturalElementType
  points: { x: number, y: number }[]
}
```

### 2. Properties Panel Interface

**Main Props Interface:**
```typescript
PropertiesPanelProps {
  onUpdateDevice: (device: AnyDevice) => void
  onRemoveDevice: (deviceId: string) => void
  onStartCabling: (deviceId: string, cableType: CableType) => void
  onViewRack: (rack: RackContainer) => void
  onRemoveArchElement: (elementId: string) => void
  onUpdateArchElement: (element: ArchitecturalElement) => void
}
```

## 📦 Individual Property Components

### 3.1 Camera Properties
**File:** `src/components/sidebar/properties/camera-properties.tsx`
```typescript
interface CameraPropertiesProps {
  device: AnyDevice
  onUpdate: (device: AnyDevice) => void
}

// Properties handled:
- Basic: label, type
- Camera specs: resolution, fov, range, zoomLevel (for PTZ)
- Network: ipAddress, vlanId
- Physical: price, powerConsumption
- Placement: x, y coordinates
```

### 3.2 Network Device Properties  
**File:** `src/components/sidebar/properties/network-device-properties.tsx`
```typescript
interface NetworkDevicePropertiesProps {
  device: AnyDevice
  onUpdate: (device: AnyDevice) => void
}

// Properties handled:
- Basic: id, label, type
- Network: ipAddress, vlanId
- Specs: ports (switch), channels (NVR), uHeight
- Physical: price, powerConsumption
- Placement: x, y coordinates
```

### 3.3 Rack Properties
**File:** `src/components/sidebar/properties/rack-properties.tsx`
```typescript
interface RackPropertiesProps {
  device: AnyDevice
  onUpdate: (device: AnyDevice) => void
}

// Properties handled:
- General: label, price, powerConsumption
- Rack Specifics: rack_size (U), ip_rating (outdoor)
- Placement: x, y coordinates
```

### 3.4 Architectural Element Properties
**File:** `src/components/sidebar/properties/architectural-element-properties.tsx`
```typescript
interface ArchitecturalElementProps {
  element: ArchitecturalElement
  onUpdate: (element: ArchitecturalElement) => void
  onRemove: (elementId: string) => void
}

// Properties handled:
- Basic: type, name
- Visual: color, opacity
- Dimensions: width, height, scale
- Effects: shadow (offset, blur, opacity, color)
```

## 🎯 Selection Context Integration

### 4. Selection Management
**File:** `src/contexts/SelectionContext.tsx`
```typescript
SelectionContext {
  selectedItem: AnyDevice | ArchitecturalElement | null
  setSelectedItem: (item: AnyDevice | ArchitecturalElement | null) => void
}
```

**Usage Pattern:**
```typescript
// In properties-panel.tsx
const { selectedItem } = useSelection()

// Conditional rendering based on item type
if ('label' in selectedItem) {
  // Device properties
} else {
  // Architectural element properties
}
```

## 🔧 Device Configuration Integration

### 5. Device Config
**Files:** 
- `src/lib/device-config.tsx`
- `src/lib/DEVICE_CONFIG.tsx`

```typescript
DeviceConfig {
  type: DeviceType
  label: string
  icon: React.ComponentType<any>
  colorClass: string
  properties: Partial<AnyDevice>
}

// Device mappings with defaults
DEVICE_CONFIG: Record<DeviceType, DeviceConfig>
```

## 🌐 Network Settings Integration

### 6. Network Configuration
**File:** `src/components/sidebar/network-settings.tsx`
```typescript
NetworkSettingsProps {
  vlans: VLAN[]
  subnets: Subnet[]
  onAddVlan: (vlan: Omit<VLAN, 'id'>) => void
  onAddSubnet: (subnet: Omit<Subnet, 'id'>) => void
  onDeleteVlan?: (id: string) => void
  onDeleteSubnet?: (id: string) => void
  onTestConnection?: () => Promise<boolean>
}

// Types used by device properties
VLAN { id: string, name: string, color: string }
Subnet { id: string, cidr: string }
```

## 🏢 Rack Elevation Integration

### 7. Rack Management
**File:** `src/components/rack/rack-elevation-view.tsx`
```typescript
RackElevationViewProps {
  rack: RackContainer
  isOpen: boolean
  onClose: () => void
  onUpdateRack: (rack: RackContainer) => void
}

// Rack-specific device interface
RackDevice {
  id: string
  type: DeviceType
  label: string
  uPosition: number
  uHeight: number
}
```

## 📊 Main Application Integration

### 8. CCTV Planner Integration
**File:** `src/components/cctv-planner.tsx`

**Property Panel Integration:**
```typescript
// Callback handlers passed to PropertiesPanel
onUpdateDevice: (device: AnyDevice) => void
onRemoveDevice: (deviceId: string) => void
onStartCabling: (deviceId: string, cableType: CableType) => void
onViewRack: (rack: RackContainer) => void
onRemoveArchElement: (elementId: string) => void
onUpdateArchElement: (element: ArchitecturalElement) => void
```

## 🔄 Data Flow Pattern

### 9. Update Flow
```
1. User selects item on canvas
   ↓
2. SelectionContext updates selectedItem
   ↓
3. PropertiesPanel renders appropriate component
   ↓
4. User modifies property in form
   ↓
5. Component calls onUpdate/onRemove callback
   ↓
6. Parent component updates state
   ↓
7. Canvas re-renders with updated data
```

### 10. Component Communication
```
CCTVPlanner (Main)
├── Canvas (Selection)
├── PropertiesPanel
│   ├── CameraProperties
│   ├── NetworkDeviceProperties
│   ├── RackProperties
│   └── ArchitecturalElementProperties
└── SelectionContext (State)
```

## 🧩 UI Components Used

### 11. Common UI Dependencies
**All property components use:**
- `@/components/ui/accordion` - Collapsible sections
- `@/components/ui/input` - Form inputs
- `@/components/ui/label` - Form labels
- `@/components/ui/button` - Action buttons
- `@/components/ui/slider` - Range inputs
- `@/components/ui/switch` - Toggle switches

## 🎨 Styling & Theme

### 12. Styling Dependencies
- `@/lib/utils` - className utilities (cn function)
- Tailwind CSS classes for consistent styling
- Icon components from `lucide-react`

---

## 🔍 Summary

ระบบ Properties Panel มีการออกแบบที่เป็นระเบียบและยืดหยุ่น:

1. **แยกส่วนชัดเจน** - แต่ละประเภทของ property มี component แยกต่างหาก
2. **Type Safety** - ใช้ TypeScript interfaces ครอบคลุม
3. **Consistent Pattern** - ทุก component ใช้ pattern เดียวกัน (device, onUpdate)
4. **Context Integration** - เชื่อมต่อกับ SelectionContext อย่างราบรื่น
5. **Flexible Actions** - รองรับการกระทำต่างๆ ผ่าน callback functions

ระบบนี้พร้อมสำหรับการขยายเพิ่มเติมและการปรับปรุงในอนาคต
