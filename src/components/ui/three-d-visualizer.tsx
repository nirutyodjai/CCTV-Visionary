'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Box, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D,
  Eye,
  EyeOff,
  Settings,
  Camera,
  Sun,
  Moon
} from 'lucide-react';
import type { AnyDevice, Floor, Connection } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThreeDVisualizerProps {
  floor: Floor;
  devices: AnyDevice[];
  connections: Connection[];
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  enableDemoMode?: boolean; // เพิ่มโหมดสาธิต
}

interface CameraSettings {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
  near: number;
  far: number;
}

interface LightingSettings {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  shadows: boolean;
}

interface ViewMode {
  mode: 'realistic' | 'wireframe' | 'xray' | 'blueprint';
  showConnections: boolean;
  showLabels: boolean;
  showGrid: boolean;
}

export function ThreeDVisualizer({ 
  floor, 
  devices, 
  connections, 
  className, 
  isOpen, 
  onClose,
  enableDemoMode = false
}: ThreeDVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    position: [10, 15, 10],
    rotation: [0, 0, 0],
    fov: 75,
    near: 0.1,
    far: 1000
  });
  
  const [lightingSettings, setLightingSettings] = useState<LightingSettings>({
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    directionalPosition: [10, 10, 5],
    shadows: true
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>({
    mode: 'realistic',
    showConnections: true,
    showLabels: true,
    showGrid: true
  });

  // ข้อมูลอ้างอิงสำหรับ OrbitControls
  const controlsRef = useRef<OrbitControls>();

  // Create 3D scene
  const initializeScene = () => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      cameraSettings.fov,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      cameraSettings.near,
      cameraSettings.far
    );
    camera.position.set(...cameraSettings.position);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = lightingSettings.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // ตั้งค่า OrbitControls เพื่อควบคุมมุมกล้อง
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // เพิ่มความนุ่มนวลในการเคลื่อนไหว
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2.1; // จำกัดมุมไม่ให้กล้องลงต่ำกว่าพื้น
    controlsRef.current = controls;

    // Lighting
    setupLighting(scene);
    
    // Grid
    if (viewMode.showGrid) {
      setupGrid(scene);
    }

    // Add floor plan
    setupFloorPlan(scene);
    
    // Add devices
    setupDevices(scene);
    
    // Add connections
    if (viewMode.showConnections) {
      setupConnections(scene);
    }

    // Controls
    setupControls();

    setIsLoading(false);
  };

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, lightingSettings.ambientIntensity);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, lightingSettings.directionalIntensity);
    directionalLight.position.set(...lightingSettings.directionalPosition);
    directionalLight.castShadow = lightingSettings.shadows;
    
    if (lightingSettings.shadows) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
    }
    
    scene.add(directionalLight);
  };

  const setupGrid = (scene: THREE.Scene) => {
     const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);
  };

  const setupFloorPlan = (scene: THREE.Scene) => {
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.8
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Add architectural elements
    floor.architecturalElements.forEach((element) => {
      if (!element.start || !element.end) return;

      const width = Math.abs(element.end.x - element.start.x) || 0.2;
      const length = Math.abs(element.end.y - element.start.y) || 0.2;
      const midX = (element.start.x + element.end.x) / 2 * 20 - 10;
      const midZ = (element.start.y + element.end.y) / 2 * 20 - 10;
      
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;
      let mesh: THREE.Mesh;
      let height = 0;
      let yPos = 0;
      
      switch (element.type) {
        case 'wall':
          height = 2.5;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(width, height, length);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x8B4513,
            transparent: true,
            opacity: viewMode.mode === 'xray' ? 0.3 : 0.9
          });
          break;
          
        case 'door':
          height = 2.0;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(width, height, 0.1);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0xA0522D,
            transparent: true,
            opacity: viewMode.mode === 'xray' ? 0.3 : 0.9
          });
          break;
          
        case 'window':
          height = 1.0;
          yPos = 1.5;
          geometry = new THREE.BoxGeometry(width, height, 0.05);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x87CEFA,
            transparent: true,
            opacity: 0.4
          });
          break;
          
        case 'table':
          height = 0.8;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(width, height, length);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x8B4513
          });
          break;
          
        case 'chair':
          height = 1.0;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x696969
          });
          break;
          
        case 'area':
          // Just a flat colored area
          height = 0.01;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(width, height, length);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x90EE90,
            transparent: true,
            opacity: 0.3
          });
          break;
          
        default:
          height = 1.0;
          yPos = height / 2;
          geometry = new THREE.BoxGeometry(width || 0.5, height, length || 0.5);
          material = new THREE.MeshLambertMaterial({ 
            color: element.color || 0x808080
          });
      }
      
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(midX, yPos, midZ);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { element };
      scene.add(mesh);
    });
  };

  const setupDevices = (scene: THREE.Scene) => {
    // First create devices that might contain other devices (like racks)
    const rackDevices = devices.filter(device => device.type === 'rack-indoor' || device.type === 'rack-outdoor');
    const standardDevices = devices.filter(device => device.type !== 'rack-indoor' && device.type !== 'rack-outdoor');
    
    // Process rack devices first
    rackDevices.forEach((device) => {
      const deviceMesh = createDeviceMesh(device);
      if (deviceMesh) {
        scene.add(deviceMesh);
        
        // Add label if enabled
        if (viewMode.showLabels) {
          const label = createDeviceLabel(device);
          scene.add(label);
        }
      }
    });
    
    // Then process standard devices
    standardDevices.forEach((device) => {
      const deviceMesh = createDeviceMesh(device);
      if (deviceMesh) {
        scene.add(deviceMesh);
        
        // Add label if enabled
        if (viewMode.showLabels) {
          const label = createDeviceLabel(device);
          scene.add(label);
        }
      }
    });
  };

  const createDeviceMesh = (device: AnyDevice): THREE.Group | null => {
    const group = new THREE.Group();
    
    // Position device in 3D space
    const x = device.x * 20 - 10;
    const z = device.y * 20 - 10;
    let y = 0;
    
    let geometryMain: THREE.BufferGeometry | undefined;
    let materialMain: THREE.Material | undefined;
    const deviceColors: { [key: string]: number } = {
      'cctv-dome': 0x2C2C2C,
      'cctv-bullet': 0x2C2C2C,
      'cctv-ptz': 0x1A1A1A,
      'nvr': 0x404040,
      'switch': 0x404040,
      'wifi-ap': 0xFFFFFF,
      'monitor': 0x000000,
      'utp-cat6': 0x0066CC,
      'fiber-optic': 0xFF6600,
      'rack-indoor': 0x666666,
      'rack-outdoor': 0x888888,
      'patch-panel': 0x555555,
      'pdu': 0x333333,
      'ups': 0x222222,
      'table': 0x8B4513
    };
    
    let deviceHeight = 0.2; // Default height for devices
    let rotation = device.rotation || 0; // Use rotation if defined
    
    // CCTV CAMERAS
    if (device.type.startsWith('cctv-')) {
      const cameraDevice = device as any;
      const fov = cameraDevice.fov || 90;
      const range = cameraDevice.range || 10;
      
      switch (device.type) {
        case 'cctv-dome':
          geometryMain = new THREE.SphereGeometry(0.3, 16, 16);
          materialMain = createDeviceMaterial(device.type, viewMode.mode);
          y = 2.5; // Ceiling mounted
          
          // Add dome base
          const baseGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
          const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
          const base = new THREE.Mesh(baseGeometry, baseMaterial);
          base.position.set(0, -0.2, 0);
          group.add(base);
          break;
          
        case 'cctv-bullet':
          geometryMain = new THREE.CylinderGeometry(0.1, 0.15, 0.4, 8);
          materialMain = createDeviceMaterial(device.type, viewMode.mode);
          y = 2.3; // Wall mounted
          
          // Add mounting bracket
          const bracketGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
          const bracketMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
          const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
          bracket.position.set(0, -0.15, -0.2);
          group.add(bracket);
          break;
          
        case 'cctv-ptz':
          geometryMain = new THREE.SphereGeometry(0.4, 16, 16);
          materialMain = createDeviceMaterial(device.type, viewMode.mode);
          y = 3.0; // High mounted
          
          // Add PTZ mount
          const mountGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
          const mountMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
          const mount = new THREE.Mesh(mountGeometry, mountMaterial);
          mount.position.set(0, -0.3, 0);
          group.add(mount);
          break;
      }
      
      // Add FOV visualization cone if enabled
      if (viewMode.showLabels) {
        const fovRad = (fov * Math.PI) / 180;
        const coneHeight = range;
        const coneRadius = Math.tan(fovRad/2) * coneHeight;
        
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 1, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
          color: 0x00FF00,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide,
          wireframe: viewMode.mode === 'wireframe'
        });
        
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        
        // Adjust cone to point in the right direction
        cone.position.set(0, 0, coneHeight/2);
        cone.rotation.x = Math.PI / 2;
        
        // Add to group with rotation
        const coneGroup = new THREE.Group();
        coneGroup.add(cone);
        coneGroup.rotation.y = (rotation * Math.PI) / 180;
        group.add(coneGroup);
      }
    }
    
    // NETWORK EQUIPMENT
    else if (device.type === 'nvr' || device.type === 'switch') {
      // Create rack-mountable device
      const uHeight = (device as any).uHeight || 1;
      deviceHeight = uHeight * 0.15; // Adjust height based on U size
      
      geometryMain = new THREE.BoxGeometry(0.8, deviceHeight, 0.6);
      materialMain = createDeviceMaterial(device.type, viewMode.mode);
      y = 0.1 + deviceHeight/2; // On table or in rack
      
      // Add front panel details
      const panelGeometry = new THREE.PlaneGeometry(0.78, deviceHeight * 0.9);
      const panelMaterial = new THREE.MeshBasicMaterial({ 
        color: device.type === 'nvr' ? 0x222222 : 0x333333
      });
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(0, 0, 0.301);
      group.add(panel);
      
      // Add LED indicators
      const ledGeometry = new THREE.CircleGeometry(0.02, 8);
      
      // Status LED (green)
      const ledGreenMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
      const ledGreen = new THREE.Mesh(ledGeometry, ledGreenMaterial);
      ledGreen.position.set(-0.3, deviceHeight * 0.3, 0.302);
      group.add(ledGreen);
      
      // Activity LED (amber)
      const ledAmberMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
      const ledAmber = new THREE.Mesh(ledGeometry, ledAmberMaterial);
      ledAmber.position.set(-0.25, deviceHeight * 0.3, 0.302);
      group.add(ledAmber);
      
      // Add ports for network equipment
      if (device.type === 'switch') {
        const numPorts = (device as any).ports || 8;
        const portWidth = 0.06;
        const startPos = -0.35;
        const portGeometry = new THREE.BoxGeometry(portWidth, 0.04, 0.01);
        const portMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
        
        for (let i = 0; i < Math.min(numPorts, 12); i++) {
          const port = new THREE.Mesh(portGeometry, portMaterial);
          port.position.set(startPos + i * (portWidth * 1.2), -0.05, 0.302);
          group.add(port);
        }
      }
    }
    
    // RACK
    else if (device.type === 'rack-indoor' || device.type === 'rack-outdoor') {
      const rackDevice = device as any;
      const rackSize = rackDevice.rack_size || '42U';
      const uCount = parseInt(rackSize.replace('U', '')) || 42;
      const rackHeight = uCount * 0.15;
      const rackWidth = 0.9;
      const rackDepth = 0.8;
      
      // Create rack frame
      geometryMain = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
      materialMain = new THREE.MeshLambertMaterial({ 
        color: device.type === 'rack-outdoor' ? 0x999999 : 0x333333,
        transparent: true,
        opacity: 0.5
      });
      y = rackHeight/2;
      
      // Add rack inner frame
      const innerGeometry = new THREE.BoxGeometry(rackWidth - 0.05, rackHeight - 0.05, rackDepth - 0.05);
      const innerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x111111,
        wireframe: true
      });
      const innerFrame = new THREE.Mesh(innerGeometry, innerMaterial);
      group.add(innerFrame);
      
      // Add rack devices if available
      if (rackDevice.devices && rackDevice.devices.length > 0) {
        rackDevice.devices.forEach((rackItem: any) => {
          if (!rackItem) return;
          
          const uHeight = rackItem.uHeight || 1;
          const uPosition = rackItem.uPosition || 1;
          const deviceHeight = uHeight * 0.15;
          
          // Create device
          const deviceGeometry = new THREE.BoxGeometry(0.85, deviceHeight, 0.7);
          const deviceMaterial = new THREE.MeshLambertMaterial({ 
            color: deviceColors[rackItem.type] || 0x555555
          });
          const deviceMesh = new THREE.Mesh(deviceGeometry, deviceMaterial);
          
          // Position device in rack based on U position
          const yPos = -rackHeight/2 + (uPosition * 0.15) + deviceHeight/2;
          deviceMesh.position.set(0, yPos, 0.01);
          
          group.add(deviceMesh);
          
          // Add front panel details
          const panelGeometry = new THREE.PlaneGeometry(0.84, deviceHeight * 0.95);
          const panelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x222222
          });
          const panel = new THREE.Mesh(panelGeometry, panelMaterial);
          panel.position.set(0, yPos, 0.355);
          group.add(panel);
          
          // Add label
          if (viewMode.showLabels && rackItem.label) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.fillStyle = 'white';
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.fillText(rackItem.label, canvas.width / 2, 24);
            context.font = '12px Arial';
            context.fillText(rackItem.type, canvas.width / 2, 45);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const labelSprite = new THREE.Sprite(labelMaterial);
            labelSprite.position.set(0, yPos, 0.4);
            labelSprite.scale.set(0.8, 0.2, 1);
            group.add(labelSprite);
          }
        });
      }
    }
    
    // MONITOR
    else if (device.type === 'monitor') {
      geometryMain = new THREE.BoxGeometry(0.8, 0.5, 0.05);
      materialMain = new THREE.MeshLambertMaterial({ color: 0x222222 });
      y = 1.2; // On a table or wall
      
      // Add monitor stand
      const standGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.3, 8);
      const standMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
      const stand = new THREE.Mesh(standGeometry, standMaterial);
      stand.position.set(0, -0.4, 0.1);
      group.add(stand);
      
      // Add monitor base
      const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16);
      const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -0.55, 0.1);
      group.add(base);
      
      // Add monitor screen
      const screenGeometry = new THREE.PlaneGeometry(0.75, 0.45);
      const screenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x0066CC,
        transparent: true,
        opacity: 0.8
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(0, 0, 0.03);
      group.add(screen);
    }
    
    // WIFI ACCESS POINT
    else if (device.type === 'wifi-ap') {
      geometryMain = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
      materialMain = createDeviceMaterial(device.type, viewMode.mode);
      y = 2.5; // Ceiling mounted
      
      // Add WiFi signal indicator
      if (viewMode.showLabels) {
        const wifiRange = (device as any).range || 8;
        const wifiGeometry = new THREE.SphereGeometry(wifiRange, 16, 16);
        const wifiMaterial = new THREE.MeshBasicMaterial({
          color: 0x3366FF,
          transparent: true,
          opacity: 0.05,
          wireframe: viewMode.mode === 'wireframe'
        });
        const wifiSignal = new THREE.Mesh(wifiGeometry, wifiMaterial);
        wifiSignal.position.set(0, 0, 0);
        group.add(wifiSignal);
      }
      
      // Add logo indicator
      const logoGeometry = new THREE.CircleGeometry(0.08, 16);
      const logoMaterial = new THREE.MeshBasicMaterial({ color: 0x00AAFF });
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.set(0, 0, 0.026);
      logo.rotation.x = -Math.PI/2;
      group.add(logo);
    }
    
    // CABLES - these should typically not appear as standalone devices
    // but including for completeness
    else if (device.type === 'utp-cat6' || device.type === 'fiber-optic') {
      geometryMain = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
      materialMain = new THREE.MeshLambertMaterial({ 
        color: device.type === 'utp-cat6' ? 0x0066CC : 0xFF6600 
      });
      y = 0.5;
    }
    
    // OTHER DEVICES / FALLBACK
    else {
      geometryMain = new THREE.BoxGeometry(0.3, 0.2, 0.3);
      materialMain = createDeviceMaterial(device.type, viewMode.mode);
      y = 0.1;
    }
    
    // Apply view mode styling if not already applied
    if (materialMain && (materialMain instanceof THREE.MeshLambertMaterial || materialMain instanceof THREE.MeshPhongMaterial)) {
      if (viewMode.mode === 'wireframe') {
        materialMain = new THREE.MeshBasicMaterial({ 
          color: 0x00FF00, 
          wireframe: true 
        });
      } else if (viewMode.mode === 'xray') {
        materialMain.transparent = true;
        materialMain.opacity = 0.5;
      }
    }
    
    // Make sure we have geometry and material
    if (!geometryMain || !materialMain) {
      geometryMain = new THREE.BoxGeometry(0.3, 0.2, 0.3);
      materialMain = createDeviceMaterial(device.type, viewMode.mode);
      y = 0.1;
    }
    
    const mesh = new THREE.Mesh(geometryMain, materialMain);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { device };
    
    // Apply device rotation if available
    if (rotation) {
      mesh.rotation.y = (rotation * Math.PI) / 180;
    }
    
    group.position.set(x, y, z);
    group.add(mesh);
    
    return group;
  };

  // Helper function to create consistent materials
  const createDeviceMaterial = (deviceType: string, viewMode: string): THREE.Material => {
    const deviceColors: { [key: string]: number } = {
      'cctv-dome': 0x2C2C2C,
      'cctv-bullet': 0x2C2C2C,
      'cctv-ptz': 0x1A1A1A,
      'nvr': 0x404040,
      'switch': 0x404040,
      'wifi-ap': 0xFFFFFF,
      'monitor': 0x000000,
      'utp-cat6': 0x0066CC,
      'fiber-optic': 0xFF6600,
      'rack-indoor': 0x666666,
      'rack-outdoor': 0x888888,
      'patch-panel': 0x555555,
      'pdu': 0x333333,
      'ups': 0x222222
    };
    
    const color = deviceColors[deviceType] || 0x666666;
    
    if (viewMode === 'wireframe') {
      return new THREE.MeshBasicMaterial({
        color: 0x00FF00,
        wireframe: true
      });
    } else if (viewMode === 'xray') {
      return new THREE.MeshLambertMaterial({
        color,
        transparent: true,
        opacity: 0.5
      });
    } else if (viewMode === 'blueprint') {
      return new THREE.MeshBasicMaterial({
        color: 0x0088FF,
        wireframe: false
      });
    } else {
      // Realistic mode
      return new THREE.MeshPhongMaterial({
        color,
        shininess: 30
      });
    }
  };

  // Removed the addDeviceDetails method as its functionality has been incorporated into createDeviceMesh

  const createDeviceLabel = (device: AnyDevice): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = 256;
    canvas.height = 96;
    
    // Draw label background with subtle gradient
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    context.fillStyle = gradient;
    context.roundRect(0, 0, canvas.width, canvas.height, 8);
    context.fill();
    
    // Add border
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 2;
    context.roundRect(0, 0, canvas.width, canvas.height, 8);
    context.stroke();
    
    // Draw main label text
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(device.label || device.type, canvas.width / 2, 35);
    
    // Draw additional device info
    context.font = '16px Arial';
    context.fillStyle = '#aaaaaa';
    
    // Show different info based on device type
    let deviceInfo = '';
    
    if (device.type.startsWith('cctv-')) {
      const cameraDevice = device as any;
      deviceInfo = `${cameraDevice.resolution || 'HD'} | FOV: ${cameraDevice.fov || 90}°`;
    } else if (device.type === 'nvr') {
      const nvrDevice = device as any;
      deviceInfo = `${nvrDevice.channels || 8} Ch | ${nvrDevice.storage || '1TB'}`;
    } else if (device.type === 'switch') {
      const switchDevice = device as any;
      deviceInfo = `${switchDevice.ports || 8} Ports`;
    } else if (device.type === 'wifi-ap') {
      const apDevice = device as any;
      deviceInfo = `Range: ${apDevice.range || 10}m`;
    } else if (device.ipAddress) {
      deviceInfo = `IP: ${device.ipAddress}`;
    } else {
      deviceInfo = device.type;
    }
    
    context.fillText(deviceInfo, canvas.width / 2, 65);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      depthTest: false, // Makes labels visible through walls
      depthWrite: false // Makes labels visible through walls
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Calculate appropriate Y position based on device type
    let yPos = 3.5;
    
    if (device.type.startsWith('cctv-')) {
      yPos = device.type === 'cctv-ptz' ? 4.0 : 3.5;
    } else if (device.type === 'wifi-ap') {
      yPos = 3.0;
    } else if (device.type === 'nvr' || device.type === 'switch') {
      yPos = 1.0;
    } else if (device.type === 'monitor') {
      yPos = 2.0;
    } else if (device.type.startsWith('rack-')) {
      yPos = 4.0;
    }
    
    // Position above device
    sprite.position.set(
      device.x * 20 - 10,
      yPos,
      device.y * 20 - 10
    );
    
    // Scale sprite to match aspect ratio
    sprite.scale.set(2, 0.75, 1);
    
    return sprite;
  };

  const setupConnections = (scene: THREE.Scene) => {
    connections.forEach((connection) => {
      const fromDevice = devices.find(d => d.id === connection.fromDeviceId);
      const toDevice = devices.find(d => d.id === connection.toDeviceId);
      
      if (fromDevice && toDevice) {
        const connectionMesh = createConnectionMesh(fromDevice, toDevice, connection);
        scene.add(connectionMesh);
      }
    });
  };

  const createConnectionMesh = (
    fromDevice: AnyDevice, 
    toDevice: AnyDevice, 
    connection: Connection
  ): THREE.Group => {
    const group = new THREE.Group();
    
    // Calculate device heights based on device type
    const getDeviceHeight = (device: AnyDevice): number => {
      if (device.type.startsWith('cctv-')) {
        if (device.type === 'cctv-dome') return 2.5;
        if (device.type === 'cctv-bullet') return 2.3;
        if (device.type === 'cctv-ptz') return 3.0;
      } else if (device.type === 'wifi-ap') {
        return 2.5;
      } else if (device.type === 'monitor') {
        return 1.2;
      } else if (device.type.startsWith('rack-')) {
        return 2.0; // Connection to the middle of the rack
      } else if (device.type === 'nvr' || device.type === 'switch') {
        return 0.2;
      }
      return 0.2; // Default height for other devices
    };
    
    const fromHeight = getDeviceHeight(fromDevice);
    const toHeight = getDeviceHeight(toDevice);
    
    const fromPos = new THREE.Vector3(
      fromDevice.x * 20 - 10,
      fromHeight,
      fromDevice.y * 20 - 10
    );
    
    const toPos = new THREE.Vector3(
      toDevice.x * 20 - 10,
      toHeight,
      toDevice.y * 20 - 10
    );
    
    // Create cable path
    const points: THREE.Vector3[] = [];
    
    // Add from position with offset if needed
    points.push(fromPos);
    
    // For cables with specific paths
    if (connection.path && connection.path.length > 0) {
      // Calculate intermediate heights for smoother curves
      const totalPoints = connection.path.length;
      
      connection.path.forEach((point, index) => {
        // Skip first and last points as they're handled by device positions
        if (index === 0 || index === totalPoints - 1) return;
        
        // Calculate height for this point (lower for middle points)
        let pointHeight = 0.15; // Default height near floor/ground
        
        // If connecting to ceiling devices, route higher
        if (fromHeight > 2.0 && toHeight > 2.0) {
          pointHeight = 2.5; // Route near ceiling
        } 
        // If one device is ceiling mounted and other is floor-level
        else if (fromHeight > 2.0 || toHeight > 2.0) {
          // Calculate path point position along the connection
          const position = index / (totalPoints - 1);
          // Create curve from high to low
          pointHeight = Math.max(0.15, fromHeight * (1 - position) + toHeight * position);
        }
        
        points.push(new THREE.Vector3(
          point.x * 20 - 10,
          pointHeight,
          point.y * 20 - 10
        ));
      });
    } 
    // For cables without specific paths
    else {
      // Create logical curved path between devices
      const distance = fromPos.distanceTo(toPos);
      
      // For longer cables, add intermediate points
      if (distance > 3) {
        // Calculate midpoint with slightly lower height
        const midX = (fromPos.x + toPos.x) / 2;
        const midZ = (fromPos.z + toPos.z) / 2;
        
        // Calculate midpoint height
        let midPointHeight = 0.15; // Default near floor
        
        // If both devices are ceiling-mounted, route higher
        if (fromHeight > 2.0 && toHeight > 2.0) {
          midPointHeight = Math.max(fromHeight, toHeight) + 0.3;
        } 
        // If one device is ceiling-mounted and other is floor-level
        else if (fromHeight > 2.0 || toHeight > 2.0) {
          midPointHeight = Math.max(fromHeight, toHeight) - 0.5;
        } 
        // If both are floor level, route below
        else {
          midPointHeight = Math.min(0.15, Math.min(fromHeight, toHeight));
        }
        
        points.push(new THREE.Vector3(midX, midPointHeight, midZ));
      }
    }
    
    // Add to position
    points.push(toPos);
    
    // Create curve
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeSegments = Math.max(20, Math.floor(fromPos.distanceTo(toPos) * 2));
    let tubeRadius = 0.02;
    
    // Adjust size based on cable type
    if (connection.cableType === 'fiber-optic') {
      tubeRadius = 0.015;
    }
    
    const tubeGeometry = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 8, false);
    
    // Cable color and material based on type and view mode
    const cableColors = {
      'utp-cat6': 0x0066CC,
      'fiber-optic': 0xFF6600,
      'power': 0xFF0000,
      'coax': 0x000000
    };
    
    let cableMaterial: THREE.Material;
    const cableColor = cableColors[connection.cableType] || 0x666666;
    
    if (viewMode.mode === 'wireframe') {
      cableMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00FF00 
      });
    } else if (viewMode.mode === 'xray') {
      cableMaterial = new THREE.MeshBasicMaterial({ 
        color: cableColor,
        transparent: true,
        opacity: 0.5
      });
    } else if (viewMode.mode === 'blueprint') {
      cableMaterial = new THREE.LineBasicMaterial({ 
        color: 0x0088FF 
      });
    } else {
      cableMaterial = new THREE.MeshLambertMaterial({ 
        color: cableColor
      });
    }
    
    const cableMesh = new THREE.Mesh(tubeGeometry, cableMaterial);
    cableMesh.userData = { connection };
    group.add(cableMesh);
    
    // Add connection points/junctions at each bend for visual interest
    if (points.length > 2 && viewMode.mode !== 'wireframe') {
      // Skip first and last points (device connections)
      for (let i = 1; i < points.length - 1; i++) {
        const junctionGeometry = new THREE.SphereGeometry(tubeRadius * 2, 8, 8);
        const junctionMesh = new THREE.Mesh(junctionGeometry, cableMaterial);
        junctionMesh.position.copy(points[i]);
        group.add(junctionMesh);
      }
    }
    
    // If labels are enabled, add a label with connection info
    if (viewMode.showLabels) {
      const midPoint = curve.getPoint(0.5);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.roundRect(0, 0, canvas.width, canvas.height, 8);
      context.fill();
      
      context.fillStyle = 'white';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.fillText(`${connection.cableType}`, canvas.width / 2, 24);
      
      const length = connection.length || Math.round(fromPos.distanceTo(toPos) * 2) / 2;
      context.fillStyle = '#aaaaaa';
      context.fillText(`Length: ${length}m`, canvas.width / 2, 45);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      const label = new THREE.Sprite(labelMaterial);
      
      // Position at midpoint but slightly above the cable
      label.position.set(midPoint.x, midPoint.y + 0.3, midPoint.z);
      label.scale.set(1.5, 0.5, 1);
      group.add(label);
    }
    
    return group;
  };

  const setupControls = () => {
    if (!rendererRef.current?.domElement || !cameraRef.current) return;
    
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown || !cameraRef.current) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // Rotate camera around target
      const camera = cameraRef.current;
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleMouseUp = () => {
      isMouseDown = false;
    };
    
    const handleWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      
      const camera = cameraRef.current;
      const factor = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(factor);
    };
    
    const element = rendererRef.current.domElement;
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('wheel', handleWheel);
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
    };
  };

  // Animation loop
  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    
    // Update OrbitControls in each frame for smooth movement
    if (controlsRef.current) {
      controlsRef.current.update();
    }
    
    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // Request next animation frame
    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Initialize when component mounts or opens
  useEffect(() => {
    let handleResize: (() => void) | undefined;
    
    if (isOpen && mountRef.current) {
      initializeScene();
      animate();
      
      // Handle window resize to adjust rendering and camera aspect
      handleResize = () => {
        if (cameraRef.current && rendererRef.current && mountRef.current) {
          // Update camera aspect ratio
          cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
          cameraRef.current.updateProjectionMatrix();
          
          // Update renderer size
          rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
          
          // Also update OrbitControls if available
          if (controlsRef.current) {
            controlsRef.current.update();
          }
        }
      };
      
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      // Clean up resources
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Dispose of renderer and remove from DOM
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      // Dispose of OrbitControls if available
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isOpen]);

  // Re-render when settings change
  useEffect(() => {
    if (isOpen && sceneRef.current) {
      // Clear scene and rebuild
      while (sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
      
      setupLighting(sceneRef.current);
      if (viewMode.showGrid) setupGrid(sceneRef.current);
      setupFloorPlan(sceneRef.current);
      setupDevices(sceneRef.current);
      if (viewMode.showConnections) setupConnections(sceneRef.current);
    }
  }, [viewMode, lightingSettings]);

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] w-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            การแสดงผล 3 มิติ
            <Badge variant="outline">Beta</Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex h-[calc(100%-4rem)] gap-4">
          {/* 3D Viewer */}
          <div className="flex-1 relative">
            <div 
              ref={mountRef} 
              className={cn(
                "w-full h-full bg-gray-900 rounded-lg overflow-hidden",
                className
              )}
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white">กำลังโหลดฉาก 3 มิติ...</div>
              </div>
            )}
            
            {/* 3D Controls Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Reset camera to initial position
                    cameraRef.current.position.set(10, 15, 10);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Reset OrbitControls to initial state
                    if (controlsRef.current) {
                      controlsRef.current.target.set(0, 0, 0);
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [10, 15, 10],
                      rotation: [0, 0, 0]
                    }));
                  }
                }}
                title="รีเซ็ตกล้อง"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Calculate current distance
                    const dist = cameraRef.current.position.length();
                    // Zoom in by 20%
                    const newDist = dist * 0.8;
                    // Keep same direction but change distance
                    cameraRef.current.position.normalize().multiplyScalar(newDist);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Update OrbitControls when zooming in
                    if (controlsRef.current) {
                      // Just update without changing target
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state with new position
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [
                        cameraRef.current!.position.x,
                        cameraRef.current!.position.y,
                        cameraRef.current!.position.z
                      ]
                    }));
                  }
                }}
                title="ซูมเข้า"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Calculate current distance
                    const dist = cameraRef.current.position.length();
                    // Zoom out by 20%
                    const newDist = dist * 1.2;
                    // Keep same direction but change distance
                    cameraRef.current.position.normalize().multiplyScalar(newDist);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Update OrbitControls when zooming out
                    if (controlsRef.current) {
                      // Just update without changing target
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state with new position
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [
                        cameraRef.current!.position.x,
                        cameraRef.current!.position.y,
                        cameraRef.current!.position.z
                      ]
                    }));
                  }
                }}
                title="ซูมออก"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Set camera to top view
                    cameraRef.current.position.set(0, 15, 0);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Update OrbitControls
                    if (controlsRef.current) {
                      controlsRef.current.target.set(0, 0, 0);
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [0, 15, 0],
                      rotation: [-Math.PI/2, 0, 0]
                    }));
                  }
                }}
                title="มุมมองจากด้านบน"
              >
                <Move3D className="w-4 h-4" />
              </Button>
              
              {/* Front view button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Set camera to front view
                    cameraRef.current.position.set(0, 5, 15);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Update OrbitControls
                    if (controlsRef.current) {
                      controlsRef.current.target.set(0, 0, 0);
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [0, 5, 15],
                      rotation: [0, 0, 0]
                    }));
                  }
                }}
                title="มุมมองจากด้านหน้า"
              >
                <Camera className="w-4 h-4" />
              </Button>
              
              {/* Side view button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (cameraRef.current) {
                    // Set camera to side view
                    cameraRef.current.position.set(15, 5, 0);
                    cameraRef.current.lookAt(0, 0, 0);
                    
                    // Update OrbitControls
                    if (controlsRef.current) {
                      controlsRef.current.target.set(0, 0, 0);
                      controlsRef.current.update();
                    }
                    
                    // Update camera settings state
                    setCameraSettings(prev => ({
                      ...prev,
                      position: [15, 5, 0],
                      rotation: [0, -Math.PI/2, 0]
                    }));
                  }
                }}
                title="มุมมองจากด้านข้าง"
              >
                <Box className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Settings Panel */}
          <Card className="w-80 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm">การตั้งค่า 3 มิติ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* View Mode */}
              <div>
                <label className="text-sm font-medium">โหมดการแสดงผล</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['realistic', 'wireframe', 'xray', 'blueprint'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode.mode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode(prev => ({ ...prev, mode }))}
                      className="capitalize"
                    >
                      {mode === 'realistic' ? 'สมจริง' : 
                       mode === 'wireframe' ? 'โครงลาย' : 
                       mode === 'xray' ? 'เอ็กซเรย์' : 
                       'พิมพ์เขียว'}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* View Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium">ตัวเลือกการแสดงผล</label>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">แสดงการเชื่อมต่อ</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(prev => ({ 
                      ...prev, 
                      showConnections: !prev.showConnections 
                    }))}
                  >
                    {viewMode.showConnections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">แสดงป้ายชื่อ</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(prev => ({ 
                      ...prev, 
                      showLabels: !prev.showLabels 
                    }))}
                  >
                    {viewMode.showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">แสดงตาราง</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(prev => ({ 
                      ...prev, 
                      showGrid: !prev.showGrid 
                    }))}
                  >
                    {viewMode.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Lighting Controls */}
              <div className="space-y-3">
                <label className="text-sm font-medium">แสงสว่าง</label>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">แสงโดยรอบ</span>
                    <span className="text-xs">{Math.round(lightingSettings.ambientIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[lightingSettings.ambientIntensity]}
                    onValueChange={([value]) => 
                      setLightingSettings(prev => ({ ...prev, ambientIntensity: value }))
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">แสงทิศทาง</span>
                    <span className="text-xs">{Math.round(lightingSettings.directionalIntensity * 100)}%</span>
                  </div>
                  <Slider
                    value={[lightingSettings.directionalIntensity]}
                    onValueChange={([value]) => 
                      setLightingSettings(prev => ({ ...prev, directionalIntensity: value }))
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">เงา</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLightingSettings(prev => ({ 
                      ...prev, 
                      shadows: !prev.shadows 
                    }))}
                  >
                    {lightingSettings.shadows ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Camera Controls */}
              <div className="space-y-3">
                <label className="text-sm font-medium">กล้อง</label>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">มุมมองกล้อง</span>
                    <span className="text-xs">{cameraSettings.fov}°</span>
                  </div>
                  <Slider
                    value={[cameraSettings.fov]}
                    onValueChange={([value]) => {
                      setCameraSettings(prev => ({ ...prev, fov: value }));
                      if (cameraRef.current) {
                        cameraRef.current.fov = value;
                        cameraRef.current.updateProjectionMatrix();
                      }
                    }}
                    min={30}
                    max={120}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs">ตำแหน่งกล้อง</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to top view position
                          cameraRef.current.position.set(0, 15, 0);
                          cameraRef.current.lookAt(0, 0, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 0, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [0, 15, 0],
                            rotation: [-Math.PI/2, 0, 0]
                          }));
                        }
                      }}
                    >
                      มุมบน
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to front view position
                          cameraRef.current.position.set(0, 2, 15);
                          cameraRef.current.lookAt(0, 2, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 2, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [0, 2, 15],
                            rotation: [0, 0, 0]
                          }));
                        }
                      }}
                    >
                      มุมหน้า
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to side view position
                          cameraRef.current.position.set(15, 2, 0);
                          cameraRef.current.lookAt(0, 2, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 2, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [15, 2, 0],
                            rotation: [0, -Math.PI/2, 0]
                          }));
                        }
                      }}
                    >
                      มุมข้าง
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to isometric view position
                          cameraRef.current.position.set(10, 10, 10);
                          cameraRef.current.lookAt(0, 0, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 0, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [10, 10, 10],
                            rotation: [-Math.PI/4, Math.PI/4, 0]
                          }));
                        }
                      }}
                    >
                      มุมไอโซเมตริก
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to close view position
                          cameraRef.current.position.set(5, 3, 5);
                          cameraRef.current.lookAt(0, 1, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 1, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [5, 3, 5],
                            rotation: [-Math.PI/6, Math.PI/4, 0]
                          }));
                        }
                      }}
                    >
                      ระยะใกล้
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (cameraRef.current) {
                          // Set camera to far view position
                          cameraRef.current.position.set(20, 20, 20);
                          cameraRef.current.lookAt(0, 0, 0);
                          
                          // Update OrbitControls
                          if (controlsRef.current) {
                            controlsRef.current.target.set(0, 0, 0);
                            controlsRef.current.update();
                          }
                          
                          // Update camera settings state
                          setCameraSettings(prev => ({
                            ...prev,
                            position: [20, 20, 20],
                            rotation: [-Math.PI/4, Math.PI/4, 0]
                          }));
                        }
                      }}
                    >
                      ระยะไกล
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
