/**
 * Optimization suggestion interfaces
 */

import { HandoffMetrics } from './HandoffMetrics';

export interface OptimizationSuggestion {
  id: string;
  type: 'latency' | 'throughput' | 'reliability' | 'resource' | 'strategy';
  priority: number; // 1-10 scale
  title: string;
  description: string;
  currentProblem: string;
  proposedSolution: string;
  expectedImprovement: {
    latency: number; // percentage
    throughput: number; // percentage
    reliability: number; // percentage
    cost: number; // percentage reduction
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeRequired: string;
    resourcesNeeded: string[];
    risks: string[];
  };
  validation: {
    successCriteria: string[];
    monitoring: string[];
    fallback: string;
  };
  metadata?: Record<string, any>;
}

export interface OptimizationPlan {
  id: string;
  name: string;
  targetAgent?: string;
  targetTimeframe: string;
  suggestions: OptimizationSuggestion[];
  totalImpact: {
    latency: number;
    throughput: number;
    reliability: number;
    cost: number;
  };
  implementationOrder: string[];
  estimatedCompletion: Date;
  dependencies: string[];
}

export interface BatchOptimization {
  batchSize: number;
  strategy: 'sequential' | 'parallel' | 'adaptive';
  agents: string[];
  timeframe: number;
  expectedImprovements: Record<string, number>;
  monitoring: {
    interval: number;
    metrics: string[];
  };
}

export interface CacheOptimization {
  strategy: 'lru' | 'lfu' | 'fifo' | 'adaptive';
  maxSize: number;
  ttl: number;
  compression: boolean;
  preloading: boolean;
  metrics: CacheOptimizationMetrics;
}

export interface CacheOptimizationMetrics {
  hitRate: number;
  memoryUsage: number;
  evictionRate: number;
  averageResponseTime: number;
  dataCompressionRatio: number;
}

export interface StreamOptimization {
  bufferSize: number;
  batchSize: number;
  compression: boolean;
  encryption: boolean;
  parallelStreams: number;
  adaptiveFlowControl: boolean;
  metrics: StreamOptimizationMetrics;
}

export interface StreamOptimizationMetrics {
  throughput: number;
    latency: number;
    bufferEfficiency: number;
    compressionRatio: number;
    streamStability: number;
}