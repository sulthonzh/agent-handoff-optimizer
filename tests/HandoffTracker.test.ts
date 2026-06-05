import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HandoffTracker } from '../src/core/HandoffTracker';
import { Config } from '../src/types/Config';

describe('HandoffTracker', () => {
  let tracker: HandoffTracker;
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
      agents: {
        'agent1': {
          name: 'Agent 1',
          type: 'langchain',
          capabilities: ['inference', 'memory'],
          dependencies: [],
          version: '1.0.0'
        },
        'agent2': {
          name: 'Agent 2',
          type: 'crewai',
          capabilities: ['planning', 'execution'],
          dependencies: [],
          version: '1.0.0'
        }
      },
      handoffStrategies: ['direct', 'batch', 'cached'],
      optimizationTargets: ['latency', 'throughput', 'reliability']
    };

    tracker = new HandoffTracker(config);
  });

  afterEach(() => {
    if (tracker.isCurrentlyTracking()) {
      tracker.stopTracking();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(tracker).toBeDefined();
      expect(tracker.isCurrentlyTracking()).toBe(false);
    });

    it('should have proper configuration', () => {
      expect(config.trackLatency).toBe(true);
      expect(config.analyzePerformance).toBe(true);
      expect(config.cacheEnabled).toBe(true);
    });
  });

  describe('Tracking', () => {
    it('should start tracking all agents', async () => {
      await expect(tracker.trackAll(2)).resolves.not.toThrow();
      expect(tracker.isCurrentlyTracking()).toBe(true);
    });

    it('should start tracking specific agent', async () => {
      await expect(tracker.trackAgent('agent1', 2)).resolves.not.toThrow();
      expect(tracker.isCurrentlyTracking()).toBe(true);
    });

    it('should throw error when tracking non-existent agent', async () => {
      await expect(tracker.trackAgent('nonexistent', 2)).rejects.toThrow(
        'Agent nonexistent not found in configuration'
      );
    });

    it('should throw error when already tracking', async () => {
      await tracker.trackAll(2);
      await expect(tracker.trackAgent('agent1', 2)).rejects.toThrow(
        'Already tracking'
      );
    });
  });

  describe('Stopping', () => {
    it('should stop tracking gracefully', async () => {
      await tracker.trackAll(1);
      await expect(tracker.stopTracking()).resolves.not.toThrow();
      expect(tracker.isCurrentlyTracking()).toBe(false);
    });

    it('should handle stop when not tracking', async () => {
      await expect(tracker.stopTracking()).resolves.not.toThrow();
    });
  });

  describe('Results', () => {
    it('should return tracking results', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results).toBeDefined();
      expect(results.systemMetrics).toBeDefined();
      expect(results.agentMetrics).toBeDefined();
      expect(results.handoffMetrics).toBeDefined();
    });

    it('should have proper structure in results', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results.timeWindow).toBeDefined();
      expect(results.timeWindow.start).toBeDefined();
      expect(results.timeWindow.end).toBeDefined();
      expect(results.systemMetrics.totalAgents).toBe(2);
    });

    it('should return metrics correctly', () => {
      const metrics = tracker.getAllMetrics();
      expect(metrics).toBeInstanceOf(Array);
    });

    it('should track duration correctly', async () => {
      await tracker.trackAll(2);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds
      await tracker.stopTracking();
      
      const duration = tracker.getTrackingDuration();
      expect(duration).toBeGreaterThan(1000);
    });
  });

  describe('Metrics Collection', () => {
    it('should collect latency metrics', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results.systemMetrics.averageLatency).toBeDefined();
      expect(typeof results.systemMetrics.averageLatency).toBe('number');
    });

    it('should collect throughput metrics', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results.systemMetrics.throughput).toBeDefined();
      expect(typeof results.systemMetrics.throughput).toBe('number');
    });

    it('should collect reliability metrics', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results.systemMetrics.reliability).toBeDefined();
      expect(typeof results.systemMetrics.reliability).toBe('number');
      expect(results.systemMetrics.reliability).toBeGreaterThan(0);
      expect(results.systemMetrics.reliability).toBeLessThanOrEqual(1);
    });

    it('should identify bottlenecks', async () => {
      await tracker.trackAll(1);
      await tracker.stopTracking();
      
      const results = await tracker.getResults();
      expect(results.bottlenecks).toBeDefined();
      expect(Array.isArray(results.bottlenecks)).toBe(true);
      
      // Bottlenecks should have proper structure
      if (results.bottlenecks.length > 0) {
        const bottleneck = results.bottlenecks[0];
        expect(bottleneck).toHaveProperty('id');
        expect(bottleneck).toHaveProperty('type');
        expect(bottleneck).toHaveProperty('severity');
        expect(bottleneck).toHaveProperty('description');
        expect(bottleneck).toHaveProperty('affectedAgents');
        expect(bottleneck).toHaveProperty('metrics');
        expect(bottleneck).toHaveProperty('estimatedImpact');
        expect(bottleneck).toHaveProperty('recommendations');
      }
    });
  });
});