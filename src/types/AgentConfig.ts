/**
 * Agent configuration and capability interfaces
 */

import { Config } from './Config';

export interface AgentDefinition {
  id: string;
  name: string;
  type: 'langchain' | 'crewai' | 'autogen' | 'custom';
  capabilities: AgentCapability[];
  dependencies: string[];
  constraints: AgentConstraints;
  performance: AgentPerformance;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  metadata: Record<string, any>;
}

export interface AgentCapability {
  name: string;
  type: 'inference' | 'memory' | 'planning' | 'execution' | 'communication';
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  dependencies?: string[];
}

export interface AgentConstraints {
  maxConcurrentRequests: number;
  timeout: number;
  retryAttempts: number;
  memoryLimit: number;
  rateLimit: {
    requests: number;
    timeWindow: number; // seconds
  };
}

export interface AgentPerformance {
  averageLatency: number;
  reliability: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  lastHeartbeat: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface AgentHandoff {
  id: string;
  fromAgent: string;
  toAgent: string;
  data: any;
  strategy: string;
  timestamp: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  metadata: Record<string, any>;
}

export interface AgentDependency {
  targetAgent: string;
  type: 'data' | 'capability' | 'execution';
  strength: number; // 0-1 scale
  direction: 'input' | 'output' | 'bidirectional';
  lastUsed: number;
  usageCount: number;
}

export interface AgentRegistry {
  agents: Record<string, AgentDefinition>;
  handoffs: AgentHandoff[];
  dependencies: Record<string, AgentDependency[]>;
  performance: Record<string, AgentPerformance>;
  capacity: Record<string, {
    used: number;
    available: number;
    efficiency: number;
  }>;
}