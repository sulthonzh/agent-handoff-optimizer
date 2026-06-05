/**
 * Configuration interface for Agent Handoff Optimizer
 */

export interface Config {
  outputFormat: 'table' | 'json' | 'csv' | 'html';
  verbose: boolean;
  trackLatency: boolean;
  analyzePerformance: boolean;
  autoOptimize: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // milliseconds
  agents: Record<string, AgentConfig>;
  handoffStrategies: string[];
  optimizationTargets: string[];
}

export interface AgentConfig {
  name: string;
  type: 'langchain' | 'crewai' | 'autogen' | 'custom';
  endpoint?: string;
  capabilities: string[];
  dependencies: string[];
  version: string;
}

export interface HandoffStrategy {
  type: 'direct' | 'batch' | 'cached' | 'streaming';
  optimization: {
    batchSize?: number;
    cacheSize?: number;
    timeout: number;
    retries: number;
  };
}

export interface OptimizationTarget {
  name: 'latency' | 'throughput' | 'reliability' | 'cost';
  weight: number;
  constraints: {
    maxLatency?: number;
    minThroughput?: number;
    minReliability?: number;
  };
}