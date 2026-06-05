/**
 * Handoff metrics and measurement interfaces
 */

import { AgentConfig } from './Config';

export interface HandoffMetrics {
  id: string;
  timestamp: number;
  fromAgent: string;
  toAgent: string;
  latency: number; // milliseconds
  throughput: number; // requests per second
  reliability: number; // 0-1 scale
  messageSize: number; // bytes
  status: 'success' | 'failed' | 'timeout';
  error?: string;
  context?: Record<string, any>;
  strategy: string;
  metadata?: Record<string, any>;
}

export interface AgentMetrics {
  name: string;
  totalHandoffs: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  throughput: number;
  reliability: number;
  errorRate: number;
  lastActivity: number;
  uptime: number;
  capabilities: string[];
}

export interface HandoffStats {
  totalHandoffs: number;
  averageLatency: number;
  medianLatency: number;
  p95Latency: number;
  p99Latency: number;
  minLatency: number;
  maxLatency: number;
  throughput: number;
  reliability: number;
  errorRate: number;
  totalDataTransferred: number;
  topErrorSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

export interface PerformanceMetrics {
  timeWindow: {
    start: number;
    end: number;
  };
  systemMetrics: {
    totalAgents: number;
    totalHandoffs: number;
    averageLatency: number;
    throughput: number;
    reliability: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  agentMetrics: Record<string, AgentMetrics>;
  handoffMetrics: HandoffMetrics[];
  bottlenecks: Bottleneck[];
}

export interface Bottleneck {
  id: string;
  type: 'latency' | 'throughput' | 'reliability' | 'resource';
  severity: number; // 1-10 scale
  description: string;
  affectedAgents: string[];
  metrics: {
    current: number;
    threshold: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  estimatedImpact: {
    performance: number; // percentage impact
    cost: number; // estimated cost increase
  };
  recommendations: string[];
}

export interface CapacityMetrics {
  maxConcurrentHandoffs: number;
  currentConcurrentHandoffs: number;
  queueDepth: number;
  averageWaitTime: number;
  utilization: number;
  health: 'healthy' | 'warning' | 'critical';
}

export interface ResourceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
  };
  network: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
  };
  disk: {
    usage: number; // percentage
    ioWait: number; // percentage
  };
}