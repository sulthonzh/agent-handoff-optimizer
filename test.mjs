import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HandoffTracker, HandoffOptimizer, AgentHandoffManager, HandoffVisualizer } from './dist/index.js';

const baseConfig = () => ({
  outputFormat: 'table', verbose: false, trackLatency: true, analyzePerformance: true,
  autoOptimize: false, cacheEnabled: true, cacheTTL: 300000,
  agents: {
    agent1: { name: 'Agent 1', type: 'langchain', capabilities: ['inference'], dependencies: [], version: '1.0.0' },
    agent2: { name: 'Agent 2', type: 'crewai', capabilities: ['planning'], dependencies: [], version: '1.0.0' },
  },
  handoffStrategies: ['direct', 'batch', 'cached'],
  optimizationTargets: ['latency', 'throughput', 'reliability'],
});

const makeMockData = () => ({
  timeWindow: { start: Date.now() - 3600000, end: Date.now() },
  systemMetrics: {
    totalAgents: 3, totalHandoffs: 150, averageLatency: 750,
    throughput: 15, reliability: 0.92, memoryUsage: 65, cpuUsage: 45,
  },
  agentMetrics: {
    agent1: { totalHandoffs: 50, averageLatency: 600, maxLatency: 1200, minLatency: 100, throughput: 20, reliability: 0.95, errorRate: 0.05, lastActivity: Date.now(), uptime: Date.now() - 3600000, capabilities: ['inference'] },
    agent2: { totalHandoffs: 80, averageLatency: 800, maxLatency: 1500, minLatency: 200, throughput: 10, reliability: 0.85, errorRate: 0.15, lastActivity: Date.now(), uptime: Date.now() - 3600000, capabilities: ['planning'] },
  },
  handoffMetrics: [], bottlenecks: [],
});

const makeAgent = (id) => ({
  id, name: `Agent ${id}`, type: 'langchain',
  capabilities: [{ name: 'inference', type: 'inference', level: 'advanced', description: 'test' }],
  dependencies: [],
  constraints: { maxConcurrentRequests: 10, timeout: 30000, retryAttempts: 3, memoryLimit: 512, rateLimit: { requests: 100, timeWindow: 60 } },
  performance: { averageLatency: 100, reliability: 0.95, throughput: 50, memoryUsage: 45, cpuUsage: 30, uptime: Date.now(), lastHeartbeat: Date.now(), healthStatus: 'healthy' },
  status: 'active', metadata: {},
});

// --- HandoffTracker ---
describe('HandoffTracker', () => {
  it('initializes not tracking', () => {
    const t = new HandoffTracker(baseConfig());
    assert.equal(t.isCurrentlyTracking(), false);
  });

  it('throws when stopping without active tracking', () => {
    const t = new HandoffTracker(baseConfig());
    assert.throws(() => t.stopTracking(), /No tracking in progress/);
  });

  it('returns empty performance metrics', () => {
    const t = new HandoffTracker(baseConfig());
    const m = t.getPerformanceMetrics();
    assert.equal(m.systemMetrics.totalAgents, 2);
    assert.equal(m.systemMetrics.totalHandoffs, 0);
    assert.equal(m.systemMetrics.averageLatency, 0);
    assert.equal(m.systemMetrics.throughput, 0);
    assert.equal(m.systemMetrics.reliability, 0);
    assert.deepEqual(m.handoffMetrics, []);
    assert.deepEqual(m.bottlenecks, []);
  });

  it('auto-stops and emits trackingStopped after duration', async () => {
    const t = new HandoffTracker(baseConfig());
    let fired = false;
    t.on('trackingStopped', () => { fired = true; });
    await t.startTracking(1, 'agent1', baseConfig().agents.agent1);
    await new Promise(r => setTimeout(r, 1500));
    assert.equal(fired, true);
    assert.equal(t.isCurrentlyTracking(), false);
  });
});

// --- HandoffOptimizer ---
describe('HandoffOptimizer', () => {
  it('generates suggestions from mock data', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData());
    assert.ok(r.suggestions.length > 0);
    assert.ok(r.plan);
    assert.ok(r.plan.id);
    assert.ok(r.plan.name);
    assert.ok(r.plan.totalImpact);
    assert.ok(r.plan.implementationOrder);
    assert.ok(r.expectedImprovements);
  });

  it('generates latency suggestions', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData(), { target: 'latency' });
    assert.ok(r.suggestions.some(s => s.type === 'latency'));
  });

  it('generates throughput suggestions', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData(), { target: 'throughput' });
    assert.ok(r.suggestions.some(s => s.type === 'throughput'));
  });

  it('generates reliability suggestions', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData(), { target: 'reliability' });
    assert.ok(r.suggestions.some(s => s.type === 'reliability'));
  });

  it('generates cost/resource suggestions', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData(), { target: 'cost' });
    assert.ok(r.suggestions.some(s => s.type === 'resource'));
  });

  it('suggestions sorted by priority descending', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const r = await o.optimize(makeMockData());
    for (let i = 0; i < r.suggestions.length - 1; i++) {
      assert.ok(r.suggestions[i].priority >= r.suggestions[i + 1].priority);
    }
  });

  it('suggestion has full structure', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const s = (await o.optimize(makeMockData())).suggestions[0];
    assert.ok(s.id && s.type && s.title && s.description && s.currentProblem && s.proposedSolution);
    assert.ok(s.expectedImprovement.latency !== undefined);
    assert.ok(s.expectedImprovement.throughput !== undefined);
    assert.ok(s.expectedImprovement.reliability !== undefined);
    assert.ok(s.expectedImprovement.cost !== undefined);
    assert.ok(s.implementation.complexity);
    assert.ok(s.implementation.timeRequired);
    assert.ok(s.validation.successCriteria);
    assert.ok(s.validation.fallback);
  });

  it('plan has totalImpact with numbers', async () => {
    const o = new HandoffOptimizer(baseConfig());
    const p = (await o.optimize(makeMockData())).plan;
    assert.equal(typeof p.totalImpact.latency, 'number');
    assert.equal(typeof p.totalImpact.throughput, 'number');
    assert.equal(typeof p.totalImpact.reliability, 'number');
    assert.equal(typeof p.totalImpact.cost, 'number');
  });

  it('maintains optimization history', async () => {
    const o = new HandoffOptimizer(baseConfig());
    await o.optimize(makeMockData());
    await o.optimize(makeMockData());
    assert.equal(o.getOptimizationHistory().length, 2);
  });

  it('caches and clears results', async () => {
    const o = new HandoffOptimizer(baseConfig());
    await o.optimize(makeMockData());
    assert.ok(o.getCachedOptimizationResults().length > 0);
    o.clearCache();
    assert.equal(o.getCachedOptimizationResults().length, 0);
  });

  it('emits optimized event', async () => {
    const o = new HandoffOptimizer(baseConfig());
    let fired = false;
    o.on('optimized', () => { fired = true; });
    await o.optimize(makeMockData());
    assert.equal(fired, true);
  });
});

// --- AgentHandoffManager ---
describe('AgentHandoffManager', () => {
  it('registers a single agent', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgent(makeAgent('a1'));
    assert.equal(m.getAgents().length, 1);
    assert.equal(m.getAgent('a1').name, 'Agent a1');
  });

  it('registers multiple agents', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgents([makeAgent('a1'), makeAgent('a2')]);
    assert.equal(m.getAgents().length, 2);
  });

  it('rejects agent without id', async () => {
    const m = new AgentHandoffManager(baseConfig());
    const bad = { ...makeAgent('x'), id: '' };
    await assert.rejects(() => m.registerAgent(bad), /id and name/);
  });

  it('rejects agent without capabilities', async () => {
    const m = new AgentHandoffManager(baseConfig());
    const bad = { ...makeAgent('x'), capabilities: [] };
    await assert.rejects(() => m.registerAgent(bad), /capability/);
  });

  it('throws on handoff to unknown agent', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgent(makeAgent('a1'));
    await assert.rejects(() => m.executeHandoff('a1', 'ghost', {}), /not found/);
  });

  it('throws on handoff from unknown agent', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgent(makeAgent('a1'));
    await assert.rejects(() => m.executeHandoff('ghost', 'a1', {}), /not found/);
  });

  it('adds and retrieves dependencies', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgents([makeAgent('a1'), makeAgent('a2')]);
    m.addDependency('a1', 'a2', { targetAgent: 'a2', type: 'data', strength: 0.8, direction: 'output', lastUsed: Date.now(), usageCount: 0 });
    const deps = m.getDependencies('a1');
    assert.equal(deps.length, 1);
    assert.equal(deps[0].targetAgent, 'a2');
    assert.equal(deps[0].type, 'data');
  });

  it('returns empty deps for unknown agent', () => {
    const m = new AgentHandoffManager(baseConfig());
    assert.deepEqual(m.getDependencies('unknown'), []);
  });

  it('returns system status', async () => {
    const m = new AgentHandoffManager(baseConfig());
    await m.registerAgents([makeAgent('a1'), makeAgent('a2')]);
    const s = m.getSystemStatus();
    assert.equal(s.agents, 2);
    assert.equal(s.activeHandoffs, 0);
    assert.equal(s.completedHandoffs, 0);
    assert.ok(s.uptime > 0);
  });

  it('emits agentRegistered event', async () => {
    const m = new AgentHandoffManager(baseConfig());
    let fired = false;
    m.on('agentRegistered', () => { fired = true; });
    await m.registerAgent(makeAgent('a1'));
    assert.equal(fired, true);
  });

  it('getAgent returns undefined for unknown', async () => {
    const m = new AgentHandoffManager(baseConfig());
    assert.equal(m.getAgent('nope'), undefined);
  });
});

import { run } from 'node:test';

// --- HandoffVisualizer.toMarkdown ---
describe('HandoffVisualizer.toMarkdown', () => {
  const viz = new HandoffVisualizer(baseConfig());

  it('renders system overview with metrics', () => {
    const md = viz.toMarkdown(makeMockData());
    assert.ok(md.includes('# Agent Handoff Report'));
    assert.ok(md.includes('## System Overview'));
    assert.ok(md.includes('Avg Latency'));
    assert.ok(md.includes('750.0ms'));
    assert.ok(md.includes('Reliability'));
  });

  it('renders agent breakdown table', () => {
    const md = viz.toMarkdown(makeMockData());
    assert.ok(md.includes('## Agent Breakdown'));
    assert.ok(md.includes('agent1'));
    assert.ok(md.includes('agent2'));
  });

  it('renders top handoff routes when handoff data exists', () => {
    const data = makeMockData();
    data.handoffMetrics = [
      { id: 'h1', timestamp: Date.now(), fromAgent: 'agent1', toAgent: 'agent2', latency: 500, throughput: 10, reliability: 0.95, messageSize: 1024, status: 'success', strategy: 'direct' },
      { id: 'h2', timestamp: Date.now(), fromAgent: 'agent1', toAgent: 'agent2', latency: 700, throughput: 10, reliability: 0.90, messageSize: 2048, status: 'success', strategy: 'cached' },
      { id: 'h3', timestamp: Date.now(), fromAgent: 'agent2', toAgent: 'agent1', latency: 300, throughput: 10, reliability: 0.99, messageSize: 512, status: 'success', strategy: 'direct' },
    ];
    const md = viz.toMarkdown(data);
    assert.ok(md.includes('## Top Handoff Routes'));
    assert.ok(md.includes('agent1 → agent2'));
    assert.ok(md.includes('2')); // count for that route
  });

  it('renders bottlenecks when present', () => {
    const data = makeMockData();
    data.bottlenecks = [{ id: 'b1', type: 'latency', severity: 8, description: 'High latency detected', affectedAgents: ['agent1', 'agent2'], metrics: { current: 1200, threshold: 500, trend: 'degrading' }, estimatedImpact: { performance: 30, cost: 20 }, recommendations: ['Add caching'] }];
    const md = viz.toMarkdown(data);
    assert.ok(md.includes('⚠️ Bottlenecks'));
    assert.ok(md.includes('High latency detected'));
    assert.ok(md.includes('8/10'));
  });

  it('omits empty sections', () => {
    const md = viz.toMarkdown(makeMockData());
    assert.ok(!md.includes('## Top Handoff Routes'));
    assert.ok(!md.includes('⚠️ Bottlenecks'));
  });
});

run();
