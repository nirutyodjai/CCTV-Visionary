// WiFi Analysis Service for CCTV Visionary System

import { BaseService } from './base.service';
import { EventBus } from '../types/events';
import { 
  AccessPoint, 
  WiFiCamera, 
  WirelessCoverageAnalysis,
  WirelessCoverageCell,
  WirelessSignalQuality,
  WirelessRecommendation,
  FloorPlan,
  Point,
  MaterialType,
  SignalQuality
} from '../types';

export interface WiFiAnalysisOptions {
  resolution?: number; // Analysis grid resolution (cells per meter)
  frequencyBands?: ('2.4GHz' | '5GHz' | '6GHz')[];
  includeInterference?: boolean;
  channelOptimization?: boolean;
  powerOptimization?: boolean;
}

export interface WiFiSurveyResult {
  position: Point;
  measurements: WiFiMeasurement[];
  timestamp: Date;
}

export interface WiFiMeasurement {
  accessPointId: string;
  signalStrength: number; // dBm
  frequency: number; // MHz
  channel: number;
  noiseLevel: number; // dBm
  snr: number; // Signal-to-Noise Ratio
}

export interface ChannelUtilization {
  channel: number;
  frequency: '2.4GHz' | '5GHz' | '6GHz';
  utilization: number; // 0-100%
  interference: number; // 0-100%
  accessPoints: string[];
}

export class WiFiAnalysisService extends BaseService {
  private surveyResults = new Map<string, WiFiSurveyResult[]>();
  private channelData = new Map<number, ChannelUtilization>();

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  async initialize(): Promise<void> {
    await this.loadChannelData();
    this.initialized = true;
    console.log('WiFiAnalysisService initialized');
  }

  async destroy(): Promise<void> {
    this.surveyResults.clear();
    this.channelData.clear();
    this.initialized = false;
    console.log('WiFiAnalysisService destroyed');
  }

  // Main WiFi Analysis
  async analyzeWiFiCoverage(
    floorPlan: FloorPlan,
    accessPoints: AccessPoint[],
    wifiCameras: WiFiCamera[],
    options: WiFiAnalysisOptions = {}
  ): Promise<WirelessCoverageAnalysis> {
    const resolution = options.resolution || 1.0; // 1 meter grid
    const bounds = floorPlan.bounds;
    
    // Calculate grid dimensions
    const gridWidth = Math.ceil(bounds.width / resolution);
    const gridHeight = Math.ceil(bounds.height / resolution);
    
    // Initialize coverage map
    const coverageMap: WirelessCoverageCell[][] = [];
    for (let y = 0; y < gridHeight; y++) {
      coverageMap[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        coverageMap[y][x] = {
          x: x * resolution,
          y: y * resolution,
          signalStrength: -100, // Start with very weak signal
          accessPoints: [],
          quality: 'none',
          frequency: '2.4GHz',
          interference: 0
        };
      }
    }

    // Calculate coverage for each access point
    for (const ap of accessPoints) {
      await this.calculateAccessPointCoverage(ap, coverageMap, floorPlan, resolution);
    }

    // Calculate interference and channel conflicts
    if (options.includeInterference) {
      await this.calculateInterference(coverageMap, accessPoints);
    }

    // Calculate signal quality metrics
    const signalQuality = this.calculateSignalQuality(coverageMap);

    // Generate recommendations
    const recommendations = await this.generateWiFiRecommendations(
      floorPlan,
      accessPoints,
      wifiCameras,
      coverageMap,
      signalQuality,
      options
    );

    return {
      id: this.generateId(),
      floorPlanId: floorPlan.id,
      accessPoints,
      coverageMap,
      signalQuality,
      recommendations
    };
  }

  private async calculateAccessPointCoverage(
    accessPoint: AccessPoint,
    coverageMap: WirelessCoverageCell[][],
    floorPlan: FloorPlan,
    resolution: number
  ): Promise<void> {
    const position = accessPoint.position;
    const coverage = accessPoint.coverage;

    for (let y = 0; y < coverageMap.length; y++) {
      for (let x = 0; x < coverageMap[y].length; x++) {
        const cell = coverageMap[y][x];
        const cellCenter = {
          x: cell.x + resolution / 2,
          y: cell.y + resolution / 2
        };

        // Calculate signal strength for each frequency band
        const distance = this.calculateDistance(cellCenter, position);
        
        // Check 2.4GHz coverage
        if (distance <= coverage.range2_4GHz) {
          const signalStrength = this.calculateSignalStrength(
            distance,
            coverage.range2_4GHz,
            accessPoint.powerOutput,
            '2.4GHz',
            floorPlan,
            cellCenter,
            position
          );

          if (signalStrength > cell.signalStrength) {
            cell.signalStrength = signalStrength;
            cell.frequency = '2.4GHz';
            if (!cell.accessPoints.includes(accessPoint.id)) {
              cell.accessPoints.push(accessPoint.id);
            }
            cell.quality = this.determineSignalQuality(signalStrength);
          }
        }

        // Check 5GHz coverage
        if (distance <= coverage.range5GHz) {
          const signalStrength = this.calculateSignalStrength(
            distance,
            coverage.range5GHz,
            accessPoint.powerOutput,
            '5GHz',
            floorPlan,
            cellCenter,
            position
          );

          if (signalStrength > cell.signalStrength) {
            cell.signalStrength = signalStrength;
            cell.frequency = '5GHz';
            if (!cell.accessPoints.includes(accessPoint.id)) {
              cell.accessPoints.push(accessPoint.id);
            }
            cell.quality = this.determineSignalQuality(signalStrength);
          }
        }

        // Check 6GHz coverage if available
        if (coverage.range6GHz && distance <= coverage.range6GHz) {
          const signalStrength = this.calculateSignalStrength(
            distance,
            coverage.range6GHz,
            accessPoint.powerOutput,
            '6GHz',
            floorPlan,
            cellCenter,
            position
          );

          if (signalStrength > cell.signalStrength) {
            cell.signalStrength = signalStrength;
            cell.frequency = '6GHz';
            if (!cell.accessPoints.includes(accessPoint.id)) {
              cell.accessPoints.push(accessPoint.id);
            }
            cell.quality = this.determineSignalQuality(signalStrength);
          }
        }
      }
    }
  }

  private calculateSignalStrength(
    distance: number,
    maxRange: number,
    powerOutput: number,
    frequency: '2.4GHz' | '5GHz' | '6GHz',
    floorPlan: FloorPlan,
    targetPoint: Point,
    sourcePoint: Point
  ): number {
    // Free Space Path Loss calculation
    let frequencyMHz: number;
    switch (frequency) {
      case '2.4GHz':
        frequencyMHz = 2400;
        break;
      case '5GHz':
        frequencyMHz = 5000;
        break;
      case '6GHz':
        frequencyMHz = 6000;
        break;
    }

    // Basic path loss formula: FSPL = 20*log10(d) + 20*log10(f) + 32.45
    const fspl = 20 * Math.log10(distance) + 20 * Math.log10(frequencyMHz) + 32.45;
    
    // Start with transmit power and subtract path loss
    let signalStrength = powerOutput - fspl;

    // Account for obstacles and wall attenuation
    const obstacles = this.findObstacles(sourcePoint, targetPoint, floorPlan);
    for (const obstacle of obstacles) {
      signalStrength -= this.getAttenuationForMaterial(obstacle.material, frequency);
    }

    // Additional attenuation factors
    signalStrength -= this.getEnvironmentalAttenuation(distance, frequency);

    return Math.max(-100, signalStrength); // Cap at -100 dBm
  }

  private findObstacles(
    source: Point,
    target: Point,
    floorPlan: FloorPlan
  ): Array<{ material: MaterialType; thickness: number }> {
    const obstacles: Array<{ material: MaterialType; thickness: number }> = [];
    const walls = floorPlan.elements.filter(element => element.type === 'wall');

    for (const wall of walls) {
      if (wall.points.length >= 2) {
        for (let i = 0; i < wall.points.length - 1; i++) {
          if (this.linesIntersect(source, target, wall.points[i], wall.points[i + 1])) {
            // Determine wall material from properties or default to drywall
            const material = (wall.properties.material as MaterialType) || 'drywall';
            const thickness = wall.properties.thickness || 0.1; // Default 10cm
            obstacles.push({ material, thickness });
          }
        }
      }
    }

    return obstacles;
  }

  private getAttenuationForMaterial(material: MaterialType, frequency: '2.4GHz' | '5GHz' | '6GHz'): number {
    // Attenuation values in dB for different materials and frequencies
    const attenuationTable: Record<MaterialType, Record<string, number>> = {
      drywall: { '2.4GHz': 3, '5GHz': 4, '6GHz': 5 },
      brick: { '2.4GHz': 10, '5GHz': 15, '6GHz': 20 },
      concrete: { '2.4GHz': 15, '5GHz': 25, '6GHz': 35 },
      metal: { '2.4GHz': 25, '5GHz': 30, '6GHz': 35 },
      glass: { '2.4GHz': 2, '5GHz': 3, '6GHz': 4 },
      wood: { '2.4GHz': 4, '5GHz': 6, '6GHz': 8 }
    };

    return attenuationTable[material][frequency] || 5; // Default 5dB attenuation
  }

  private getEnvironmentalAttenuation(distance: number, frequency: '2.4GHz' | '5GHz' | '6GHz'): number {
    // Additional attenuation based on distance and frequency
    let attenuation = 0;

    // Distance-based attenuation (multipath, reflections)
    attenuation += Math.min(distance * 0.1, 10);

    // Frequency-specific attenuation
    switch (frequency) {
      case '2.4GHz':
        attenuation += 0; // 2.4GHz travels further
        break;
      case '5GHz':
        attenuation += distance * 0.05; // 5GHz has more attenuation
        break;
      case '6GHz':
        attenuation += distance * 0.08; // 6GHz has highest attenuation
        break;
    }

    return attenuation;
  }

  private determineSignalQuality(signalStrength: number): SignalQuality {
    if (signalStrength >= -30) return 'excellent';
    if (signalStrength >= -50) return 'good';
    if (signalStrength >= -70) return 'fair';
    if (signalStrength >= -85) return 'poor';
    return 'none';
  }

  private async calculateInterference(
    coverageMap: WirelessCoverageCell[][],
    accessPoints: AccessPoint[]
  ): Promise<void> {
    // Calculate channel conflicts and interference
    const channelMap = new Map<number, AccessPoint[]>();
    
    // Group access points by channel
    accessPoints.forEach(ap => {
      ap.wifiNetworks.forEach(network => {
        if (!channelMap.has(network.channel)) {
          channelMap.set(network.channel, []);
        }
        channelMap.get(network.channel)!.push(ap);
      });
    });

    // Calculate interference for each cell
    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell.accessPoints.length > 0) {
          cell.interference = this.calculateCellInterference(cell, accessPoints, channelMap);
        }
      }
    }
  }

  private calculateCellInterference(
    cell: WirelessCoverageCell,
    accessPoints: AccessPoint[],
    channelMap: Map<number, AccessPoint[]>
  ): number {
    let totalInterference = 0;
    
    // Get channels used by access points covering this cell
    const cellChannels = new Set<number>();
    cell.accessPoints.forEach(apId => {
      const ap = accessPoints.find(a => a.id === apId);
      if (ap) {
        ap.wifiNetworks.forEach(network => {
          cellChannels.add(network.channel);
        });
      }
    });

    // Calculate interference from overlapping channels
    cellChannels.forEach(channel => {
      const overlappingChannels = this.getOverlappingChannels(channel, cell.frequency);
      overlappingChannels.forEach(overlappingChannel => {
        const interferingAPs = channelMap.get(overlappingChannel) || [];
        totalInterference += interferingAPs.length * 0.1; // 10% per interfering AP
      });
    });

    return Math.min(totalInterference, 1.0); // Cap at 100%
  }

  private getOverlappingChannels(channel: number, frequency: '2.4GHz' | '5GHz' | '6GHz'): number[] {
    const overlapping: number[] = [];
    
    if (frequency === '2.4GHz') {
      // 2.4GHz channels overlap significantly
      for (let i = Math.max(1, channel - 4); i <= Math.min(14, channel + 4); i++) {
        if (i !== channel) overlapping.push(i);
      }
    } else {
      // 5GHz and 6GHz channels generally don't overlap as much
      for (let i = channel - 1; i <= channel + 1; i++) {
        if (i !== channel && i > 0) overlapping.push(i);
      }
    }
    
    return overlapping;
  }

  private calculateSignalQuality(coverageMap: WirelessCoverageCell[][]): WirelessSignalQuality {
    let totalSignal = 0;
    let cellCount = 0;
    let minSignal = 0;
    let maxSignal = -100;
    const deadZones: Point[] = [];
    const channelUtilization: Record<number, number> = {};
    let totalInterference = 0;

    for (const row of coverageMap) {
      for (const cell of row) {
        if (cell.quality !== 'none') {
          totalSignal += cell.signalStrength;
          cellCount++;
          minSignal = Math.min(minSignal, cell.signalStrength);
          maxSignal = Math.max(maxSignal, cell.signalStrength);
          totalInterference += cell.interference;
        } else {
          deadZones.push({ x: cell.x, y: cell.y });
        }
      }
    }

    return {
      averageSignalStrength: cellCount > 0 ? totalSignal / cellCount : -100,
      minSignalStrength: minSignal,
      maxSignalStrength: maxSignal,
      deadZones,
      interferenceLevel: cellCount > 0 ? totalInterference / cellCount : 0,
      channelUtilization
    };
  }

  private async generateWiFiRecommendations(
    floorPlan: FloorPlan,
    accessPoints: AccessPoint[],
    wifiCameras: WiFiCamera[],
    coverageMap: WirelessCoverageCell[][],
    signalQuality: WirelessSignalQuality,
    options: WiFiAnalysisOptions
  ): Promise<WirelessRecommendation[]> {
    const recommendations: WirelessRecommendation[] = [];

    // Find dead zones
    if (signalQuality.deadZones.length > 0) {
      const deadZoneClusters = this.clusterPoints(signalQuality.deadZones, 5);
      for (const cluster of deadZoneClusters) {
        if (cluster.length > 10) { // Significant dead zone
          const center = this.calculateClusterCenter(cluster);
          recommendations.push({
            id: this.generateId(),
            type: 'wireless_coverage',
            priority: 'high',
            title: 'WiFi Dead Zone Detected',
            description: `Large WiFi dead zone found at (${center.x.toFixed(1)}, ${center.y.toFixed(1)})`,
            impact: 'WiFi cameras in this area may have connectivity issues',
            action: {
              type: 'add_access_point',
              parameters: {
                position: center,
                reason: 'Eliminate dead zone'
              },
              estimatedCost: 200,
              estimatedTime: 2
            }
          });
        }
      }
    }

    // Check for poor signal areas
    if (signalQuality.averageSignalStrength < -60) {
      recommendations.push({
        id: this.generateId(),
        type: 'signal_strength',
        priority: 'medium',
        title: 'Weak WiFi Signal Coverage',
        description: `Average signal strength is ${signalQuality.averageSignalStrength.toFixed(1)} dBm`,
        impact: 'Poor signal may cause intermittent connectivity issues',
        action: {
          type: 'increase_signal_power',
          parameters: {
            reason: 'Improve overall signal strength'
          },
          estimatedCost: 50,
          estimatedTime: 1
        }
      });
    }

    // Check for high interference
    if (signalQuality.interferenceLevel > 0.3) {
      recommendations.push({
        id: this.generateId(),
        type: 'interference',
        priority: 'medium',
        title: 'High WiFi Interference',
        description: `Interference level is ${(signalQuality.interferenceLevel * 100).toFixed(1)}%`,
        impact: 'High interference may cause reduced throughput and reliability',
        action: {
          type: 'optimize_wifi_channel',
          parameters: {
            reason: 'Reduce channel conflicts'
          },
          estimatedCost: 0,
          estimatedTime: 0.5
        }
      });
    }

    // Check camera coverage
    for (const camera of wifiCameras) {
      if (camera.wifiCapable) {
        const signalAtCamera = this.getSignalStrengthAtPoint(camera.position, coverageMap);
        if (signalAtCamera < -70) {
          recommendations.push({
            id: this.generateId(),
            type: 'signal_strength',
            priority: 'high',
            title: `Weak Signal at Camera ${camera.name}`,
            description: `Camera has signal strength of ${signalAtCamera.toFixed(1)} dBm`,
            impact: 'Camera may experience connectivity issues or reduced video quality',
            action: {
              type: 'add_access_point',
              parameters: {
                position: camera.position,
                reason: `Improve signal for camera ${camera.name}`
              },
              estimatedCost: 200,
              estimatedTime: 2
            }
          });
        }
      }
    }

    return recommendations;
  }

  private getSignalStrengthAtPoint(point: Point, coverageMap: WirelessCoverageCell[][]): number {
    // Find the coverage cell that contains this point
    for (const row of coverageMap) {
      for (const cell of row) {
        if (point.x >= cell.x && point.x < cell.x + 1 && 
            point.y >= cell.y && point.y < cell.y + 1) {
          return cell.signalStrength;
        }
      }
    }
    return -100; // Default weak signal
  }

  // Channel Optimization
  async optimizeChannels(accessPoints: AccessPoint[]): Promise<Map<string, number>> {
    const optimizedChannels = new Map<string, number>();
    const usedChannels = new Set<number>();

    // Simple channel assignment algorithm
    const availableChannels = {
      '2.4GHz': [1, 6, 11], // Non-overlapping channels
      '5GHz': [36, 40, 44, 48, 149, 153, 157, 161], // Common 5GHz channels
      '6GHz': [1, 5, 9, 13, 17, 21, 25, 29] // 6GHz channels
    };

    for (const ap of accessPoints) {
      for (const network of ap.wifiNetworks) {
        const channels = availableChannels[network.frequency as keyof typeof availableChannels] || [1];
        
        // Find the least used channel
        let bestChannel = channels[0];
        let minUsage = Infinity;
        
        for (const channel of channels) {
          const usage = this.getChannelUsage(channel, accessPoints);
          if (usage < minUsage) {
            minUsage = usage;
            bestChannel = channel;
          }
        }
        
        optimizedChannels.set(`${ap.id}-${network.id}`, bestChannel);
      }
    }

    return optimizedChannels;
  }

  private getChannelUsage(channel: number, accessPoints: AccessPoint[]): number {
    let usage = 0;
    for (const ap of accessPoints) {
      for (const network of ap.wifiNetworks) {
        if (network.channel === channel) {
          usage++;
        }
      }
    }
    return usage;
  }

  // Survey and Measurement Methods
  async addSurveyMeasurement(floorPlanId: string, result: WiFiSurveyResult): Promise<void> {
    if (!this.surveyResults.has(floorPlanId)) {
      this.surveyResults.set(floorPlanId, []);
    }
    this.surveyResults.get(floorPlanId)!.push(result);
  }

  getSurveyResults(floorPlanId: string): WiFiSurveyResult[] {
    return this.surveyResults.get(floorPlanId) || [];
  }

  // Utility Methods
  private calculateDistance(point1: Point, point2: Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-10) return false;
    
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
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

  private async loadChannelData(): Promise<void> {
    // Load default channel utilization data
    const defaultChannels = [1, 6, 11, 36, 40, 44, 48, 149, 153, 157, 161];
    
    for (const channel of defaultChannels) {
      this.channelData.set(channel, {
        channel,
        frequency: channel <= 14 ? '2.4GHz' : '5GHz',
        utilization: Math.random() * 50, // Random initial utilization
        interference: Math.random() * 30,
        accessPoints: []
      });
    }
  }

  private generateId(): string {
    return `wifi-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
