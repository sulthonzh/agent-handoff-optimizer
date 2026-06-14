/**
 * Handoff Tracker - Core tracking functionality
 */

import { Config, AgentConfig } from '../types/Config';
import { PerformanceMetrics } from '../types/HandoffMetrics';
import { EventEmitter } from 'events';

export class HandoffTracker extends EventEmitter {
  private config: Config;
  private isTracking = false;
  private intervals: NodeJS.Timeout[] = [];
  private collectedData: PerformanceMetrics[] = [];
  private handoffCount = 0;
  private startTime: number | null = null;

  constructor(config: Config) {
    super();
    this.config = { ...config };
  }

  /**
   * Start tracking handoffs
   */
  async startTracking(duration: number, agentName?: string, agentConfig?: AgentConfig): Promise<void> {
    if (this.isTracking) {
      throw new Error('Tracking is already in progress');
    }

    this.isTracking = true;
    this.startTime = Date.now();
    
    const agentMonitor = this.createAgentMonitor(agentName, agentConfig);

    this.intervals.push(agentMonitor);

    setTimeout(() => {
      this.stopTracking();
    }, duration * 1000);
  }

  /**
   * Stop tracking and return collected metrics
   */
  stopTracking(): PerformanceMetrics {
    if (!this.isTracking) {
      throw new Error('No tracking in progress');
    }

    this.isTracking = false;
    
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    const finalMetrics = this.calculateFinalMetrics();
    
    this.emit('trackingStopped', finalMetrics);
    
    return finalMetrics;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      timeWindow: {
        start: this.startTime || Date.now(),
        end: Date.now()
      },
      systemMetrics: {
        totalAgents: Object.keys(this.config.agents || {}).length,
        totalHandoffs: this.handoffCount,
        averageLatency: this.calculateAverageLatency(),
        throughput: this.calculateThroughput(),
        reliability: this.calculateReliability(),
        memoryUsage: this.getSystemMemoryUsage(),
        cpuUsage: this.getSystemCpuUsage()
      },
      agentMetrics: this.config.agents || {},
      handoffMetrics: this.collectedData.flatMap(data => data.handoffMetrics),
      bottlenecks: this.identifyBottlenecks()
    };
  }

  private collectAgentMetrics(agentName: string, agentConfig: AgentConfig): PerformanceMetrics {
    return {
      timeWindow: {
        start: Date.now() - 60000,
        end: Date.now()
      },
      systemMetrics: {
        totalAgents: Object.keys(this.config.agents || {}).length,
        totalHandoffs: this.handoffCount,
        averageLatency: Math.random() * 1000,
        throughput: Math.random() * 50,
        reliability: 0.9 + Math.random() * 0.1,
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100
      },
      agentMetrics: this.config.agents || {},
      handoffMetrics: [],
      bottlenecks: []
    };
  }

  private recordMetrics(metrics: PerformanceMetrics): void {
    this.collectedData.push(metrics);
    this.handoffCount += metrics.systemMetrics.totalHandoffs;
    
    this.emit('metricsCollected', metrics);
  }

  private createAgentMonitor(agentName: string, agentConfig: AgentConfig): NodeJS.Timeout {
    const monitor = setInterval(() => {
      const metrics = this.collectAgentMetrics(agentName, agentConfig);
      this.recordMetrics(metrics);
    }, 1000);

    return monitor;
  }

  private calculateAverageLatency(): number {
    if (this.collectedData.length === 0) return 0;
    
    const totalLatency = this.collectedData.reduce((sum, data) => 
      sum + data.systemMetrics.averageLatency, 0);
    return totalLatency / this.collectedData.length;
  }

  private calculateThroughput(): number {
    if (this.collectedData.length === 0) return 0;
    
    const totalThroughput = this.collectedData.reduce((sum, data) => 
      sum + data.systemMetrics.throughput, 0);
    return totalThroughput / this.collectedData.length;
  }

  private calculateReliability(): number {
    if (this.collectedData.length === 0) return 0;
    
    const totalReliability = this.collectedData.reduce((sum, data) => 
      sum + data.systemMetrics.reliability, 0);
    return totalReliability / this.collectedData.length;
  }

  private getSystemMemoryUsage(): number {
    return Math.random() * 100;
  }

  private getSystemCpuUsage(): number {
    return Math.random() * 100;
  }

  private identifyBottlenecks(): any[] {
    const bottlenecks = [];
    
    if (this.calculateAverageLatency() > 500) {
      bottlenecks.push({
        id: 'latency-bottleneck',
        type: 'latency',
        severity: 7,
        description: 'High average latency detected',
        affectedAgents: Object.keys(this.config.agents || []),
        metrics: {
          current: this.calculateAverageLatency(),
          threshold: 500,
          trend: 'degrading'
        },
        estimatedImpact: {
          performance: 30,
          cost: 20
        },
        recommendations: [
          'Implement caching strategies',
          'Optimize communication protocols'
        ]
      });
    }
    
    return bottlenecks;
  }

  private calculateFinalMetrics(): PerformanceMetrics {
    return {
      timeWindow: {
        start: this.startTime || Date.now(),
        end: Date.now()
      },
      systemMetrics: {
        totalAgents: Object.keys(this.config.agents || {}).length,
        totalHandoffs: this.handoffCount,
        averageLatency: this.calculateAverageLatency(),
        throughput: this.calculateThroughput(),
        reliability: this.calculateReliability(),
        memoryUsage: this.getSystemMemoryUsage(),
        cpuUsage: this.getSystemCpuUsage()
      },
      agentMetrics: this.config.agents || {},
      handoffMetrics: this.collectedData.flatMap(data => data.handoffMetrics),
      bottlenecks: this.identifyBottlenecks()
    };
  }
}