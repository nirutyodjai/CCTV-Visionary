// Analysis Service for CCTV Visionary System

import { BaseService } from './base.service';
import { EventBus, CoverageAnalysisStartedEvent, CoverageAnalysisCompletedEvent } from '../types/events';
import { 
  CoverageAnalysis, 
  CoverageCell, 
  CoverageQuality, 
  CoverageStatistics,
  Recommendation,
  RecommendationType,
  Priority,
  Camera,
  FloorPlan,
  Point,
  FieldOfView
} from '../types';
import { AnalysisRequest, AnalysisParameters, AnalysisJob } from '../types/api';

export interface AnalysisOptions {
  resolution?: number; // Analysis grid resolution (cells per meter)
  qualityThreshold?: number; // Minimum quality threshold (0-1)
  redundancyLevel?: number; // Desired redundancy level
  includeBlindSpots?: boolean;
  calculateOverlap?: boolean;
  optimizePositions?: boolean;
}

export class AnalysisService extends BaseService {
  private activeJobs = new Map<string, AnalysisJob>();
  private completedAnalyses = new Map<string, CoverageAnalysis>();

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  async initialize(): Promise<void> {
    this.initialized = true;
    console.log('AnalysisService initialized');
  }

  async destroy(): Promise<void> {
    this.activeJobs.clear();
    this.completedAnalyses.clear();
    this.initialized = false;
    console.log('AnalysisService destroyed');
  }

  // Coverage Analysis
  async analyzeCoverage(
    floorPlan: FloorPlan, 
    cameras: Camera[], 
    options: AnalysisOptions = {}
  ): Promise<CoverageAnalysis> {
    const jobId = this.generateId();
    
    // Create and start job
    const job: AnalysisJob = {
      id: jobId,
      type: 'coverage',
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString()
    };
    this.activeJobs.set(jobId, job);

    // Emit started event
    const startEvent: CoverageAnalysisStartedEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'analysis:coverage:started',
      source: 'analysis',
      floorPlanId: floorPlan.id
    };
    this.emit(startEvent);

    try {
      // Perform analysis
      const analysis = await this.performCoverageAnalysis(floorPlan, cameras, options, job);
      
      // Update job status
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.results = analysis;

      // Store completed analysis
      this.completedAnalyses.set(analysis.id, analysis);

      // Emit completed event
      const completeEvent: CoverageAnalysisCompletedEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        type: 'analysis:coverage:completed',
        source: 'analysis',
        floorPlanId: floorPlan.id,
        results: analysis
      };
      this.emit(completeEvent);

      return analysis;
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  private async performCoverageAnalysis(
    floorPlan: FloorPlan,
    cameras: Camera[],
    options: AnalysisOptions,
    job: AnalysisJob
  ): Promise<CoverageAnalysis> {
    const resolution = options.resolution || 0.5; // 0.5 meter grid
    const bounds = floorPlan.bounds;
    
    // Calculate grid dimensions
    const gridWidth = Math.ceil(bounds.width / resolution);
    const gridHeight = Math.ceil(bounds.height / resolution);
    
    // Initialize coverage map
    const coverageMap: CoverageCell[][] = [];
    for (let y = 0; y < gridHeight; y++) {
      coverageMap[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        coverageMap[y][x] = {
          x: x * resolution,
          y: y * resolution,
          coverage: 0,
          cameras: [],
          quality: 'none'
        };
      }
    }

    // Update progress
    job.progress = 10;

    // Calculate coverage for each camera
    for (let i = 0; i < cameras.length; i++) {
      const camera = cameras[i];
      await this.calculateCameraCoverage(camera, coverageMap, floorPlan, resolution);
      job.progress = 10 + (80 * (i + 1)) / cameras.length;
    }

    // Calculate statistics
    const statistics = this.calculateCoverageStatistics(coverageMap, bounds.width * bounds.height);
    job.progress = 95;

    // Generate recommendations
    const recommendations = await this.generateCoverageRecommendations(
      floorPlan, 
      cameras, 
      coverageMap, 
      statistics
    );
    job.progress = 100;

    const analysis: CoverageAnalysis = {
      id: this.generateId(),
      floorPlanId: floorPlan.id,
      coverageMap,
      statistics,
      recommendations
    };

    return analysis;
  }

  private async calculateCameraCoverage(
    camera: Camera,
    coverageMap: CoverageCell[][],
    floorPlan: FloorPlan,
    resolution: number
  ): Promise<void> {
    const fov = camera.fov;
    const position = camera.position;
    
    // Calculate coverage area based on camera FOV
    for (let y = 0; y < coverageMap.length; y++) {
      for (let x = 0; x < coverageMap[y].length; x++) {
        const cell = coverageMap[y][x];
        const cellCenter = {
          x: cell.x + resolution / 2,
          y: cell.y + resolution / 2
        };

        if (this.isPointInCameraFOV(cellCenter, position, fov)) {
          const coverage = this.calculatePointCoverage(cellCenter, position, fov, floorPlan);
          
          if (coverage > 0) {
            cell.coverage = Math.max(cell.coverage, coverage);
            if (!cell.cameras.includes(camera.id)) {
              cell.cameras.push(camera.id);
            }
            cell.quality = this.determineCoverageQuality(cell.coverage, cell.cameras.length);
          }
        }
      }
    }
  }

  private isPointInCameraFOV(point: Point, cameraPosition: Point, fov: FieldOfView): boolean {
    const distance = this.calculateDistance(point, cameraPosition);
    
    // Check if point is within range
    if (distance > fov.range) {
      return false;
    }

    // Calculate angle from camera to point
    const angleToPoint = Math.atan2(
      point.y - cameraPosition.y,
      point.x - cameraPosition.x
    ) * (180 / Math.PI);

    // Normalize angles
    const normalizedCameraDirection = this.normalizeAngle(fov.direction);
    const normalizedPointAngle = this.normalizeAngle(angleToPoint);

    // Calculate angle difference
    const angleDiff = Math.abs(normalizedCameraDirection - normalizedPointAngle);
    const adjustedAngleDiff = Math.min(angleDiff, 360 - angleDiff);

    // Check if point is within FOV angle
    return adjustedAngleDiff <= fov.angle / 2;
  }

  private calculatePointCoverage(
    point: Point, 
    cameraPosition: Point, 
    fov: FieldOfView,
    floorPlan: FloorPlan
  ): number {
    const distance = this.calculateDistance(point, cameraPosition);
    
    // Base coverage decreases with distance
    let coverage = Math.max(0, 1 - distance / fov.range);

    // Check for obstructions (simplified)
    if (this.hasObstruction(point, cameraPosition, floorPlan)) {
      coverage *= 0.5; // Reduce coverage if obstructed
    }

    // Adjust for angle from camera center
    const angleToPoint = Math.atan2(
      point.y - cameraPosition.y,
      point.x - cameraPosition.x
    ) * (180 / Math.PI);
    
    const angleDiff = Math.abs(this.normalizeAngle(fov.direction) - this.normalizeAngle(angleToPoint));
    const adjustedAngleDiff = Math.min(angleDiff, 360 - angleDiff);
    
    const angleReduction = adjustedAngleDiff / (fov.angle / 2);
    coverage *= Math.max(0.1, 1 - angleReduction * 0.5);

    return Math.max(0, Math.min(1, coverage));
  }

  private hasObstruction(point1: Point, point2: Point, floorPlan: FloorPlan): boolean {
    // Simplified obstruction checking - check if line intersects with walls
    const walls = floorPlan.elements.filter(element => element.type === 'wall');
    
    for (const wall of walls) {
      if (wall.points.length >= 2) {
        for (let i = 0; i < wall.points.length - 1; i++) {
          if (this.linesIntersect(point1, point2, wall.points[i], wall.points[i + 1])) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  private linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    // Line intersection algorithm
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-10) return false; // Lines are parallel
    
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  private determineCoverageQuality(coverage: number, cameraCount: number): CoverageQuality {
    if (coverage === 0) return 'none';
    
    // Factor in both coverage strength and redundancy
    const redundancyBonus = Math.min(cameraCount - 1, 2) * 0.1; // Max 20% bonus for redundancy
    const adjustedCoverage = coverage + redundancyBonus;
    
    if (adjustedCoverage >= 0.8) return 'excellent';
    if (adjustedCoverage >= 0.6) return 'good';
    if (adjustedCoverage >= 0.4) return 'fair';
    return 'poor';
  }

  private calculateCoverageStatistics(
    coverageMap: CoverageCell[][],
    totalArea: number
  ): CoverageStatistics {
    let coveredCells = 0;
    let totalCells = 0;
    const qualityDistribution: Record<CoverageQuality, number> = {
      none: 0,
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0
    };

    let totalRedundancy = 0;
    let coveredCellsForRedundancy = 0;

    for (const row of coverageMap) {
      for (const cell of row) {
        totalCells++;
        
        if (cell.coverage > 0) {
          coveredCells++;
          totalRedundancy += cell.cameras.length;
          coveredCellsForRedundancy++;
        }
        
        qualityDistribution[cell.quality]++;
      }
    }

    const coveragePercentage = totalCells > 0 ? (coveredCells / totalCells) * 100 : 0;
    const redundancyLevel = coveredCellsForRedundancy > 0 ? 
      totalRedundancy / coveredCellsForRedundancy : 0;

    // Convert cell counts to area
    const cellArea = totalArea / totalCells;
    const coveredArea = coveredCells * cellArea;

    return {
      totalArea,
      coveredArea,
      coveragePercentage,
      redundancyLevel,
      qualityDistribution
    };
  }

  private async generateCoverageRecommendations(
    floorPlan: FloorPlan,
    cameras: Camera[],
    coverageMap: CoverageCell[][],
    statistics: CoverageStatistics
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Find coverage gaps
    const gapRecommendations = this.findCoverageGaps(coverageMap, floorPlan);
    recommendations.push(...gapRecommendations);

    // Check for redundancy issues
    const redundancyRecommendations = this.checkRedundancy(coverageMap, statistics);
    recommendations.push(...redundancyRecommendations);

    // Optimize camera positions
    const positionRecommendations = this.optimizeCameraPositions(cameras, coverageMap);
    recommendations.push(...positionRecommendations);

    return recommendations;
  }

  private findCoverageGaps(coverageMap: CoverageCell[][], floorPlan: FloorPlan): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const gapAreas: Point[] = [];

    // Find uncovered areas
    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell.coverage === 0) {
          gapAreas.push({ x: cell.x, y: cell.y });
        }
      }
    }

    // Group nearby gaps and create recommendations
    const gapClusters = this.clusterPoints(gapAreas, 5); // 5 meter clustering
    
    for (const cluster of gapClusters) {
      if (cluster.length > 10) { // Significant gap
        const centerPoint = this.calculateClusterCenter(cluster);
        
        recommendations.push({
          id: this.generateId(),
          type: 'coverage_gap',
          priority: 'high',
          title: 'Coverage Gap Detected',
          description: `Significant uncovered area detected at coordinates (${centerPoint.x.toFixed(1)}, ${centerPoint.y.toFixed(1)})`,
          impact: 'Security vulnerability - blind spot in surveillance coverage',
          action: {
            type: 'add_camera',
            parameters: {
              position: centerPoint,
              cameraType: 'dome',
              reason: 'Coverage gap mitigation'
            },
            estimatedCost: 500,
            estimatedTime: 4
          }
        });
      }
    }

    return recommendations;
  }

  private checkRedundancy(coverageMap: CoverageCell[][], statistics: CoverageStatistics): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (statistics.redundancyLevel < 1.2) {
      recommendations.push({
        id: this.generateId(),
        type: 'redundancy',
        priority: 'medium',
        title: 'Low Redundancy Level',
        description: `Current redundancy level is ${statistics.redundancyLevel.toFixed(2)}, below recommended 1.2`,
        impact: 'Reduced system reliability - camera failures may create blind spots',
        action: {
          type: 'add_camera',
          parameters: {
            reason: 'Improve redundancy',
            targetRedundancy: 1.5
          },
          estimatedCost: 300,
          estimatedTime: 2
        }
      });
    }

    return recommendations;
  }

  private optimizeCameraPositions(cameras: Camera[], coverageMap: CoverageCell[][]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check for cameras with poor coverage efficiency
    for (const camera of cameras) {
      const efficiency = this.calculateCameraEfficiency(camera, coverageMap);
      
      if (efficiency < 0.6) {
        recommendations.push({
          id: this.generateId(),
          type: 'positioning',
          priority: 'medium',
          title: 'Camera Position Optimization',
          description: `Camera ${camera.name} has low coverage efficiency (${(efficiency * 100).toFixed(1)}%)`,
          impact: 'Suboptimal camera placement reduces coverage effectiveness',
          action: {
            type: 'move_camera',
            parameters: {
              cameraId: camera.id,
              reason: 'Optimize coverage efficiency'
            },
            estimatedCost: 100,
            estimatedTime: 1
          }
        });
      }
    }

    return recommendations;
  }

  private calculateCameraEfficiency(camera: Camera, coverageMap: CoverageCell[][]): number {
    let totalCoverage = 0;
    let cellCount = 0;

    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell.cameras.includes(camera.id)) {
          totalCoverage += cell.coverage;
          cellCount++;
        }
      }
    }

    return cellCount > 0 ? totalCoverage / cellCount : 0;
  }

  // Utility Methods
  private calculateDistance(point1: Point, point2: Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  private clusterPoints(points: Point[], maxDistance: number): Point[][] {
    const clusters: Point[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;

      const cluster = [points[i]];
      visited.add(i);

      for (let j = i + 1; j < points.length; j++) {
        if (visited.has(j)) continue;

        if (this.calculateDistance(points[i], points[j]) <= maxDistance) {
          cluster.push(points[j]);
          visited.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  private calculateClusterCenter(cluster: Point[]): Point {
    const totalX = cluster.reduce((sum, point) => sum + point.x, 0);
    const totalY = cluster.reduce((sum, point) => sum + point.y, 0);
    
    return {
      x: totalX / cluster.length,
      y: totalY / cluster.length
    };
  }

  // Public API Methods
  getAnalysisJob(jobId: string): AnalysisJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAllActiveJobs(): AnalysisJob[] {
    return Array.from(this.activeJobs.values());
  }

  getCompletedAnalysis(analysisId: string): CoverageAnalysis | undefined {
    return this.completedAnalyses.get(analysisId);
  }

  getAllCompletedAnalyses(): CoverageAnalysis[] {
    return Array.from(this.completedAnalyses.values());
  }

  cancelAnalysisJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (job && job.status === 'running') {
      job.status = 'cancelled';
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
