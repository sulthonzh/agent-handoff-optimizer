import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HandoffOptimizer } from '../src/core/HandoffOptimizer';
import { Config } from '../src/types/Config';
import { PerformanceMetrics, HandoffMetrics } from '../src/types/HandoffMetrics';

describe('HandoffOptimizer', () => {
  let optimizer: HandoffOptimizer;
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

    optimizer = new HandoffOptimizer(config);
  });

  afterEach(() => {
    optimizer.clearCache();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(optimizer).toBeDefined();
      expect(optimizer.getOptimizationHistory()).toEqual([]);
      expect(optimizer.getCachedOptimizationResults()).toEqual([]);
    });

    it('should have proper configuration', () => {
      expect(config.trackLatency).toBe(true);
      expect(config.analyzePerformance).toBe(true);
      expect(config.cacheEnabled).toBe(true);
    });
  });

  describe('Optimization', () => {
    it('should optimize handoff performance', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      expect(optimization).toBeDefined();
      expect(optimization.suggestions).toBeDefined();
      expect(optimization.plan).toBeDefined();
      expect(optimization.expectedImprovements).toBeDefined();
      
      expect(Array.isArray(optimization.suggestions)).toBe(true);
      expect(optimization.suggestions.length).toBeGreaterThan(0);
      
      expect(optimization.plan).toHaveProperty('id');
      expect(optimization.plan).toHaveProperty('name');
      expect(optimization.plan).toHaveProperty('suggestions');
      expect(optimization.plan).toHaveProperty('totalImpact');
      expect(optimization.plan).toHaveProperty('implementationOrder');
    });

    it('should optimize with specific target', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'latency'
      });
      
      expect(optimization).toBeDefined();
      expect(optimization.suggestions.length).toBeGreaterThan(0);
      
      // Should have latency-optimized suggestions
      const latencySuggestions = optimization.suggestions.filter(s => s.type === 'latency');
      expect(latencySuggestions.length).toBeGreaterThan(0);
    });

    it('should optimize with specific strategy', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        strategy: 'cached'
      });
      
      expect(optimization).toBeDefined();
      expect(optimization.suggestions.length).toBeGreaterThan(0);
      
      // Should have cache-related suggestions
      const cachedSuggestions = optimization.suggestions.filter(s => 
        s.id.includes('cache') || s.title.toLowerCase().includes('cache')
      );
      expect(cachedSuggestions.length).toBeGreaterThan(0);
    });

    it('should handle optimization with constraints', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'latency',
        constraints: {
          maxLatency: 500,
          maxRetries: 3
        }
      });
      
      expect(optimization).toBeDefined();
      expect(optimization.suggestions.length).toBeGreaterThan(0);
    });

    it('should generate different optimization suggestions for different targets', async () => {
      const mockTrackingData = createMockTrackingData();
      
      const latencyOptimization = await optimizer.optimize(mockTrackingData, {
        target: 'latency'
      });
      
      const throughputOptimization = await optimizer.optimize(mockTrackingData, {
        target: 'throughput'
      });
      
      const latencySuggestions = latencyOptimization.suggestions.filter(s => s.type === 'latency');
      const throughputSuggestions = throughputOptimization.suggestions.filter(s => s.type === 'throughput');
      
      expect(latencySuggestions.length).toBeGreaterThan(0);
      expect(throughputSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Optimization History', () => {
    it('should maintain optimization history', async () => {
      const mockTrackingData = createMockTrackingData();
      
      await optimizer.optimize(mockTrackingData);
      await optimizer.optimize(mockTrackingData);
      
      const history = optimizer.getOptimizationHistory();
      expect(history).toHaveLength(2);
      
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('name');
      expect(history[0]).toHaveProperty('suggestions');
    });

    it('should cache optimization results', async () => {
      const mockTrackingData = createMockTrackingData();
      
      await optimizer.optimize(mockTrackingData);
      const cachedResults = optimizer.getCachedOptimizationResults();
      
      expect(cachedResults.length).toBeGreaterThan(0);
    });

    it('should clear cache correctly', async () => {
      const mockTrackingData = createMockTrackingData();
      
      await optimizer.optimize(mockTrackingData);
      expect(optimizer.getCachedOptimizationResults().length).toBeGreaterThan(0);
      
      optimizer.clearCache();
      expect(optimizer.getCachedOptimizationResults()).toEqual([]);
    });
  });

  describe('Optimization Suggestions', () => {
    it('should generate high-priority latency suggestions', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'latency'
      });
      
      const latencySuggestions = optimization.suggestions.filter(s => s.type === 'latency');
      expect(latencySuggestions.length).toBeGreaterThan(0);
      
      // Should have high-priority suggestions
      const highPrioritySuggestions = latencySuggestions.filter(s => s.priority >= 7);
      expect(highPrioritySuggestions.length).toBeGreaterThan(0);
    });

    it('should generate throughput optimization suggestions', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'throughput'
      });
      
      const throughputSuggestions = optimization.suggestions.filter(s => s.type === 'throughput');
      expect(throughputSuggestions.length).toBeGreaterThan(0);
    });

    it('should generate reliability optimization suggestions', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'reliability'
      });
      
      const reliabilitySuggestions = optimization.suggestions.filter(s => s.type === 'reliability');
      expect(reliabilitySuggestions.length).toBeGreaterThan(0);
    });

    it('should generate cost optimization suggestions', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData, {
        target: 'cost'
      });
      
      const costSuggestions = optimization.suggestions.filter(s => s.type === 'cost');
      expect(costSuggestions.length).toBeGreaterThan(0);
    });

    it('should have properly structured suggestions', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      expect(optimization.suggestions).toBeDefined();
      
      // Check first suggestion structure
      const suggestion = optimization.suggestions[0];
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('type');
      expect(suggestion).toHaveProperty('priority');
      expect(suggestion).toHaveProperty('title');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('currentProblem');
      expect(suggestion).toHaveProperty('proposedSolution');
      expect(suggestion).toHaveProperty('expectedImprovement');
      expect(suggestion).toHaveProperty('implementation');
      expect(suggestion).toHaveProperty('validation');
      
      // Check expected improvement structure
      expect(suggestion.expectedImprovement).toHaveProperty('latency');
      expect(suggestion.expectedImprovement).toHaveProperty('throughput');
      expect(suggestion.expectedImprovement).toHaveProperty('reliability');
      expect(suggestion.expectedImprovement).toHaveProperty('cost');
      
      // Check implementation structure
      expect(suggestion.implementation).toHaveProperty('complexity');
      expect(suggestion.implementation).toHaveProperty('timeRequired');
      expect(suggestion.implementation).toHaveProperty('resourcesNeeded');
      expect(suggestion.implementation).toHaveProperty('risks');
    });

    it('should sort suggestions by priority', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      // Check that suggestions are sorted by priority (descending)
      for (let i = 0; i < optimization.suggestions.length - 1; i++) {
        expect(optimization.suggestions[i].priority).toBeGreaterThanOrEqual(
          optimization.suggestions[i + 1].priority
        );
      }
    });
  });

  describe('Optimization Plan', () => {
    it('should create structured optimization plan', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      const plan = optimization.plan;
      expect(plan).toBeDefined();
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('targetTimeframe');
      expect(plan).toHaveProperty('suggestions');
      expect(plan).toHaveProperty('totalImpact');
      expect(plan).toHaveProperty('implementationOrder');
      expect(plan).toHaveProperty('estimatedCompletion');
      expect(plan).toHaveProperty('dependencies');
      
      expect(Array.isArray(plan.suggestions)).toBe(true);
      expect(plan.suggestions.length).toBeGreaterThan(0);
      
      expect(plan.totalImpact).toHaveProperty('latency');
      expect(plan.totalImpact).toHaveProperty('throughput');
      expect(plan.totalImpact).toHaveProperty('reliability');
      expect(plan.totalImpact).toHaveProperty('cost');
      
      expect(Array.isArray(plan.implementationOrder)).toBe(true);
      expect(Array.isArray(plan.dependencies)).toBe(true);
    });

    it('should calculate total impact correctly', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      const totalImpact = optimization.plan.totalImpact;
      expect(typeof totalImpact.latency).toBe('number');
      expect(typeof totalImpact.throughput).toBe('number');
      expect(typeof totalImpact.reliability).toBe('number');
      expect(typeof totalImpact.cost).toBe('number');
    });

    it('should determine implementation order', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      const implementationOrder = optimization.plan.implementationOrder;
      expect(Array.isArray(implementationOrder)).toBe(true);
      expect(implementationOrder.length).toBeGreaterThan(0);
      
      // Check that order IDs match suggestion IDs
      const suggestionIds = optimization.plan.suggestions.map(s => s.id);
      expect(implementationOrder.every(id => suggestionIds.includes(id))).toBe(true);
    });
  });

  describe('Expected Improvements', () => {
    it('should calculate expected improvements correctly', async () => {
      const mockTrackingData = createMockTrackingData();
      const optimization = await optimizer.optimize(mockTrackingData);
      
      const improvements = optimization.expectedImprovements;
      expect(improvements).toBeDefined();
      expect(typeof improvements.latency).toBe('number');
      expect(typeof improvements.throughput).toBe('number');
      expect(typeof improvements.reliability).toBe('number');
      expect(typeof improvements.cost).toBe('number');
      
      // Improvements should be reasonable percentages
      expect(improvements.latency).toBeGreaterThan(0);
      expect(improvements.latency).toBeLessThanOrEqual(100);
      expect(improvements.throughput).toBeGreaterThan(0);
      expect(improvements.throughput).toBeLessThanOrEqual(100);
      expect(improvements.reliability).toBeGreaterThan(0);
      expect(improvements.reliability).toBeLessThanOrEqual(100);
      expect(improvements.cost).toBeGreaterThan(0);
      expect(improvements.cost).toBeLessThanOrEqual(100);
    });
  });

  // Helper function to create mock tracking data
  function createMockTrackingData(): PerformanceMetrics {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    return {
      timeWindow: {
        start: oneHourAgo,
        end: now
      },
      systemMetrics: {
        totalAgents: 3,
        totalHandoffs: 150,
        averageLatency: 750,
        throughput: 25,
        reliability: 0.92,
        memoryUsage: 65,
        cpuUsage: 45
      },
      agentMetrics: {
        'agent1': {
          totalHandoffs: 50,
          averageLatency: 600,
          maxLatency: 1200,
          minLatency: 100,
          throughput: 20,
          reliability: 0.95,
          errorRate: 0.05,
          lastActivity: now,
          uptime: oneHourAgo,
          capabilities: ['inference']
        },
        'agent2': {
          totalHandoffs: 80,
          averageLatency: 800,
          maxLatency: 1500,
          minLatency: 200,
          throughput: 30,
          reliability: 0.90,
          errorRate: 0.10,
          lastActivity: now,
          uptime: oneHourAgo,
          capabilities: ['planning']
        },
        'agent3': {
          totalHandoffs: 20,
          averageLatency: 900,
          maxLatency: 1800,
          minLatency: 300,
          throughput: 10,
          reliability: 0.85,
          errorRate: 0.15,
          lastActivity: now,
          uptime: oneHourAgo,
          capabilities: ['execution']
        }
      },
      handoffMetrics: [
        {
          id: 'handoff-1',
          timestamp: now - 10 * 60 * 1000,
          fromAgent: 'agent1',
          toAgent: 'agent2',
          latency: 650,
          throughput: 25,
          reliability: 0.95,
          messageSize: 1024,
          status: 'success',
          strategy: 'direct'
        },
        {
          id: 'handoff-2',
          timestamp: now - 9 * 60 * 1000,
          fromAgent: 'agent2',
          toAgent: 'agent3',
          latency: 850,
          throughput: 20,
          reliability: 0.90,
          messageSize: 2048,
          status: 'success',
          strategy: 'direct'
        }
      ],
      bottlenecks: [
        {
          id: 'bottleneck-1',
          type: 'latency',
          severity: 7,
          description: 'High average latency detected',
          affectedAgents: ['agent1', 'agent2', 'agent3'],
          metrics: {
            current: 750,
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
        }
      ]
    };
  }
});