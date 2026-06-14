/**
 * Agent Handoff Manager - Central coordination for multi-agent systems
 */

import { Config } from '../types/Config';
import { HandoffMetrics, PerformanceMetrics } from '../types/HandoffMetrics';
import { HandoffResult } from '../types/HandoffResult';
import { AgentDefinition, AgentHandoff, AgentDependency } from '../types/AgentConfig';
import { HandoffTracker } from './HandoffTracker';
import { HandoffOptimizer } from './HandoffOptimizer';
import { EventEmitter } from 'events';

export class AgentHandoffManager extends EventEmitter {
  private config: Config;
  private agents: Map<string, AgentDefinition> = new Map();
  private handoffs: Map<string, AgentHandoff> = new Map();
  private dependencies: Map<string, AgentDependency[]> = new Map();
  private tracker: HandoffTracker;
  private optimizer: HandoffOptimizer;
  private activeHandoffs: Set<string> = new Set();
  private completedHandoffs: Map<string, HandoffResult> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];

  constructor(config: Config) {
    super();
    this.config = { ...config };
    this.tracker = new HandoffTracker(config);
    this.optimizer = new HandoffOptimizer(config);
    
    this.setupEventListeners();
  }

  /**
   * Register a new agent
   */
  async registerAgent(agent: AgentDefinition): Promise<void> {
    console.log(`🤖 Registering agent: ${agent.name}`);
    
    this.validateAgent(agent);
    
    this.agents.set(agent.id, agent);
    
    if (!this.dependencies.has(agent.id)) {
      this.dependencies.set(agent.id, []);
    }
    
    this.emit('agentRegistered', agent);
    
    console.log(`✅ Agent ${agent.name} registered successfully`);
  }

  /**
   * Register multiple agents
   */
  async registerAgents(agents: AgentDefinition[]): Promise<void> {
    console.log(`🤖 Registering ${agents.length} agents...`);
    
    for (const agent of agents) {
      await this.registerAgent(agent);
    }
    
    console.log(`✅ All agents registered successfully`);
  }

  /**
   * Execute a handoff between agents
   */
  async executeHandoff(
    fromAgent: string,
    toAgent: string,
    data: any,
    options: {
      strategy?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<HandoffResult> {
    console.log(`🔄 Executing handoff: ${fromAgent} → ${toAgent}`);
    
    if (!this.agents.has(fromAgent)) {
      throw new Error(`Source agent ${fromAgent} not found`);
    }
    if (!this.agents.has(toAgent)) {
      throw new Error(`Target agent ${toAgent} not found`);
    }
    
    const handoff: AgentHandoff = {
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromAgent,
      toAgent,
      data,
      strategy: options.strategy || 'direct',
      timestamp: Date.now(),
      status: 'pending',
      priority: options.priority || 'medium',
      timeout: options.timeout || 30000,
      metadata: {
        startTime: Date.now(),
        expectedDuration: options.timeout || 30000,
        retries: options.retries || 3
      }
    };
    
    this.handoffs.set(handoff.id, handoff);
    this.activeHandoffs.add(handoff.id);
    
    this.emit('handoffStarted', handoff);
    
    try {
      const result = await this.executeHandoffWithRetries(handoff, options.retries || 3);
      
      this.completedHandoffs.set(handoff.id, result);
      this.activeHandoffs.delete(handoff.id);
      
      this.recordHandoffMetrics(handoff, result);
      
      this.emit('handoffCompleted', { handoff, result });
      
      console.log(`✅ Handoff completed: ${fromAgent} → ${toAgent}`);
      return result;
      
    } catch (error) {
      const failedResult: HandoffResult = {
        id: handoff.id,
        timestamp: Date.now(),
        success: false,
        latency: 0,
        messageSize: JSON.stringify(data).length,
        strategy: handoff.strategy,
        optimization: {
          target: 'reliability',
          improvement: 0,
          confidence: 0
        },
        metrics: {
          id: handoff.id,
          timestamp: Date.now(),
          fromAgent,
          toAgent,
          latency: 0,
          throughput: 0,
          reliability: 0,
          messageSize: JSON.stringify(data).length,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          strategy: handoff.strategy
        },
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          attempts: options.retries || 3
        }
      };
      
      this.completedHandoffs.set(handoff.id, failedResult);
      this.activeHandoffs.delete(handoff.id);
      
      this.emit('handoffFailed', { handoff, error });
      
      console.log(`❌ Handoff failed: ${fromAgent} → ${toAgent}`);
      throw error;
    }
  }

  private async executeHandoffWithRetries(
    handoff: AgentHandoff,
    maxRetries: number
  ): Promise<HandoffResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        handoff.status = 'in_progress';
        this.handoffs.set(handoff.id, handoff);
        
        const result = await this.performHandoff(handoff);
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          console.log(`⚠️ Handoff attempt ${attempt + 1} failed, retrying...`);
          await this.delay(1000 * Math.pow(2, attempt)); // Exponential backoff
        } else {
          console.log(`❌ Handoff failed after ${maxRetries + 1} attempts`);
          throw lastError;
        }
      }
    }
    
    throw lastError!;
  }

  private async performHandoff(handoff: AgentHandoff): Promise<HandoffResult> {
    const startTime = Date.now();
    const fromAgent = this.agents.get(handoff.fromAgent)!;
    const toAgent = this.agents.get(handoff.toAgent)!;
    
    await this.delay(Math.random() * 200 + 50); // Simulate processing time
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      await this.delay(Math.random() * 100);
      
      const result: HandoffResult = {
        id: handoff.id,
        timestamp: endTime,
        success: true,
        latency,
        messageSize: JSON.stringify(handoff.data).length,
        strategy: handoff.strategy,
        optimization: {
          target: 'latency',
          improvement: Math.random() * 30,
          confidence: 0.8
        },
        metrics: {
          id: handoff.id,
          timestamp: endTime,
          fromAgent: handoff.fromAgent,
          toAgent: handoff.toAgent,
          latency,
          throughput: 1000 / latency, // Requests per second
          reliability: 1.0,
          messageSize: JSON.stringify(handoff.data).length,
          status: 'success',
          strategy: handoff.strategy
        },
        metadata: {
          processingTime: latency,
          dataSize: JSON.stringify(handoff.data).length,
          strategy: handoff.strategy
        }
      };
      
      return result;
    } else {
      throw new Error('Handoff failed due to agent error');
    }
  }

  async executeHandoffSequence(
    sequence: Array<{
      from: string;
      to: string;
      data: any;
      options?: any;
    }>,
    options: {
      strategy?: string;
      parallel?: boolean;
      maxConcurrency?: number;
    } = {}
  ): Promise<HandoffResult[]> {
    console.log(`🔄 Executing handoff sequence with ${sequence.length} handoffs...`);
    
    const results: HandoffResult[] = [];
    
    if (options.parallel && options.maxConcurrency) {
      const chunks = this.chunkArray(sequence, options.maxConcurrency);
      
      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (handoff) => {
          return this.executeHandoff(
            handoff.from,
            handoff.to,
            handoff.data,
            handoff.options || options
          );
        });
        
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }
    } else if (options.parallel) {
      const promises = sequence.map(async (handoff) => {
        return this.executeHandoff(
          handoff.from,
          handoff.to,
          handoff.data,
          handoff.options || options
        );
      });
      
      results.push(...await Promise.all(promises));
    } else {
      for (const handoff of sequence) {
        const result = await this.executeHandoff(
          handoff.from,
          handoff.to,
          handoff.data,
          handoff.options || options
        );
        results.push(result);
      }
    }
    
    console.log(`✅ Handoff sequence completed with ${results.length} results`);
    return results;
  }

  addDependency(fromAgent: string, toAgent: string, dependency: AgentDependency): void {
    if (!this.dependencies.has(fromAgent)) {
      this.dependencies.set(fromAgent, []);
    }
    
    this.dependencies.get(fromAgent)!.push({
      ...dependency,
      targetAgent: toAgent,
      lastUsed: Date.now(),
      usageCount: 0
    });
    
    console.log(`🔗 Added dependency: ${fromAgent} → ${toAgent}`);
  }

  getDependencies(agent: string): AgentDependency[] {
    return this.dependencies.get(agent) || [];
  }

  getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  getActiveHandoffs(): AgentHandoff[] {
    return Array.from(this.activeHandoffs).map(id => this.handoffs.get(id)!);
  }

  getCompletedHandoffs(): HandoffResult[] {
    return Array.from(this.completedHandoffs.values());
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const trackingData = await this.tracker.getResults();
    this.performanceHistory.push(trackingData);
    
    return trackingData;
  }

  async optimizeHandoffs(): Promise<any> {
    const trackingData = await this.getPerformanceMetrics();
    const optimization = await this.optimizer.optimize(trackingData);
    
    console.log('✅ Handoff optimization completed');
    return optimization;
  }

  async startTracking(duration: number = 60): Promise<void> {
    console.log('🔍 Starting handoff tracking...');
    await this.tracker.trackAll(duration);
  }

  async stopTracking(): Promise<void> {
    console.log('🛑 Stopping handoff tracking...');
    await this.tracker.stopTracking();
  }

  async getTrackingResults(): Promise<PerformanceMetrics> {
    return await this.tracker.getResults();
  }

  getSystemStatus(): {
    agents: number;
    activeHandoffs: number;
    completedHandoffs: number;
    dependencies: number;
    uptime: number;
  } {
    return {
      agents: this.agents.size,
      activeHandoffs: this.activeHandoffs.size,
      completedHandoffs: this.completedHandoffs.size,
      dependencies: Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0),
      uptime: Date.now() - this.startTime
    };
  }

  private validateAgent(agent: AgentDefinition): void {
    if (!agent.id || !agent.name) {
      throw new Error('Agent must have id and name');
    }
    
    if (!agent.capabilities || agent.capabilities.length === 0) {
      throw new Error('Agent must have at least one capability');
    }
    
    if (!agent.constraints) {
      throw new Error('Agent must have constraints');
    }
    
    if (!agent.performance) {
      throw new Error('Agent must have performance metrics');
    }
  }

  private recordHandoffMetrics(handoff: AgentHandoff, result: HandoffResult): void {
    const metrics: HandoffMetrics = {
      id: handoff.id,
      timestamp: result.timestamp,
      fromAgent: handoff.fromAgent,
      toAgent: handoff.toAgent,
      latency: result.latency,
      throughput: result.optimization.confidence * 100, // Mock throughput
      reliability: result.success ? 1.0 : 0.0,
      messageSize: result.messageSize,
      status: result.success ? 'success' : 'failed',
      error: result.success ? undefined : 'Handoff failed',
      strategy: handoff.strategy,
      metadata: result.metadata
    };
    
    (this.tracker as any).recordMetrics(metrics);
  }

  private setupEventListeners(): void {
    this.tracker.on('metrics', (metrics) => {
      this.emit('metrics', metrics);
    });
    
    this.tracker.on('handoff', (handoff) => {
      this.emit('handoff', handoff);
    });
    
    this.tracker.on('stats', (stats) => {
      this.emit('stats', stats);
    });
    
    this.tracker.on('trackingComplete', (results) => {
      this.emit('trackingComplete', results);
    });
    
    this.optimizer.on('optimizationComplete', (results) => {
      this.emit('optimizationComplete', results);
    });
    
    this.optimizer.on('planCreated', (plan) => {
      this.emit('planCreated', plan);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private startTime = Date.now();
}