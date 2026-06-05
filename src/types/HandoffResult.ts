/**
 * Handoff result and optimization interfaces
 */

import { HandoffMetrics } from './HandoffMetrics';
import { Config } from './Config';

export interface HandoffResult {
  id: string;
  timestamp: number;
  success: boolean;
  latency: number;
  messageSize: number;
  strategy: string;
  optimization: {
    target: string;
    improvement: number;
    confidence: number;
  };
  metrics: HandoffMetrics;
  metadata: Record<string, any>;
}

export interface OptimizationResult {
  original: HandoffMetrics;
  optimized: HandoffMetrics;
  improvement: {
    latency: number;
    throughput: number;
    reliability: number;
  };
  savings: {
    time: number;
    resources: number;
  };
  confidence: number;
  appliedStrategies: string[];
}

export interface HandoffPattern {
  id: string;
  name: string;
  frequency: number;
  agents: string[];
  averageLatency: number;
  successRate: number;
  context: Record<string, any>;
  optimizationPotential: number;
  recommendedStrategy?: string;
}

export interface HandoffAnalysis {
  timeRange: {
    start: number;
    end: number;
  };
  totalHandoffs: number;
  patterns: HandoffPattern[];
  anomalies: Array<{
    type: string;
    severity: number;
    description: string;
    timestamp: number;
    affectedAgents: string[];
  }>;
  trends: {
    latency: 'improving' | 'stable' | 'degrading';
    throughput: 'improving' | 'stable' | 'degrading';
    reliability: 'improving' | 'stable' | 'degrading';
  };
  recommendations: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  averageSize: number;
  evictionCount: number;
  memoryUsage: number;
  effectiveness: number;
}

export interface StreamMetrics {
  throughput: number;
  latency: number;
  bufferTime: number;
  compressionRatio: number;
  streamInterruptions: number;
  averageChunkSize: number;
}