// Network Service for CCTV Visionary System

import { BaseService } from './base.service';
import { EventBus } from '../types/events';
import { 
  NetworkConfig, 
  NetworkSegment, 
  RoutingRule, 
  SecurityPolicy, 
  Connection, 
  CableType,
  NetworkAnalysis,
  BandwidthAnalysis,
  LatencyAnalysis,
  ReliabilityAnalysis,
  Device
} from '../types';

export interface NetworkTopology {
  devices: Device[];
  connections: Connection[];
  segments: NetworkSegment[];
}

export interface BandwidthRequirement {
  deviceId: string;
  required: number; // Mbps
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NetworkPath {
  fromDeviceId: string;
  toDeviceId: string;
  path: string[]; // Device IDs in path
  latency: number;
  bandwidth: number;
  reliability: number;
}

export class NetworkService extends BaseService {
  private networkConfig: NetworkConfig = {
    segments: [],
    routing: [],
    security: []
  };
  private connections = new Map<string, Connection>();
  private bandwidthRequirements = new Map<string, BandwidthRequirement>();
  private networkPaths = new Map<string, NetworkPath>();

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  async initialize(): Promise<void> {
    await this.loadDefaultNetworkConfig();
    this.initialized = true;
    console.log('NetworkService initialized');
  }

  async destroy(): Promise<void> {
    this.networkConfig = { segments: [], routing: [], security: [] };
    this.connections.clear();
    this.bandwidthRequirements.clear();
    this.networkPaths.clear();
    this.initialized = false;
    console.log('NetworkService destroyed');
  }

  // Network Configuration
  getNetworkConfig(): NetworkConfig {
    return { ...this.networkConfig };
  }

  updateNetworkConfig(config: Partial<NetworkConfig>): void {
    this.networkConfig = {
      segments: config.segments || this.networkConfig.segments,
      routing: config.routing || this.networkConfig.routing,
      security: config.security || this.networkConfig.security
    };
  }

  // Network Segments
  addNetworkSegment(segment: NetworkSegment): void {
    const existingIndex = this.networkConfig.segments.findIndex(s => s.id === segment.id);
    if (existingIndex > -1) {
      this.networkConfig.segments[existingIndex] = segment;
    } else {
      this.networkConfig.segments.push(segment);
    }
  }

  removeNetworkSegment(segmentId: string): void {
    this.networkConfig.segments = this.networkConfig.segments.filter(s => s.id !== segmentId);
  }

  getNetworkSegment(segmentId: string): NetworkSegment | undefined {
    return this.networkConfig.segments.find(s => s.id === segmentId);
  }

  getAllNetworkSegments(): NetworkSegment[] {
    return [...this.networkConfig.segments];
  }

  assignDeviceToSegment(deviceId: string, segmentId: string): void {
    const segment = this.getNetworkSegment(segmentId);
    if (!segment) {
      throw new Error(`Network segment ${segmentId} not found`);
    }

    // Remove device from other segments
    this.networkConfig.segments.forEach(seg => {
      seg.devices = seg.devices.filter(id => id !== deviceId);
    });

    // Add to new segment
    if (!segment.devices.includes(deviceId)) {
      segment.devices.push(deviceId);
    }
  }

  getDeviceSegment(deviceId: string): NetworkSegment | undefined {
    return this.networkConfig.segments.find(segment => 
      segment.devices.includes(deviceId)
    );
  }

  // Connections
  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  getDeviceConnections(deviceId: string): Connection[] {
    return this.getAllConnections().filter(conn => 
      conn.fromDeviceId === deviceId || conn.toDeviceId === deviceId
    );
  }

  getConnectionsByCableType(cableType: CableType): Connection[] {
    return this.getAllConnections().filter(conn => conn.cableType === cableType);
  }

  // Bandwidth Management
  setBandwidthRequirement(deviceId: string, requirement: BandwidthRequirement): void {
    this.bandwidthRequirements.set(deviceId, requirement);
  }

  getBandwidthRequirement(deviceId: string): BandwidthRequirement | undefined {
    return this.bandwidthRequirements.get(deviceId);
  }

  getAllBandwidthRequirements(): BandwidthRequirement[] {
    return Array.from(this.bandwidthRequirements.values());
  }

  calculateTotalBandwidthRequirement(): number {
    return this.getAllBandwidthRequirements()
      .reduce((total, req) => total + req.required, 0);
  }

  // Network Analysis
  async analyzeNetwork(topology: NetworkTopology): Promise<NetworkAnalysis> {
    const bandwidth = await this.analyzeBandwidth(topology);
    const latency = await this.analyzeLatency(topology);
    const reliability = await this.analyzeReliability(topology);

    return {
      bandwidth,
      latency,
      reliability
    };
  }

  private async analyzeBandwidth(topology: NetworkTopology): Promise<BandwidthAnalysis> {
    const totalRequired = this.calculateTotalBandwidthRequirement();
    const totalAvailable = this.calculateTotalAvailableBandwidth(topology);
    const utilization = totalAvailable > 0 ? (totalRequired / totalAvailable) * 100 : 0;
    const bottlenecks = this.findBandwidthBottlenecks(topology);

    return {
      totalRequired,
      totalAvailable,
      utilization,
      bottlenecks
    };
  }

  private async analyzeLatency(topology: NetworkTopology): Promise<LatencyAnalysis> {
    const paths = this.calculateNetworkPaths(topology);
    const latencies = paths.map(path => path.latency);
    const averageLatency = latencies.length > 0 ? 
      latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
    const criticalPaths = this.findCriticalPaths(paths);

    return {
      averageLatency,
      maxLatency,
      criticalPaths
    };
  }

  private async analyzeReliability(topology: NetworkTopology): Promise<ReliabilityAnalysis> {
    const redundancy = this.calculateNetworkRedundancy(topology);
    const failurePoints = this.findFailurePoints(topology);
    const mtbf = this.calculateMTBF(topology);

    return {
      redundancy,
      failurePoints,
      mtbf
    };
  }

  // Network Path Calculation
  calculateNetworkPaths(topology: NetworkTopology): NetworkPath[] {
    const paths: NetworkPath[] = [];
    const devices = topology.devices;

    // Simple path calculation - can be enhanced with graph algorithms
    for (let i = 0; i < devices.length; i++) {
      for (let j = i + 1; j < devices.length; j++) {
        const path = this.findShortestPath(
          devices[i].id, 
          devices[j].id, 
          topology.connections
        );
        if (path.length > 0) {
          paths.push({
            fromDeviceId: devices[i].id,
            toDeviceId: devices[j].id,
            path,
            latency: this.calculatePathLatency(path, topology.connections),
            bandwidth: this.calculatePathBandwidth(path, topology.connections),
            reliability: this.calculatePathReliability(path, topology.connections)
          });
        }
      }
    }

    return paths;
  }

  private findShortestPath(
    fromDeviceId: string, 
    toDeviceId: string, 
    connections: Connection[]
  ): string[] {
    // Simplified Dijkstra's algorithm implementation
    const graph = new Map<string, string[]>();
    
    // Build adjacency list
    connections.forEach(conn => {
      if (!graph.has(conn.fromDeviceId)) {
        graph.set(conn.fromDeviceId, []);
      }
      if (!graph.has(conn.toDeviceId)) {
        graph.set(conn.toDeviceId, []);
      }
      graph.get(conn.fromDeviceId)!.push(conn.toDeviceId);
      graph.get(conn.toDeviceId)!.push(conn.fromDeviceId);
    });

    // BFS to find shortest path
    const queue = [fromDeviceId];
    const visited = new Set<string>();
    const parent = new Map<string, string>();
    
    visited.add(fromDeviceId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current === toDeviceId) {
        // Reconstruct path
        const path: string[] = [];
        let node = toDeviceId;
        while (node !== fromDeviceId) {
          path.unshift(node);
          node = parent.get(node)!;
        }
        path.unshift(fromDeviceId);
        return path;
      }

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    return []; // No path found
  }

  private calculatePathLatency(path: string[], connections: Connection[]): number {
    let totalLatency = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const connection = connections.find(conn => 
        (conn.fromDeviceId === path[i] && conn.toDeviceId === path[i + 1]) ||
        (conn.fromDeviceId === path[i + 1] && conn.toDeviceId === path[i])
      );
      
      if (connection) {
        // Base latency calculation based on cable type and length
        let cableLatency = 0;
        switch (connection.cableType) {
          case 'cat5e':
          case 'cat6':
          case 'cat6a':
            cableLatency = connection.length * 0.000005; // 5ns per meter
            break;
          case 'fiber':
            cableLatency = connection.length * 0.000003; // 3ns per meter
            break;
          default:
            cableLatency = connection.length * 0.00001; // 10ns per meter
        }
        totalLatency += cableLatency;
      }
    }

    return totalLatency;
  }

  private calculatePathBandwidth(path: string[], connections: Connection[]): number {
    let minBandwidth = Infinity;
    
    for (let i = 0; i < path.length - 1; i++) {
      const connection = connections.find(conn => 
        (conn.fromDeviceId === path[i] && conn.toDeviceId === path[i + 1]) ||
        (conn.fromDeviceId === path[i + 1] && conn.toDeviceId === path[i])
      );
      
      if (connection && connection.bandwidth) {
        minBandwidth = Math.min(minBandwidth, connection.bandwidth);
      }
    }

    return minBandwidth === Infinity ? 0 : minBandwidth;
  }

  private calculatePathReliability(path: string[], connections: Connection[]): number {
    let reliability = 1.0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const connection = connections.find(conn => 
        (conn.fromDeviceId === path[i] && conn.toDeviceId === path[i + 1]) ||
        (conn.fromDeviceId === path[i + 1] && conn.toDeviceId === path[i])
      );
      
      if (connection) {
        // Simplified reliability based on cable type
        let cableReliability = 0.99;
        switch (connection.cableType) {
          case 'fiber':
            cableReliability = 0.999;
            break;
          case 'cat6a':
            cableReliability = 0.995;
            break;
          case 'cat6':
            cableReliability = 0.99;
            break;
          default:
            cableReliability = 0.98;
        }
        reliability *= cableReliability;
      }
    }

    return reliability;
  }

  // Helper Methods
  private calculateTotalAvailableBandwidth(topology: NetworkTopology): number {
    // Simplified calculation - sum of all connection bandwidths
    return topology.connections
      .filter(conn => conn.bandwidth)
      .reduce((total, conn) => total + (conn.bandwidth || 0), 0);
  }

  private findBandwidthBottlenecks(topology: NetworkTopology): any[] {
    // Simplified bottleneck detection
    return topology.connections
      .filter(conn => conn.bandwidth && conn.bandwidth < 100) // Less than 100 Mbps
      .map(conn => ({
        location: `${conn.fromDeviceId} -> ${conn.toDeviceId}`,
        severity: conn.bandwidth! < 10 ? 0.9 : 0.5,
        impact: 'Limited bandwidth may affect video quality',
        recommendation: 'Consider upgrading to higher bandwidth cable'
      }));
  }

  private findCriticalPaths(paths: NetworkPath[]): any[] {
    const averageLatency = paths.reduce((sum, path) => sum + path.latency, 0) / paths.length;
    
    return paths
      .filter(path => path.latency > averageLatency * 1.5)
      .map(path => ({
        devices: path.path,
        latency: path.latency,
        impact: 'High latency may affect real-time monitoring'
      }));
  }

  private calculateNetworkRedundancy(topology: NetworkTopology): number {
    // Simplified redundancy calculation
    const deviceCount = topology.devices.length;
    const connectionCount = topology.connections.length;
    
    if (deviceCount <= 1) return 0;
    
    const minConnections = deviceCount - 1; // Minimum for connectivity
    const redundantConnections = Math.max(0, connectionCount - minConnections);
    
    return redundantConnections / minConnections;
  }

  private findFailurePoints(topology: NetworkTopology): any[] {
    // Simplified single point of failure detection
    const failurePoints: any[] = [];
    
    topology.devices.forEach(device => {
      const connections = this.getDeviceConnections(device.id);
      if (connections.length === 1) {
        failurePoints.push({
          device: device.id,
          probability: 0.1, // 10% annual failure rate
          impact: 'Device will be isolated if connection fails',
          mitigation: 'Add redundant connection'
        });
      }
    });

    return failurePoints;
  }

  private calculateMTBF(topology: NetworkTopology): number {
    // Simplified MTBF calculation (hours)
    const baseReliability = 8760; // 1 year in hours
    const deviceCount = topology.devices.length;
    const connectionCount = topology.connections.length;
    
    // More devices and connections reduce overall MTBF
    return baseReliability / Math.sqrt(deviceCount + connectionCount);
  }

  private async loadDefaultNetworkConfig(): Promise<void> {
    // Load default network segments
    this.networkConfig.segments = [
      {
        id: 'cameras',
        name: 'Camera Network',
        subnet: '192.168.1.0/24',
        vlan: 10,
        devices: []
      },
      {
        id: 'management',
        name: 'Management Network',
        subnet: '192.168.100.0/24',
        vlan: 100,
        devices: []
      }
    ];

    // Load default routing rules
    this.networkConfig.routing = [
      {
        id: 'allow-camera-nvr',
        source: '192.168.1.0/24',
        destination: '192.168.1.100',
        protocol: 'tcp',
        port: 554,
        action: 'allow'
      }
    ];

    // Load default security policies
    this.networkConfig.security = [
      {
        id: 'camera-isolation',
        name: 'Camera Network Isolation',
        rules: [
          {
            id: 'deny-internet',
            type: 'firewall',
            configuration: {
              action: 'deny',
              destination: '0.0.0.0/0',
              source: '192.168.1.0/24'
            }
          }
        ],
        appliedTo: ['cameras']
      }
    ];
  }
}
