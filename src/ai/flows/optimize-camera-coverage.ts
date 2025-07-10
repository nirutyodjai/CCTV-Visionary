import { defineFlow, runFlow } from 'genkit';
import { generate } from 'genkit/ai';
import { gemini15Flash } from '@genkit-ai/googleai';
import type { CameraDevice, Floor, ArchitecturalElement } from '@/lib/types';

// Define types for coverage analysis
interface CoveragePoint {
  x: number;
  y: number;
  covered: boolean;
  cameras: string[]; // Camera IDs that cover this point
}

interface CoverageAnalysis {
  totalPoints: number;
  coveredPoints: number;
  coveragePercentage: number;
  blindSpots: { x: number; y: number }[];
  redundantAreas: { x: number; y: number }[];
  recommendations: string[];
}

interface OptimizationSuggestion {
  action: 'add' | 'move' | 'rotate' | 'remove';
  cameraId?: string;
  position?: { x: number; y: number };
  rotation?: number;
  type?: 'cctv-dome' | 'cctv-bullet' | 'cctv-ptz';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Helper function to calculate if a point is covered by a camera
function isPointCovered(
  point: { x: number; y: number },
  camera: CameraDevice,
  obstacles: ArchitecturalElement[]
): boolean {
  const distance = Math.sqrt(
    Math.pow(point.x - camera.x, 2) + Math.pow(point.y - camera.y, 2)
  );
  
  // Check if point is within camera range (convert from 0-1 scale to meters)
  const actualDistance = distance * 100; // Assume 100m max dimension
  if (actualDistance > camera.range) return false;
  
  // Calculate angle from camera to point
  const angleToPoint = Math.atan2(point.y - camera.y, point.x - camera.x) * 180 / Math.PI;
  let normalizedAngle = ((angleToPoint - camera.rotation + 360) % 360);
  if (normalizedAngle > 180) normalizedAngle -= 360;
  
  // Check if point is within camera FOV
  const halfFOV = camera.fov / 2;
  if (Math.abs(normalizedAngle) > halfFOV) return false;
  
  // Check for obstacles blocking the view
  for (const obstacle of obstacles) {
    if (obstacle.type === 'wall' && obstacle.points.length >= 2) {
      // Simple line intersection check
      if (lineIntersectsWall(camera, point, obstacle)) {
        return false;
      }
    }
  }
  
  return true;
}

// Helper function to check if line of sight intersects with a wall
function lineIntersectsWall(
  camera: { x: number; y: number },
  point: { x: number; y: number },
  wall: ArchitecturalElement
): boolean {
  if (wall.points.length < 2) return false;
  
  const wallStart = wall.points[0];
  const wallEnd = wall.points[1];
  
  // Line intersection algorithm
  const x1 = camera.x, y1 = camera.y;
  const x2 = point.x, y2 = point.y;
  const x3 = wallStart.x, y3 = wallStart.y;
  const x4 = wallEnd.x, y4 = wallEnd.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.0001) return false; // Lines are parallel
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// AI Flow for optimizing camera coverage
export const optimizeCameraCoverageFlow = defineFlow(
  {
    name: 'optimizeCameraCoverage',
    inputSchema: {
      type: 'object',
      properties: {
        floor: { type: 'object' },
        targetCoverage: { type: 'number' },
        priorityAreas: { type: 'array' },
        constraints: { type: 'object' }
      },
      required: ['floor']
    },
    outputSchema: {
      type: 'object',
      properties: {
        analysis: { type: 'object' },
        suggestions: { type: 'array' },
        optimizedLayout: { type: 'object' }
      }
    }
  },
  async (input: any) => {
    const { floor, targetCoverage = 95, priorityAreas = [], constraints = {} } = input;
    
    // Analyze current coverage
    const coverage = analyzeCoverage(floor as Floor);
    
    // Generate AI recommendations
    const aiContext = `
    ฉันมีผังแบบ CCTV ที่มี:
    - กล้อง ${floor.devices.filter((d: any) => d.type.startsWith('cctv-')).length} ตัว
    - การครอบคลุม ${coverage.coveragePercentage.toFixed(1)}%
    - จุดอับ ${coverage.blindSpots.length} จุด
    - เป้าหมายการครอบคลุม ${targetCoverage}%
    
    ข้อมูลกล้อง:
    ${floor.devices.filter((d: any) => d.type.startsWith('cctv-')).map((cam: any) => 
      `- ${cam.label}: ตำแหน่ง (${(cam.x * 100).toFixed(0)}, ${(cam.y * 100).toFixed(0)}) หันมุม ${cam.rotation}° มุมมอง ${cam.fov}°`
    ).join('\n')}
    
    กรุณาแนะนำการปรับปรุงเพื่อเพิ่มการครอบคลุมและลดจุดอับ
    `;
    
    const aiResponse = await generate(gemini15Flash, aiContext, {
      config: { 
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });
    
    // Generate optimization suggestions
    const suggestions = generateOptimizationSuggestions(coverage, floor as Floor, targetCoverage);
    
    return {
      analysis: coverage,
      suggestions,
      optimizedLayout: {
        description: aiResponse.text,
        estimatedCoverage: Math.min(targetCoverage, coverage.coveragePercentage + suggestions.length * 5),
        recommendations: coverage.recommendations
      }
    };
  }
);

// Analyze coverage of current camera setup
function analyzeCoverage(floor: Floor): CoverageAnalysis {
  const cameras = floor.devices.filter(d => d.type.startsWith('cctv-')) as CameraDevice[];
  const obstacles = floor.architecturalElements.filter(el => el.type === 'wall');
  
  // Create grid of points to check coverage
  const gridSize = 20; // 20x20 grid
  const points: CoveragePoint[] = [];
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const point = {
        x: x / (gridSize - 1),
        y: y / (gridSize - 1),
        covered: false,
        cameras: [] as string[]
      };
      
      // Check if this point is covered by any camera
      for (const camera of cameras) {
        if (isPointCovered(point, camera, obstacles)) {
          point.covered = true;
          point.cameras.push(camera.id);
        }
      }
      
      points.push(point);
    }
  }
  
  const coveredPoints = points.filter(p => p.covered).length;
  const coveragePercentage = (coveredPoints / points.length) * 100;
  
  // Find blind spots
  const blindSpots = points
    .filter(p => !p.covered)
    .map(p => ({ x: p.x, y: p.y }));
  
  // Find redundant areas (covered by 3+ cameras)
  const redundantAreas = points
    .filter(p => p.cameras.length >= 3)
    .map(p => ({ x: p.x, y: p.y }));
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (coveragePercentage < 90) {
    recommendations.push('การครอบคลุมต่ำกว่าเกณฑ์ ควรเพิ่มกล้องในจุดอับ');
  }
  if (blindSpots.length > 10) {
    recommendations.push('มีจุดอับมาก ควรใช้กล้อง PTZ หรือปรับตำแหน่ง');
  }
  if (redundantAreas.length > 20) {
    recommendations.push('มีพื้นที่ซ้ำซ้อนมาก ควรปรับมุมกล้องหรือย้ายตำแหน่ง');
  }
  
  return {
    totalPoints: points.length,
    coveredPoints,
    coveragePercentage,
    blindSpots,
    redundantAreas,
    recommendations
  };
}

// Generate specific optimization suggestions
function generateOptimizationSuggestions(
  coverage: CoverageAnalysis,
  floor: Floor,
  targetCoverage: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  
  // If coverage is too low, suggest adding cameras
  if (coverage.coveragePercentage < targetCoverage) {
    // Find the largest blind spot clusters
    const blindSpotClusters = clusterBlindSpots(coverage.blindSpots);
    
    for (const cluster of blindSpotClusters.slice(0, 3)) {
      suggestions.push({
        action: 'add',
        position: cluster.center,
        type: 'cctv-dome',
        reason: `เพิ่มกล้องเพื่อครอบคลุมจุดอับขนาดใหญ่ที่ตำแหน่ง (${(cluster.center.x * 100).toFixed(0)}, ${(cluster.center.y * 100).toFixed(0)})`,
        priority: 'high'
      });
    }
  }
  
  // If there are too many redundant areas, suggest optimization
  if (coverage.redundantAreas.length > 20) {
    const cameras = floor.devices.filter(d => d.type.startsWith('cctv-')) as CameraDevice[];
    const leastEffectiveCamera = findLeastEffectiveCamera(cameras, coverage);
    
    if (leastEffectiveCamera) {
      suggestions.push({
        action: 'rotate',
        cameraId: leastEffectiveCamera.id,
        rotation: leastEffectiveCamera.rotation + 45,
        reason: `ปรับมุมกล้อง ${leastEffectiveCamera.label} เพื่อลดพื้นที่ซ้ำซ้อน`,
        priority: 'medium'
      });
    }
  }
  
  return suggestions;
}

// Helper function to cluster blind spots
function clusterBlindSpots(blindSpots: { x: number; y: number }[]): Array<{
  center: { x: number; y: number };
  size: number;
}> {
  // Simple clustering - group nearby blind spots
  const clusters: Array<{ center: { x: number; y: number }; size: number }> = [];
  const clusterRadius = 0.1; // 10% of floor space
  
  for (const spot of blindSpots) {
    let addedToCluster = false;
    
    for (const cluster of clusters) {
      const distance = Math.sqrt(
        Math.pow(spot.x - cluster.center.x, 2) + Math.pow(spot.y - cluster.center.y, 2)
      );
      
      if (distance <= clusterRadius) {
        // Add to existing cluster
        cluster.center.x = (cluster.center.x * cluster.size + spot.x) / (cluster.size + 1);
        cluster.center.y = (cluster.center.y * cluster.size + spot.y) / (cluster.size + 1);
        cluster.size++;
        addedToCluster = true;
        break;
      }
    }
    
    if (!addedToCluster) {
      clusters.push({
        center: { x: spot.x, y: spot.y },
        size: 1
      });
    }
  }
  
  return clusters.sort((a, b) => b.size - a.size);
}

// Helper function to find least effective camera
function findLeastEffectiveCamera(cameras: CameraDevice[], coverage: CoverageAnalysis): CameraDevice | null {
  // This is a simplified implementation
  // In reality, you'd calculate coverage contribution for each camera
  return cameras.length > 0 ? cameras[0] : null;
}

// Export the flow function for use in actions
export async function optimizeCameraCoverage(floorData: Floor, targetCoverage: number = 95) {
  return await runFlow(optimizeCameraCoverageFlow, {
    floor: floorData,
    targetCoverage,
    priorityAreas: [],
    constraints: {}
  });
}
