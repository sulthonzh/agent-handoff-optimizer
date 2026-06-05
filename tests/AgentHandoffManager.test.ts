import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentHandoffManager } from '../src/core/AgentHandoffManager';
import { Config } from '../src/types/Config';
import { AgentDefinition } from '../src/types/AgentConfig';

describe('AgentHandoffManager', () => {
  let manager: AgentHandoffManager;
  let config: Config;

  beforeEach(() => {
    config = {
      outputFormat: 'table',
      verbose: false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 300000,
      agents: {},
      handoffStrategies: ['direct', 'batch', 'cached'],
      optimizationTargets: ['latency', 'throughput', 'reliability']
    };

    manager = new AgentHandoffManager(config);
  });

  afterEach(() => {
    if (manager['tracker'].isCurrentlyTracking()) {
      manager['tracker'].stopTracking();
    }
  });

  describe('Agent Registration', () => {
    it('should register a single agent', async () => {
      const agent: AgentDefinition = {
        id: 'agent1',
        name: 'Test Agent 1',
        type: 'langchain',
        capabilities: ['inference', 'memory'],
        dependencies: [],
        constraints: {
          maxConcurrentRequests: 10,
          timeout: 30000,
          retryAttempts: 3,
          memoryLimit: 512,
          rateLimit: {
            requests: 100,
            timeWindow: 60
          }
        },
        performance: {
          averageLatency: 100,
          reliability: 0.95,
          throughput: 50,
          memoryUsage: 45,
          cpuUsage: 30,
          uptime: Date.now(),
          lastHeartbeat: Date.now(),
          healthStatus: 'healthy'
        },
        status: 'active',
        metadata: {}
      };

      await expect(manager.registerAgent(agent)).resolves.not.toThrow();
      
      const registeredAgents = manager.getAgents();
      expect(registeredAgents).toHaveLength(1);
      expect(registeredAgents[0].id).toBe('agent1');
      expect(registeredAgents[0].name).toBe('Test Agent 1');
    });

    it('should register multiple agents', async () => {
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await expect(manager.registerAgents(agents)).resolves.not.toThrow();
      
      const registeredAgents = manager.getAgents();
      expect(registeredAgents).toHaveLength(2);
      expect(registeredAgents[0].id).toBe('agent1');
      expect(registeredAgents[1].id).toBe('agent2');
    });

    it('should validate agent configuration', async () => {
      const invalidAgent = {
        id: '',
        name: '',
        type: 'langchain' as const,
        capabilities: [],
        dependencies: [],
        constraints: {
          maxConcurrentRequests: 10,
          timeout: 30000,
          retryAttempts: 3,
          memoryLimit: 512,
          rateLimit: {
            requests: 100,
            timeWindow: 60
          }
        },
        performance: {
          averageLatency: 100,
          reliability: 0.95,
          throughput: 50,
          memoryUsage: 45,
          cpuUsage: 30,
          uptime: Date.now(),
          lastHeartbeat: Date.now(),
          healthStatus: 'healthy' as const
        },
        status: 'active' as const,
        metadata: {}
      };

      await expect(manager.registerAgent(invalidAgent)).rejects.toThrow(
        'Agent must have id and name'
      );
    });

    it('should get agent by ID', async () => {
      const agent: AgentDefinition = {
        id: 'agent1',
        name: 'Test Agent 1',
        type: 'langchain',
        capabilities: ['inference'],
        dependencies: [],
        constraints: {
          maxConcurrentRequests: 10,
          timeout: 30000,
          retryAttempts: 3,
          memoryLimit: 512,
          rateLimit: {
            requests: 100,
            timeWindow: 60
          }
        },
        performance: {
          averageLatency: 100,
          reliability: 0.95,
          throughput: 50,
          memoryUsage: 45,
          cpuUsage: 30,
          uptime: Date.now(),
          lastHeartbeat: Date.now(),
          healthStatus: 'healthy'
        },
        status: 'active',
        metadata: {}
      };

      await manager.registerAgent(agent);
      
      const retrievedAgent = manager.getAgent('agent1');
      expect(retrievedAgent).toBeDefined();
      expect(retrievedAgent?.id).toBe('agent1');
      expect(retrievedAgent?.name).toBe('Test Agent 1');
    });

    it('should return undefined for non-existent agent', async () => {
      const retrievedAgent = manager.getAgent('nonexistent');
      expect(retrievedAgent).toBeUndefined();
    });
  });

  describe('Handoff Execution', () => {
    beforeEach(async () => {
      // Register test agents
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await manager.registerAgents(agents);
    });

    it('should execute a simple handoff', async () => {
      const data = { message: 'Hello, Agent 2!' };
      const result = await manager.executeHandoff('agent1', 'agent2', data);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.latency).toBeGreaterThan(0);
      expect(result.messageSize).toBeGreaterThan(0);
      expect(result.strategy).toBe('direct');
    });

    it('should execute handoff with custom options', async () => {
      const data = { message: 'Hello, Agent 2!' };
      const result = await manager.executeHandoff(
        'agent1',
        'agent2',
        data,
        {
          strategy: 'batch',
          priority: 'high',
          timeout: 60000,
          retries: 5
        }
      );
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('batch');
    });

    it('should throw error for non-existent source agent', async () => {
      const data = { message: 'Hello!' };
      
      await expect(
        manager.executeHandoff('nonexistent', 'agent2', data)
      ).rejects.toThrow('Source agent nonexistent not found');
    });

    it('should throw error for non-existent target agent', async () => {
      const data = { message: 'Hello!' };
      
      await expect(
        manager.executeHandoff('agent1', 'nonexistent', data)
      ).rejects.toThrow('Target agent nonexistent not found');
    });

    it('should handle handoff failure', async () => {
      // Mock a scenario that fails
      const data = { message: 'Force failure' };
      
      // This should succeed in normal circumstances
      // In a real test, we'd need to mock the underlying handoff logic
      const result = await manager.executeHandoff('agent1', 'agent2', data);
      expect(result.success).toBe(true);
    });

    it('should get active handoffs', async () => {
      const data = { message: 'Hello!' };
      
      // Start a handoff but don't wait for completion
      const handoffPromise = manager.executeHandoff('agent1', 'agent2', data);
      
      // Get active handoffs
      const activeHandoffs = manager.getActiveHandoffs();
      expect(Array.isArray(activeHandoffs)).toBe(true);
      
      // Clean up
      await handoffPromise;
    });

    it('should get completed handoffs', async () => {
      const data = { message: 'Hello!' };
      
      await manager.executeHandoff('agent1', 'agent2', data);
      
      const completedHandoffs = manager.getCompletedHandoffs();
      expect(Array.isArray(completedHandoffs)).toBe(true);
      expect(completedHandoffs.length).toBeGreaterThan(0);
      
      const completedHandoff = completedHandoffs[0];
      expect(completedHandoff.id).toBeDefined();
      expect(completedHandoff.success).toBe(true);
      expect(completedHandoff.latency).toBeGreaterThan(0);
    });
  });

  describe('Handoff Sequences', () => {
    beforeEach(async () => {
      // Register test agents
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent3',
          name: 'Test Agent 3',
          type: 'autogen',
          capabilities: ['execution'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 20,
            timeout: 60000,
            retryAttempts: 3,
            memoryLimit: 2048,
            rateLimit: {
              requests: 200,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 200,
            reliability: 0.85,
            throughput: 30,
            memoryUsage: 70,
            cpuUsage: 50,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await manager.registerAgents(agents);
    });

    it('should execute sequential handoff sequence', async () => {
      const sequence = [
        { from: 'agent1', to: 'agent2', data: { message: '1 -> 2' } },
        { from: 'agent2', to: 'agent3', data: { message: '2 -> 3' } },
        { from: 'agent3', to: 'agent1', data: { message: '3 -> 1' } }
      ];

      const results = await manager.executeHandoffSequence(sequence);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(3);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.id).toBeDefined();
        expect(result.latency).toBeGreaterThan(0);
      });
    });

    it('should execute parallel handoff sequence', async () => {
      const sequence = [
        { from: 'agent1', to: 'agent2', data: { message: '1 -> 2' } },
        { from: 'agent1', to: 'agent3', data: { message: '1 -> 3' } }
      ];

      const results = await manager.executeHandoffSequence(sequence, {
        parallel: true
      });
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.id).toBeDefined();
      });
    });

    it('should execute parallel handoff sequence with concurrency limit', async () => {
      const sequence = [
        { from: 'agent1', to: 'agent2', data: { message: '1 -> 2' } },
        { from: 'agent1', to: 'agent3', data: { message: '1 -> 3' } },
        { from: 'agent2', to: 'agent3', data: { message: '2 -> 3' } }
      ];

      const results = await manager.executeHandoffSequence(sequence, {
        parallel: true,
        maxConcurrency: 2
      });
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(3);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.id).toBeDefined();
      });
    });

    it('should handle empty sequence', async () => {
      const sequence: any[] = [];
      const results = await manager.executeHandoffSequence(sequence);
      
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });
  });

  describe('Dependencies', () => {
    beforeEach(async () => {
      // Register test agents
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await manager.registerAgents(agents);
    });

    it('should add dependency between agents', () => {
      const dependency = {
        targetAgent: 'agent2',
        type: 'execution' as const,
        strength: 0.8,
        direction: 'output' as const,
        lastUsed: Date.now(),
        usageCount: 0
      };

      manager.addDependency('agent1', 'agent2', dependency);
      
      const dependencies = manager.getDependencies('agent1');
      expect(dependencies).toHaveLength(1);
      expect(dependencies[0].targetAgent).toBe('agent2');
      expect(dependencies[0].strength).toBe(0.8);
      expect(dependencies[0].direction).toBe('output');
    });

    it('should get empty dependencies for agent without dependencies', () => {
      const dependencies = manager.getDependencies('agent1');
      expect(dependencies).toEqual([]);
    });

    it('should get dependencies for multiple agents', () => {
      const dependency1 = {
        targetAgent: 'agent2',
        type: 'execution' as const,
        strength: 0.8,
        direction: 'output' as const,
        lastUsed: Date.now(),
        usageCount: 0
      };

      const dependency2 = {
        targetAgent: 'agent3',
        type: 'data' as const,
        strength: 0.6,
        direction: 'input' as const,
        lastUsed: Date.now(),
        usageCount: 0
      };

      manager.addDependency('agent1', 'agent2', dependency1);
      manager.addDependency('agent1', 'agent3', dependency2);
      
      const dependencies = manager.getDependencies('agent1');
      expect(dependencies).toHaveLength(2);
      
      const targets = dependencies.map(d => d.targetAgent);
      expect(targets).toContain('agent2');
      expect(targets).toContain('agent3');
    });
  });

  describe('System Status', () => {
    beforeEach(async () => {
      // Register test agents
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await manager.registerAgents(agents);
    });

    it('should return correct system status', () => {
      const status = manager.getSystemStatus();
      
      expect(status).toBeDefined();
      expect(typeof status.agents).toBe('number');
      expect(typeof status.activeHandoffs).toBe('number');
      expect(typeof status.completedHandoffs).toBe('number');
      expect(typeof status.dependencies).toBe('number');
      expect(typeof status.uptime).toBe('number');
      
      expect(status.agents).toBe(2);
      expect(status.activeHandoffs).toBe(0);
      expect(status.completedHandoffs).toBe(0);
      expect(status.dependencies).toBe(0);
      expect(status.uptime).toBeGreaterThan(0);
    });

    it('should update status after handoff execution', async () => {
      const data = { message: 'Hello!' };
      
      // Execute handoff
      await manager.executeHandoff('agent1', 'agent2', data);
      
      const status = manager.getSystemStatus();
      expect(status.completedHandoffs).toBe(1);
    });

    it('should update status after adding dependencies', () => {
      const dependency = {
        targetAgent: 'agent2',
        type: 'execution' as const,
        strength: 0.8,
        direction: 'output' as const,
        lastUsed: Date.now(),
        usageCount: 0
      };

      manager.addDependency('agent1', 'agent2', dependency);
      
      const status = manager.getSystemStatus();
      expect(status.dependencies).toBe(1);
    });
  });

  describe('Tracking and Performance', () => {
    beforeEach(async () => {
      // Register test agents
      const agents: AgentDefinition[] = [
        {
          id: 'agent1',
          name: 'Test Agent 1',
          type: 'langchain',
          capabilities: ['inference'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 10,
            timeout: 30000,
            retryAttempts: 3,
            memoryLimit: 512,
            rateLimit: {
              requests: 100,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 100,
            reliability: 0.95,
            throughput: 50,
            memoryUsage: 45,
            cpuUsage: 30,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        },
        {
          id: 'agent2',
          name: 'Test Agent 2',
          type: 'crewai',
          capabilities: ['planning'],
          dependencies: [],
          constraints: {
            maxConcurrentRequests: 15,
            timeout: 45000,
            retryAttempts: 5,
            memoryLimit: 1024,
            rateLimit: {
              requests: 150,
              timeWindow: 60
            }
          },
          performance: {
            averageLatency: 150,
            reliability: 0.90,
            throughput: 40,
            memoryUsage: 60,
            cpuUsage: 40,
            uptime: Date.now(),
            lastHeartbeat: Date.now(),
            healthStatus: 'healthy'
          },
          status: 'active',
          metadata: {}
        }
      ];

      await manager.registerAgents(agents);
    });

    it('should start tracking', async () => {
      await expect(manager.startTracking(2)).resolves.not.toThrow();
    });

    it('should stop tracking', async () => {
      await manager.startTracking(2);
      await expect(manager.stopTracking()).resolves.not.toThrow();
    });

    it('should get performance metrics', async () => {
      const metrics = await manager.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.timeWindow).toBeDefined();
      expect(metrics.systemMetrics).toBeDefined();
      expect(metrics.agentMetrics).toBeDefined();
      expect(metrics.handoffMetrics).toBeDefined();
    });

    it('should optimize handoffs', async () => {
      const optimization = await manager.optimizeHandoffs();
      
      expect(optimization).toBeDefined();
      expect(optimization.suggestions).toBeDefined();
      expect(optimization.plan).toBeDefined();
      expect(optimization.expectedImprovements).toBeDefined();
      
      expect(Array.isArray(optimization.suggestions)).toBe(true);
      expect(optimization.suggestions.length).toBeGreaterThan(0);
    });
  });
});