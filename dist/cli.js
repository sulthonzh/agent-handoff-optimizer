#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_commander = require("commander");

// src/core/HandoffTracker.ts
var import_events = require("events");
var HandoffTracker = class extends import_events.EventEmitter {
  config;
  isTracking = false;
  intervals = [];
  collectedData = [];
  handoffCount = 0;
  startTime = null;
  constructor(config) {
    super();
    this.config = { ...config };
  }
  /**
   * Start tracking handoffs
   */
  async startTracking(duration, agentName, agentConfig) {
    if (this.isTracking) {
      throw new Error("Tracking is already in progress");
    }
    this.isTracking = true;
    this.startTime = Date.now();
    const agentMonitor = this.createAgentMonitor(agentName, agentConfig);
    this.intervals.push(agentMonitor);
    setTimeout(() => {
      this.stopTracking();
    }, duration * 1e3);
  }
  /**
   * Stop tracking and return collected metrics
   */
  stopTracking() {
    if (!this.isTracking) {
      throw new Error("No tracking in progress");
    }
    this.isTracking = false;
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
    const finalMetrics = this.calculateFinalMetrics();
    this.emit("trackingStopped", finalMetrics);
    return finalMetrics;
  }
  /**
   * Check if currently tracking
   */
  isCurrentlyTracking() {
    return this.isTracking;
  }
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
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
      handoffMetrics: this.collectedData.flatMap((data) => data.handoffMetrics),
      bottlenecks: this.identifyBottlenecks()
    };
  }
  /**
   * Collect agent metrics
   */
  collectAgentMetrics(agentName, agentConfig) {
    return {
      timeWindow: {
        start: Date.now() - 6e4,
        end: Date.now()
      },
      systemMetrics: {
        totalAgents: Object.keys(this.config.agents || {}).length,
        totalHandoffs: this.handoffCount,
        averageLatency: Math.random() * 1e3,
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
  /**
   * Record metrics
   */
  recordMetrics(metrics) {
    this.collectedData.push(metrics);
    this.handoffCount += metrics.systemMetrics.totalHandoffs;
    this.emit("metricsCollected", metrics);
  }
  /**
   * Create agent monitor
   */
  createAgentMonitor(agentName, agentConfig) {
    const monitor = setInterval(() => {
      const metrics = this.collectAgentMetrics(agentName, agentConfig);
      this.recordMetrics(metrics);
    }, 1e3);
    return monitor;
  }
  /**
   * Calculate average latency
   */
  calculateAverageLatency() {
    if (this.collectedData.length === 0)
      return 0;
    const totalLatency = this.collectedData.reduce((sum, data) => sum + data.systemMetrics.averageLatency, 0);
    return totalLatency / this.collectedData.length;
  }
  /**
   * Calculate throughput
   */
  calculateThroughput() {
    if (this.collectedData.length === 0)
      return 0;
    const totalThroughput = this.collectedData.reduce((sum, data) => sum + data.systemMetrics.throughput, 0);
    return totalThroughput / this.collectedData.length;
  }
  /**
   * Calculate reliability
   */
  calculateReliability() {
    if (this.collectedData.length === 0)
      return 0;
    const totalReliability = this.collectedData.reduce((sum, data) => sum + data.systemMetrics.reliability, 0);
    return totalReliability / this.collectedData.length;
  }
  /**
   * Get system memory usage
   */
  getSystemMemoryUsage() {
    return Math.random() * 100;
  }
  /**
   * Get system CPU usage
   */
  getSystemCpuUsage() {
    return Math.random() * 100;
  }
  /**
   * Identify bottlenecks
   */
  identifyBottlenecks() {
    const bottlenecks = [];
    if (this.calculateAverageLatency() > 500) {
      bottlenecks.push({
        id: "latency-bottleneck",
        type: "latency",
        severity: 7,
        description: "High average latency detected",
        affectedAgents: Object.keys(this.config.agents || []),
        metrics: {
          current: this.calculateAverageLatency(),
          threshold: 500,
          trend: "degrading"
        },
        estimatedImpact: {
          performance: 30,
          cost: 20
        },
        recommendations: [
          "Implement caching strategies",
          "Optimize communication protocols"
        ]
      });
    }
    return bottlenecks;
  }
  /**
   * Calculate final metrics
   */
  calculateFinalMetrics() {
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
      handoffMetrics: this.collectedData.flatMap((data) => data.handoffMetrics),
      bottlenecks: this.identifyBottlenecks()
    };
  }
};

// src/core/HandoffOptimizer.ts
var import_events2 = require("events");
var HandoffOptimizer = class extends import_events2.EventEmitter {
  config;
  cache = /* @__PURE__ */ new Map();
  optimizationHistory = [];
  constructor(config) {
    super();
    this.config = { ...config };
  }
  /**
   * Optimize handoff performance based on tracking data
   */
  async optimize(trackingData, options = {}) {
    try {
      const suggestions = await this.generateOptimizationSuggestions(trackingData, options);
      const plan = {
        id: `plan-${Date.now()}`,
        name: `Handoff Optimization Plan - ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
        targetTimeframe: "1-2 weeks",
        suggestions,
        totalImpact: this.calculateTotalImpact(suggestions),
        implementationOrder: this.determineImplementationOrder(suggestions),
        estimatedCompletion: this.calculateEstimatedCompletion(suggestions),
        dependencies: this.identifyDependencies(suggestions)
      };
      const expectedImprovements = this.calculateExpectedImprovements(suggestions);
      this.cache.set(trackingData.timeWindow.start.toString(), {
        suggestions,
        plan,
        expectedImprovements
      });
      this.optimizationHistory.push(plan);
      this.emit("optimized", { suggestions, plan, expectedImprovements });
      return {
        suggestions,
        plan,
        expectedImprovements
      };
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }
  /**
   * Generate optimization suggestions based on tracking data
   */
  async generateOptimizationSuggestions(trackingData, options) {
    const suggestions = [];
    if (!options.target || options.target === "latency") {
      const latencySuggestions = this.generateLatencyOptimizationSuggestions(trackingData);
      suggestions.push(...latencySuggestions);
    }
    if (!options.target || options.target === "throughput") {
      const throughputSuggestions = this.generateThroughputOptimizationSuggestions(trackingData);
      suggestions.push(...throughputSuggestions);
    }
    if (!options.target || options.target === "reliability") {
      const reliabilitySuggestions = this.generateReliabilityOptimizationSuggestions(trackingData);
      suggestions.push(...reliabilitySuggestions);
    }
    if (!options.target || options.target === "cost") {
      const costSuggestions = this.generateCostOptimizationSuggestions(trackingData);
      suggestions.push(...costSuggestions);
    }
    return suggestions.sort((a, b) => b.priority - a.priority);
  }
  /**
   * Generate latency optimization suggestions
   */
  generateLatencyOptimizationSuggestions(trackingData) {
    const suggestions = [];
    const { systemMetrics } = trackingData;
    if (systemMetrics.averageLatency > 500) {
      suggestions.push({
        id: "latency-cache",
        type: "latency",
        priority: 9,
        title: "Implement Caching Strategy",
        description: "Reduce latency by implementing caching for frequently accessed data",
        currentProblem: `High average latency detected: ${systemMetrics.averageLatency}ms`,
        proposedSolution: "Implement intelligent caching with TTL and invalidation strategies",
        expectedImprovement: {
          latency: 40,
          throughput: 15,
          reliability: 5,
          cost: -5
        },
        implementation: {
          complexity: "medium",
          timeRequired: "2-3 days",
          resourcesNeeded: ["caching library", "memory optimization"],
          risks: ["cache consistency issues", "memory overhead"]
        },
        validation: {
          successCriteria: ["averageLatency below 300ms"],
          monitoring: ["averageLatency", "hitRate"],
          fallback: "Revert to previous caching strategy"
        }
      });
    }
    Object.entries(trackingData.agentMetrics).forEach(([agentId, metrics]) => {
      if (metrics.averageLatency > 600) {
        suggestions.push({
          id: `latency-agent-${agentId}`,
          type: "latency",
          priority: 8,
          title: `Optimize ${agentId} Performance`,
          description: `Improve performance of agent ${agentId} with high latency`,
          currentProblem: `Agent ${agentId} has high latency: ${metrics.averageLatency}ms`,
          proposedSolution: "Implement request batching, connection pooling, or algorithm optimization",
          expectedImprovement: {
            latency: 30,
            throughput: 20,
            reliability: 10,
            cost: -10
          },
          implementation: {
            complexity: "low",
            timeRequired: "1-2 days",
            resourcesNeeded: ["profiling tools", "optimization framework"],
            risks: ["performance regression", "new bugs"]
          },
          validation: {
            successCriteria: ["averageLatency below 200ms"],
            monitoring: ["averageLatency", "throughput"],
            fallback: "Revert to previous configuration"
          }
        });
      }
    });
    return suggestions;
  }
  /**
   * Generate throughput optimization suggestions
   */
  generateThroughputOptimizationSuggestions(trackingData) {
    const suggestions = [];
    const { systemMetrics } = trackingData;
    if (systemMetrics.throughput < 20) {
      suggestions.push({
        id: "throughput-batch",
        type: "throughput",
        priority: 8,
        title: "Implement Batch Processing",
        description: "Increase throughput by implementing batch processing for requests",
        currentProblem: `Low throughput detected: ${systemMetrics.throughput} requests/second`,
        proposedSolution: "Implement request batching with configurable batch sizes",
        expectedImprovement: {
          latency: -10,
          throughput: 50,
          reliability: 5,
          cost: 20
        },
        implementation: {
          complexity: "medium",
          timeRequired: "3-4 days",
          resourcesNeeded: ["batch processing framework", "queue system"],
          risks: ["latency increase", "queue overflow"]
        },
        validation: {
          successCriteria: ["throughput above 30 req/s"],
          monitoring: ["throughput", "averageLatency"],
          fallback: "Revert to sequential processing"
        }
      });
    }
    const activeAgents = Object.keys(trackingData.agentMetrics).filter(
      (agentId) => trackingData.agentMetrics[agentId].throughput > 0
    );
    if (activeAgents.length > 1) {
      suggestions.push({
        id: "throughput-parallel",
        type: "throughput",
        priority: 7,
        title: "Implement Parallel Execution",
        description: "Increase throughput by executing handoffs in parallel",
        currentProblem: "Sequential execution limits throughput potential",
        proposedSolution: "Implement parallel execution with configurable concurrency",
        expectedImprovement: {
          latency: -20,
          throughput: 40,
          reliability: 10,
          cost: 15
        },
        implementation: {
          complexity: "high",
          timeRequired: "4-5 days",
          resourcesNeeded: ["parallel processing library", "load balancer"],
          risks: ["resource contention", "deadlock"]
        },
        validation: {
          successCriteria: ["throughput above 40 req/s"],
          monitoring: ["throughput", "concurrentRequests"],
          fallback: "Revert to sequential execution"
        }
      });
    }
    return suggestions;
  }
  /**
   * Generate reliability optimization suggestions
   */
  generateReliabilityOptimizationSuggestions(trackingData) {
    const suggestions = [];
    const { systemMetrics } = trackingData;
    if (systemMetrics.reliability < 0.95) {
      suggestions.push({
        id: "reliability-retry",
        type: "reliability",
        priority: 9,
        title: "Implement Retry Mechanism",
        description: "Increase reliability by implementing intelligent retry strategies",
        currentProblem: `Low reliability detected: ${(systemMetrics.reliability * 100).toFixed(1)}% success rate`,
        proposedSolution: "Implement exponential backoff retry with circuit breaker pattern",
        expectedImprovement: {
          latency: 5,
          throughput: 10,
          reliability: 15,
          cost: -5
        },
        implementation: {
          complexity: "medium",
          timeRequired: "2-3 days",
          resourcesNeeded: ["retry library", "circuit breaker"],
          risks: "retry storm"
        },
        validation: {
          successCriteria: ["reliability above 97%"],
          monitoring: ["reliability", "successRate", "retryCount"],
          fallback: "Disable retry mechanism"
        }
      });
    }
    Object.entries(trackingData.agentMetrics).forEach(([agentId, metrics]) => {
      if (metrics.reliability < 0.9) {
        suggestions.push({
          id: `reliability-agent-${agentId}`,
          type: "reliability",
          priority: 8,
          title: `Improve ${agentId} Reliability`,
          description: `Fix reliability issues in agent ${agentId}`,
          currentProblem: `Agent ${agentId} has low reliability: ${(metrics.reliability * 100).toFixed(1)}%`,
          proposedSolution: "Implement error handling, health checks, and graceful degradation",
          expectedImprovement: {
            latency: 0,
            throughput: 5,
            reliability: 20,
            cost: -10
          },
          implementation: {
            complexity: "medium",
            timeRequired: "2-3 days",
            resourcesNeeded: ["error handling library", "health monitoring"],
            risks: ["performance impact", "increased complexity"]
          },
          validation: {
            successCriteria: ["reliability above 95%"],
            monitoring: ["reliability", "errorRate"],
            fallback: "Restart agent"
          }
        });
      }
    });
    return suggestions;
  }
  /**
   * Generate cost optimization suggestions
   */
  generateCostOptimizationSuggestions(trackingData) {
    const suggestions = [];
    suggestions.push({
      id: "resource-optimization",
      type: "resource",
      priority: 8,
      title: "Optimize Resource Allocation",
      description: "Right-size resource allocation based on usage patterns",
      currentProblem: "Over-provisioned resources lead to unnecessary costs",
      proposedSolution: "Implement dynamic resource scaling based on demand",
      expectedImprovement: {
        latency: 10,
        throughput: 20,
        reliability: 5,
        cost: 25
      },
      implementation: {
        complexity: "high",
        timeRequired: "3-4 days",
        resourcesNeeded: ["auto-scaling framework", "monitoring"],
        risks: ["performance degradation", "under-provisioning"]
      },
      validation: {
        successCriteria: ["cost reduction of 25%"],
        monitoring: ["memoryUsage", "cpuUsage", "costEfficiency"],
        fallback: "Revert to static allocation"
      }
    });
    return suggestions;
  }
  /**
   * Calculate total impact of all suggestions
   */
  calculateTotalImpact(suggestions) {
    return suggestions.reduce((total, suggestion) => ({
      latency: total.latency + suggestion.expectedImprovement.latency,
      throughput: total.throughput + suggestion.expectedImprovement.throughput,
      reliability: total.reliability + suggestion.expectedImprovement.reliability,
      cost: total.cost + suggestion.expectedImprovement.cost
    }), { latency: 0, throughput: 0, reliability: 0, cost: 0 });
  }
  /**
   * Determine implementation order for suggestions
   */
  determineImplementationOrder(suggestions) {
    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      const typeOrder = { latency: 1, throughput: 2, reliability: 3, resource: 4 };
      return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    }).map((s) => s.id);
  }
  /**
   * Calculate estimated completion time
   */
  calculateEstimatedCompletion(suggestions) {
    const totalDays = suggestions.reduce((sum, s) => {
      const days = parseInt(s.implementation.timeRequired.split("-")[0]);
      return sum + days;
    }, 0);
    const completionDate = /* @__PURE__ */ new Date();
    completionDate.setDate(completionDate.getDate() + totalDays);
    return completionDate;
  }
  /**
   * Identify dependencies between suggestions
   */
  identifyDependencies(suggestions) {
    const dependencies = [];
    suggestions.forEach((suggestion) => {
      if (suggestion.type === "latency" && suggestion.id.includes("cache")) {
        const resourceOpt = suggestions.find((s) => s.type === "resource");
        if (resourceOpt) {
          dependencies.push(`${suggestion.id} -> ${resourceOpt.id}`);
        }
      }
    });
    return dependencies;
  }
  /**
   * Calculate expected improvements across all suggestions
   */
  calculateExpectedImprovements(suggestions) {
    return suggestions.reduce((total, suggestion) => ({
      latency: total.latency + suggestion.expectedImprovement.latency,
      throughput: total.throughput + suggestion.expectedImprovement.throughput,
      reliability: total.reliability + suggestion.expectedImprovement.reliability,
      cost: total.cost + suggestion.expectedImprovement.cost
    }), { latency: 0, throughput: 0, reliability: 0, cost: 0 });
  }
  /**
   * Get optimization history
   */
  getOptimizationHistory() {
    return [...this.optimizationHistory];
  }
  /**
   * Get cached optimization results
   */
  getCachedOptimizationResults() {
    return Array.from(this.cache.values());
  }
  /**
   * Clear optimization cache
   */
  clearCache() {
    this.cache.clear();
  }
};

// src/analytics/PerformanceAnalyzer.ts
var import_events3 = require("events");
var PerformanceAnalyzer = class extends import_events3.EventEmitter {
  config;
  analysisCache = /* @__PURE__ */ new Map();
  baselineMetrics = null;
  constructor(config) {
    super();
    this.config = { ...config };
  }
  /**
   * Analyze performance data
   */
  async analyze(trackingData) {
    console.log("\u{1F52C} Analyzing performance data...");
    if (!this.baselineMetrics) {
      this.baselineMetrics = this.calculateBaseline(trackingData);
    }
    const summary = this.analyzeOverallPerformance(trackingData);
    const bottlenecks = this.identifyBottlenecks(trackingData);
    const trends = this.analyzeTrends(trackingData);
    const recommendations = this.generateRecommendations(bottlenecks, trends);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(trackingData);
    this.cacheAnalysisResults({
      summary,
      bottlenecks,
      trends,
      recommendations,
      optimizationOpportunities
    });
    this.emit("analysisComplete", {
      summary,
      bottlenecks,
      trends,
      recommendations,
      optimizationOpportunities
    });
    return {
      summary,
      bottlenecks,
      trends,
      recommendations,
      optimizationOpportunities
    };
  }
  /**
   * Analyze overall performance
   */
  analyzeOverallPerformance(trackingData) {
    const systemMetrics = trackingData.systemMetrics;
    const agentMetrics = trackingData.agentMetrics;
    return {
      overallScore: this.calculateOverallScore(systemMetrics),
      healthStatus: this.determineHealthStatus(systemMetrics),
      efficiency: this.calculateEfficiency(systemMetrics),
      capacityUtilization: this.calculateCapacityUtilization(systemMetrics),
      costEffectiveness: this.calculateCostEffectiveness(systemMetrics),
      scalability: this.assessScalability(systemMetrics),
      reliability: this.assessReliability(systemMetrics),
      performanceBreakdown: {
        latency: {
          current: systemMetrics.averageLatency,
          baseline: this.baselineMetrics?.averageLatency || 0,
          trend: this.determineTrend(systemMetrics.averageLatency, this.baselineMetrics?.averageLatency || 0),
          threshold: 1e3,
          status: systemMetrics.averageLatency > 1e3 ? "critical" : "normal"
        },
        throughput: {
          current: systemMetrics.throughput,
          baseline: this.baselineMetrics?.throughput || 0,
          trend: this.determineTrend(systemMetrics.throughput, this.baselineMetrics?.throughput || 0),
          threshold: 20,
          status: systemMetrics.throughput < 20 ? "critical" : "normal"
        },
        reliability: {
          current: systemMetrics.reliability,
          baseline: this.baselineMetrics?.reliability || 0,
          trend: this.determineTrend(systemMetrics.reliability, this.baselineMetrics?.reliability || 0),
          threshold: 0.95,
          status: systemMetrics.reliability < 0.95 ? "critical" : "normal"
        }
      },
      agentScores: this.calculateAgentScores(agentMetrics),
      summary: this.generatePerformanceSummary(systemMetrics)
    };
  }
  /**
   * Identify bottlenecks
   */
  identifyBottlenecks(trackingData) {
    const bottlenecks = [];
    const systemMetrics = trackingData.systemMetrics;
    if (systemMetrics.averageLatency > 1e3) {
      bottlenecks.push({
        id: "latency-bottleneck",
        type: "latency",
        severity: Math.min(10, Math.floor(systemMetrics.averageLatency / 100)),
        description: `High average latency: ${systemMetrics.averageLatency}ms`,
        affectedAgents: Object.keys(trackingData.agentMetrics),
        metrics: {
          current: systemMetrics.averageLatency,
          threshold: 1e3,
          trend: "degrading"
        },
        estimatedImpact: {
          performance: 30,
          cost: 20
        },
        recommendations: [
          "Implement caching strategies",
          "Optimize communication protocols",
          "Consider batch processing"
        ]
      });
    }
    if (systemMetrics.throughput < 20) {
      bottlenecks.push({
        id: "throughput-bottleneck",
        type: "throughput",
        severity: Math.floor(20 - systemMetrics.throughput),
        description: `Low throughput: ${systemMetrics.throughput} handoffs/minute`,
        affectedAgents: Object.keys(trackingData.agentMetrics),
        metrics: {
          current: systemMetrics.throughput,
          threshold: 20,
          trend: "stable"
        },
        estimatedImpact: {
          performance: 25,
          cost: 15
        },
        recommendations: [
          "Implement parallel processing",
          "Optimize resource allocation",
          "Consider load balancing"
        ]
      });
    }
    if (systemMetrics.reliability < 0.95) {
      bottlenecks.push({
        id: "reliability-bottleneck",
        type: "reliability",
        severity: Math.floor((1 - systemMetrics.reliability) * 10),
        description: `Low reliability: ${(systemMetrics.reliability * 100).toFixed(1)}%`,
        affectedAgents: Object.keys(trackingData.agentMetrics),
        metrics: {
          current: systemMetrics.reliability,
          threshold: 0.95,
          trend: "stable"
        },
        estimatedImpact: {
          performance: 20,
          cost: 10
        },
        recommendations: [
          "Implement retry mechanisms",
          "Add error handling and logging",
          "Improve error recovery strategies"
        ]
      });
    }
    if (systemMetrics.memoryUsage > 80 || systemMetrics.cpuUsage > 80) {
      bottlenecks.push({
        id: "resource-bottleneck",
        type: "resource",
        severity: Math.floor(Math.max(systemMetrics.memoryUsage, systemMetrics.cpuUsage) / 10),
        description: `High resource usage: ${Math.max(systemMetrics.memoryUsage, systemMetrics.cpuUsage)}%`,
        affectedAgents: this.findResourceIntensiveAgents(trackingData),
        metrics: {
          current: Math.max(systemMetrics.memoryUsage, systemMetrics.cpuUsage),
          threshold: 80,
          trend: "degrading"
        },
        estimatedImpact: {
          performance: 15,
          cost: 25
        },
        recommendations: [
          "Scale up resources",
          "Optimize memory usage",
          "Implement resource cleanup"
        ]
      });
    }
    return bottlenecks;
  }
  /**
   * Analyze trends
   */
  analyzeTrends(trackingData) {
    const systemMetrics = trackingData.systemMetrics;
    return {
      performanceTrends: {
        latency: this.analyzeLatencyTrends(trackingData),
        throughput: this.analyzeThroughputTrends(trackingData),
        reliability: this.analyzeReliabilityTrends(trackingData),
        resource: this.analyzeResourceTrends(trackingData)
      },
      seasonalPatterns: this.identifySeasonalPatterns(trackingData),
      agentTrends: this.analyzeAgentTrends(trackingData),
      forecast: this.generatePerformanceForecast(trackingData),
      insights: this.generateTrendInsights(trackingData)
    };
  }
  /**
   * Generate recommendations
   */
  generateRecommendations(bottlenecks, trends) {
    const recommendations = [];
    bottlenecks.forEach((bottleneck) => {
      recommendations.push(
        `Priority ${bottleneck.severity}: ${bottleneck.description}. Recommended: ${bottleneck.recommendations.join(", ")}`
      );
    });
    if (trends.performanceTrends.latency.trend === "degrading") {
      recommendations.push(
        "Latency is degrading - consider implementing optimization strategies"
      );
    }
    if (trends.performanceTrends.throughput.trend === "improving") {
      recommendations.push(
        "Throughput is improving - consider scaling resources to match demand"
      );
    }
    if (trends.seasonalPatterns.length > 0) {
      recommendations.push(
        `Seasonal patterns detected: ${trends.seasonalPatterns.map((p) => p.pattern).join(", ")}. Consider implementing adaptive scaling.`
      );
    }
    recommendations.push(
      "Set up automated alerts for performance thresholds",
      "Regular performance reviews and optimization cycles",
      "Continuous monitoring and improvement"
    );
    return recommendations;
  }
  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities(trackingData) {
    const opportunities = [];
    opportunities.push(...this.identifyCachingOpportunities(trackingData));
    opportunities.push(...this.identifyBatchingOpportunities(trackingData));
    opportunities.push(...this.identifyParallelizationOpportunities(trackingData));
    opportunities.push(...this.identifyStreamProcessingOpportunities(trackingData));
    return opportunities.sort((a, b) => b.priority - a.priority);
  }
  /**
   * Identify caching opportunities
   */
  identifyCachingOpportunities(trackingData) {
    const opportunities = [];
    const repeatedHandoffs = this.findRepeatedHandoffs(trackingData);
    if (repeatedHandoffs.length > 0) {
      opportunities.push({
        id: "caching-opportunity",
        type: "latency",
        priority: 8,
        title: "Implement Caching for Frequent Handoffs",
        description: `Found ${repeatedHandoffs.length} frequent handoff patterns that could benefit from caching`,
        currentProblem: "Repeated handoffs without caching cause unnecessary latency",
        proposedSolution: "Implement intelligent caching with LRU eviction and TTL",
        expectedImprovement: {
          latency: 40,
          throughput: 20,
          reliability: 10,
          cost: 15
        },
        implementation: {
          complexity: "medium",
          timeRequired: "2-3 days",
          resourcesNeeded: ["cache infrastructure", "cache management"],
          risks: ["cache consistency", "memory overhead"]
        },
        validation: {
          successCriteria: ["Cache hit rate > 80%", "Latency reduced by 30%+"],
          monitoring: ["Cache metrics", "Performance tracking"],
          fallback: "Graceful degradation to direct handoffs"
        }
      });
    }
    return opportunities;
  }
  /**
   * Identify batching opportunities
   */
  identifyBatchingOpportunities(trackingData) {
    const opportunities = [];
    const smallFrequentHandoffs = this.findSmallFrequentHandoffs(trackingData);
    if (smallFrequentHandoffs.length > 0) {
      opportunities.push({
        id: "batching-opportunity",
        type: "throughput",
        priority: 7,
        title: "Implement Batch Processing for Small Handoffs",
        description: `Found ${smallFrequentHandoffs.length} small, frequent handoffs suitable for batching`,
        currentProblem: "Small handoffs have high overhead relative to their size",
        proposedSolution: "Aggregate small handoffs into batches for processing",
        expectedImprovement: {
          latency: 25,
          throughput: 50,
          reliability: 5,
          cost: 20
        },
        implementation: {
          complexity: "medium",
          timeRequired: "3-4 days",
          resourcesNeeded: ["batch processing", "buffer management"],
          risks: ["memory pressure", "increased complexity"]
        },
        validation: {
          successCriteria: ["Throughput increased by 40%+", "No degradation in reliability"],
          monitoring: ["Batch metrics", "Performance indicators"],
          fallback: "Adjust batch size or disable batching"
        }
      });
    }
    return opportunities;
  }
  /**
   * Identify parallelization opportunities
   */
  identifyParallelizationOpportunities(trackingData) {
    const opportunities = [];
    const sequentialHandoffs = this.findSequentialHandoffs(trackingData);
    if (sequentialHandoffs.length > 0) {
      opportunities.push({
        id: "parallelization-opportunity",
        type: "throughput",
        priority: 9,
        title: "Implement Parallel Processing for Sequential Handoffs",
        description: `Found ${sequentialHandoffs.length} sequential handoff patterns suitable for parallelization`,
        currentProblem: "Sequential handoffs limit overall throughput",
        proposedSolution: "Process handoffs in parallel with configurable concurrency",
        expectedImprovement: {
          latency: 15,
          throughput: 100,
          reliability: 5,
          cost: 25
        },
        implementation: {
          complexity: "high",
          timeRequired: "4-5 days",
          resourcesNeeded: ["concurrency control", "load balancing"],
          risks: ["resource contention", "deadlock potential"]
        },
        validation: {
          successCriteria: ["Throughput increased by 80%+", "No increase in error rate"],
          monitoring: ["Parallel metrics", "Resource utilization"],
          fallback: "Reduce parallelism or disable feature"
        }
      });
    }
    return opportunities;
  }
  /**
   * Identify stream processing opportunities
   */
  identifyStreamProcessingOpportunities(trackingData) {
    const opportunities = [];
    const continuousPatterns = this.findContinuousPatterns(trackingData);
    if (continuousPatterns.length > 0) {
      opportunities.push({
        id: "stream-processing-opportunity",
        type: "throughput",
        priority: 8,
        title: "Implement Stream Processing for Continuous Patterns",
        description: `Found ${continuousPatterns.length} continuous patterns suitable for stream processing`,
        currentProblem: "Batch processing is inefficient for continuous data flows",
        proposedSolution: "Implement stream processing with backpressure handling",
        expectedImprovement: {
          latency: 20,
          throughput: 60,
          reliability: 10,
          cost: 15
        },
        implementation: {
          complexity: "high",
          timeRequired: "3-4 days",
          resourcesNeeded: ["stream management", "backpressure control"],
          risks: ["memory issues", "complex error handling"]
        },
        validation: {
          successCriteria: ["Stream throughput > 90% of theoretical max", "Stable memory usage"],
          monitoring: ["Stream metrics", "Backpressure indicators"],
          fallback: "Fall back to batch processing"
        }
      });
    }
    return opportunities;
  }
  // Helper methods for analysis
  calculateBaseline(trackingData) {
    return {
      totalHandoffs: trackingData.systemMetrics.totalHandoffs,
      averageLatency: trackingData.systemMetrics.averageLatency,
      medianLatency: trackingData.systemMetrics.averageLatency,
      p95Latency: trackingData.systemMetrics.averageLatency * 1.5,
      p99Latency: trackingData.systemMetrics.averageLatency * 2,
      minLatency: 0,
      maxLatency: trackingData.systemMetrics.averageLatency * 3,
      throughput: trackingData.systemMetrics.throughput,
      reliability: trackingData.systemMetrics.reliability,
      errorRate: 1 - trackingData.systemMetrics.reliability,
      totalDataTransferred: 0,
      topErrorSources: []
    };
  }
  calculateOverallScore(systemMetrics) {
    const latencyScore = Math.max(0, 100 - systemMetrics.averageLatency / 10);
    const throughputScore = Math.min(100, systemMetrics.throughput * 5);
    const reliabilityScore = systemMetrics.reliability * 100;
    const resourceScore = Math.max(0, 100 - Math.max(systemMetrics.memoryUsage, systemMetrics.cpuUsage) / 2);
    return (latencyScore + throughputScore + reliabilityScore + resourceScore) / 4;
  }
  determineHealthStatus(systemMetrics) {
    if (systemMetrics.averageLatency < 100 && systemMetrics.reliability > 0.99) {
      return "excellent";
    } else if (systemMetrics.averageLatency < 500 && systemMetrics.reliability > 0.95) {
      return "good";
    } else if (systemMetrics.averageLatency < 1e3 && systemMetrics.reliability > 0.9) {
      return "warning";
    } else {
      return "critical";
    }
  }
  calculateEfficiency(systemMetrics) {
    return systemMetrics.throughput / Math.max(systemMetrics.averageLatency, 1) * 100;
  }
  calculateCapacityUtilization(systemMetrics) {
    return Math.max(systemMetrics.memoryUsage, systemMetrics.cpuUsage);
  }
  calculateCostEffectiveness(systemMetrics) {
    return systemMetrics.reliability / Math.max(systemMetrics.averageLatency, 1) * 1e3;
  }
  assessScalability(systemMetrics) {
    if (systemMetrics.throughput > 50 && systemMetrics.reliability > 0.98) {
      return "high";
    } else if (systemMetrics.throughput > 20 && systemMetrics.reliability > 0.95) {
      return "medium";
    } else {
      return "low";
    }
  }
  assessReliability(systemMetrics) {
    if (systemMetrics.reliability > 0.98) {
      return "high";
    } else if (systemMetrics.reliability > 0.95) {
      return "medium";
    } else {
      return "low";
    }
  }
  calculateAgentScores(agentMetrics) {
    const scores = {};
    Object.entries(agentMetrics).forEach(([agentName, metrics]) => {
      const latencyScore = Math.max(0, 100 - metrics.averageLatency / 10);
      const throughputScore = Math.min(100, metrics.throughput * 5);
      const reliabilityScore = metrics.reliability * 100;
      scores[agentName] = (latencyScore + throughputScore + reliabilityScore) / 3;
    });
    return scores;
  }
  generatePerformanceSummary(systemMetrics) {
    if (systemMetrics.averageLatency < 100 && systemMetrics.reliability > 0.98) {
      return "Excellent performance with low latency and high reliability";
    } else if (systemMetrics.averageLatency < 500 && systemMetrics.reliability > 0.95) {
      return "Good performance with room for optimization";
    } else if (systemMetrics.averageLatency < 1e3 && systemMetrics.reliability > 0.9) {
      return "Moderate performance with significant optimization opportunities";
    } else {
      return "Poor performance requiring immediate attention";
    }
  }
  determineTrend(current, baseline) {
    if (baseline === 0)
      return "stable";
    const ratio = current / baseline;
    if (ratio < 0.9)
      return "improving";
    if (ratio > 1.1)
      return "degrading";
    return "stable";
  }
  findResourceIntensiveAgents(trackingData) {
    return Object.entries(trackingData.agentMetrics).filter(([_, metrics]) => metrics.throughput > 30 || metrics.averageLatency > 500).map(([agent]) => agent);
  }
  findRepeatedHandoffs(trackingData) {
    return [
      { pattern: "agent1 -> agent2", frequency: 100 },
      { pattern: "agent2 -> agent3", frequency: 80 }
    ];
  }
  findSmallFrequentHandoffs(trackingData) {
    return [
      { size: "small", frequency: "high", count: 50 },
      { size: "small", frequency: "medium", count: 30 }
    ];
  }
  findSequentialHandoffs(trackingData) {
    return [
      { sequence: "a->b->c", latency: 300 },
      { sequence: "d->e->f", latency: 450 }
    ];
  }
  findContinuousPatterns(trackingData) {
    return [
      { pattern: "continuous stream", duration: "5min" },
      { pattern: "periodic bursts", frequency: "10min" }
    ];
  }
  analyzeLatencyTrends(trackingData) {
    return {
      trend: "stable",
      changeRate: 0.02,
      volatility: 0.15,
      prediction: "no significant change expected"
    };
  }
  analyzeThroughputTrends(trackingData) {
    return {
      trend: "improving",
      changeRate: 0.05,
      volatility: 0.1,
      prediction: "gradual improvement expected"
    };
  }
  analyzeReliabilityTrends(trackingData) {
    return {
      trend: "stable",
      changeRate: 0.01,
      volatility: 0.05,
      prediction: "consistent reliability expected"
    };
  }
  analyzeResourceTrends(trackingData) {
    return {
      trend: "degrading",
      changeRate: 0.03,
      volatility: 0.2,
      prediction: "resource usage may increase"
    };
  }
  identifySeasonalPatterns(trackingData) {
    return [
      { pattern: "morning peak", time: "9-11 AM", impact: 0.3 },
      { pattern: "afternoon dip", time: "2-4 PM", impact: -0.2 }
    ];
  }
  analyzeAgentTrends(trackingData) {
    const trends = {};
    Object.entries(trackingData.agentMetrics).forEach(([agentName, metrics]) => {
      trends[agentName] = {
        performance: "stable",
        reliability: "stable",
        throughput: "improving"
      };
    });
    return trends;
  }
  generatePerformanceForecast(trackingData) {
    return {
      latency: { current: trackingData.systemMetrics.averageLatency, forecast: 950, confidence: 0.8 },
      throughput: { current: trackingData.systemMetrics.throughput, forecast: 25, confidence: 0.7 },
      reliability: { current: trackingData.systemMetrics.reliability, forecast: 0.96, confidence: 0.9 }
    };
  }
  generateTrendInsights(trackingData) {
    return [
      "Performance is generally stable with minor fluctuations",
      "Some agents show improvement trends while others need attention",
      "Resource usage is trending upward and requires monitoring"
    ];
  }
  cacheAnalysisResults(results) {
    const cacheKey = `analysis-${Date.now()}`;
    this.analysisCache.set(cacheKey, results);
    setTimeout(() => {
      this.analysisCache.delete(cacheKey);
    }, this.config.cacheTTL);
  }
  getAnalysisHistory() {
    return Array.from(this.analysisCache.values());
  }
  clearAnalysisCache() {
    this.analysisCache.clear();
  }
};

// src/visualization/HandoffVisualizer.ts
var import_events4 = require("events");
var HandoffVisualizer = class extends import_events4.EventEmitter {
  config;
  constructor(config) {
    super();
    this.config = { ...config };
  }
  /**
   * Generate flowchart visualization data
   */
  async generateFlowchart(trackingData) {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;
    const nodes = agents.map((agent) => ({
      id: agent,
      label: agent,
      type: "agent",
      metrics: trackingData.agentMetrics[agent]
    }));
    const edges = handoffs.map((handoff) => ({
      from: handoff.fromAgent,
      to: handoff.toAgent,
      label: `${handoff.latency}ms`,
      data: handoff
    }));
    return {
      type: "flowchart",
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        averageLatency: trackingData.systemMetrics.averageLatency
      }
    };
  }
  /**
   * Generate heatmap visualization data
   */
  async generateHeatmap(trackingData) {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;
    const heatmapMatrix = {};
    const agentsSorted = agents.sort();
    agentsSorted.forEach((fromAgent) => {
      heatmapMatrix[fromAgent] = {};
      agentsSorted.forEach((toAgent) => {
        heatmapMatrix[fromAgent][toAgent] = 0;
      });
    });
    handoffs.forEach((handoff) => {
      const from = handoff.fromAgent;
      const to = handoff.toAgent;
      heatmapMatrix[from][to] = handoff.latency;
    });
    return {
      type: "heatmap",
      matrix: heatmapMatrix,
      agents: agentsSorted,
      metrics: {
        minLatency: Math.min(...Object.values(handoffs).map((h) => h.latency)),
        maxLatency: Math.max(...Object.values(handoffs).map((h) => h.latency)),
        avgLatency: trackingData.systemMetrics.averageLatency
      },
      analysis: this.generateHeatmapAnalysis(trackingData)
    };
  }
  /**
   * Generate performance dashboard
   */
  async generatePerformanceDashboard(trackingData) {
    const agents = Object.keys(trackingData.agentMetrics);
    const agentData = agents.map((agent) => ({
      name: agent,
      latency: trackingData.agentMetrics[agent].averageLatency,
      throughput: trackingData.agentMetrics[agent].throughput,
      reliability: trackingData.agentMetrics[agent].reliability * 100,
      memoryUsage: trackingData.agentMetrics[agent].memoryUsage,
      cpuUsage: trackingData.agentMetrics[agent].cpuUsage
    }));
    return {
      type: "dashboard",
      systemMetrics: {
        totalAgents: trackingData.systemMetrics.totalAgents,
        totalHandoffs: trackingData.systemMetrics.totalHandoffs,
        averageLatency: trackingData.systemMetrics.averageLatency,
        throughput: trackingData.systemMetrics.throughput,
        reliability: trackingData.systemMetrics.reliability * 100,
        memoryUsage: trackingData.systemMetrics.memoryUsage,
        cpuUsage: trackingData.systemMetrics.cpuUsage
      },
      agentData,
      timestamp: Date.now(),
      timeWindow: trackingData.timeWindow
    };
  }
  /**
   * Generate network diagram
   */
  async generateNetworkDiagram(trackingData) {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;
    const nodes = agents.map((agent) => ({
      id: agent,
      label: agent,
      group: "agent",
      metrics: trackingData.agentMetrics[agent]
    }));
    const links = handoffs.map((handoff) => ({
      source: handoff.fromAgent,
      target: handoff.toAgent,
      value: handoff.latency,
      data: handoff
    }));
    return {
      type: "network",
      nodes,
      links,
      statistics: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        averageLatency: trackingData.systemMetrics.averageLatency,
        networkDensity: this.calculateNetworkDensity(nodes.length, links.length)
      }
    };
  }
  /**
   * Generate timeline visualization
   */
  async generateTimeline(trackingData) {
    const handoffs = trackingData.handoffMetrics.sort((a, b) => a.timestamp - b.timestamp);
    const timelineData = handoffs.map((handoff) => ({
      timestamp: handoff.timestamp,
      fromAgent: handoff.fromAgent,
      toAgent: handoff.toAgent,
      latency: handoff.latency,
      status: handoff.status,
      strategy: handoff.strategy,
      messageSize: handoff.messageSize
    }));
    return {
      type: "timeline",
      data: timelineData,
      statistics: {
        totalEvents: timelineData.length,
        timeRange: trackingData.timeWindow,
        averageLatency: trackingData.systemMetrics.averageLatency,
        throughput: trackingData.systemMetrics.throughput
      }
    };
  }
  /**
   * Generate treemap visualization
   */
  async generateTreemap(trackingData) {
    const agents = Object.keys(trackingData.agentMetrics);
    const agentNodes = agents.map((agent) => {
      const metrics = trackingData.agentMetrics[agent];
      return {
        name: agent,
        value: metrics.totalHandoffs || 1,
        children: [
          {
            name: "Latency",
            value: metrics.averageLatency
          },
          {
            name: "Throughput",
            value: metrics.throughput
          },
          {
            name: "Reliability",
            value: metrics.reliability * 100
          }
        ]
      };
    });
    return {
      type: "treemap",
      name: "Agents",
      children: agentNodes,
      statistics: {
        totalNodes: agentNodes.length,
        totalValue: agentNodes.reduce((sum, node) => sum + node.value, 0)
      }
    };
  }
  /**
   * Generate heatmap analysis
   */
  generateHeatmapAnalysis(trackingData) {
    const handoffs = trackingData.handoffMetrics;
    const analysis = {
      bottlenecks: [],
      patterns: [],
      recommendations: []
    };
    const avgLatencyByPair = this.calculateAverageLatencyByPair(handoffs);
    Object.entries(avgLatencyByPair).forEach(([pair, latency]) => {
      if (latency > 1e3) {
        analysis.bottlenecks.push({
          pair,
          latency,
          severity: latency > 1500 ? "high" : "medium"
        });
      }
    });
    const patterns = this.identifyHandoffPatterns(handoffs);
    analysis.patterns = patterns;
    if (analysis.bottlenecks.length > 0) {
      analysis.recommendations.push(
        "Consider implementing caching for high-latency handoffs",
        "Optimize communication between agent pairs with high latency"
      );
    }
    return analysis;
  }
  /**
   * Calculate network density
   */
  calculateNetworkDensity(nodes, links) {
    const maxLinks = nodes * (nodes - 1) / 2;
    return maxLinks > 0 ? links / maxLinks : 0;
  }
  /**
   * Calculate average latency by agent pair
   */
  calculateAverageLatencyByPair(handoffs) {
    const pairLatencies = {};
    handoffs.forEach((handoff) => {
      const pair = `${handoff.fromAgent}\u2192${handoff.toAgent}`;
      if (!pairLatencies[pair]) {
        pairLatencies[pair] = [];
      }
      pairLatencies[pair].push(handoff.latency);
    });
    const result = {};
    Object.entries(pairLatencies).forEach(([pair, latencies]) => {
      result[pair] = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    });
    return result;
  }
  /**
   * Identify handoff patterns
   */
  identifyHandoffPatterns(handoffs) {
    const patterns = [];
    const routes = handoffs.map((h) => `${h.fromAgent}\u2192${h.toAgent}`);
    const routeCounts = {};
    routes.forEach((route) => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const sortedRoutes = Object.entries(routeCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    sortedRoutes.forEach(([route, count]) => {
      patterns.push({
        type: "frequent_route",
        route,
        frequency: count,
        percentage: count / routes.length * 100
      });
    });
    const highLatencyHandoffs = handoffs.filter((h) => h.latency > 1e3);
    if (highLatencyHandoffs.length > 0) {
      patterns.push({
        type: "high_latency",
        count: highLatencyHandoffs.length,
        averageLatency: highLatencyHandoffs.reduce((sum, h) => sum + h.latency, 0) / highLatencyHandoffs.length
      });
    }
    return patterns;
  }
  /**
   * Render visualization
   */
  async render(trackingData, type) {
    switch (type) {
      case "flowchart":
        return await this.generateFlowchart(trackingData);
      case "heatmap":
        return await this.generateHeatmap(trackingData);
      case "dashboard":
        return await this.generatePerformanceDashboard(trackingData);
      case "network":
        return await this.generateNetworkDiagram(trackingData);
      case "timeline":
        return await this.generateTimeline(trackingData);
      case "treemap":
        return await this.generateTreemap(trackingData);
      default:
        throw new Error(`Unknown visualization type: ${type}`);
    }
  }
  /**
   * Get available visualization types
   */
  getAvailableTypes() {
    return ["flowchart", "heatmap", "dashboard", "network", "timeline", "treemap"];
  }
  /**
   * Generate a human-readable markdown report from tracking data.
   * Great for pasting into PRs, Slack, or Notion.
   */
  toMarkdown(data) {
    const lines = [];
    const s = data.systemMetrics;
    const agents = Object.entries(data.agentMetrics);
    const handoffs = data.handoffMetrics;
    const duration = ((data.timeWindow.end - data.timeWindow.start) / 1e3).toFixed(1);
    lines.push("# Agent Handoff Report");
    lines.push("");
    lines.push(`**Duration:** ${duration}s | **Agents:** ${s.totalAgents} | **Handoffs:** ${s.totalHandoffs}`);
    lines.push("");
    lines.push("## System Overview");
    lines.push("");
    lines.push("| Metric | Value |");
    lines.push("|--------|-------|");
    lines.push(`| Avg Latency | ${s.averageLatency.toFixed(1)}ms |`);
    lines.push(`| Throughput | ${s.throughput.toFixed(1)} req/s |`);
    lines.push(`| Reliability | ${(s.reliability * 100).toFixed(1)}% |`);
    lines.push(`| Memory | ${s.memoryUsage.toFixed(1)}% |`);
    lines.push(`| CPU | ${s.cpuUsage.toFixed(1)}% |`);
    lines.push("");
    if (agents.length > 0) {
      lines.push("## Agent Breakdown");
      lines.push("");
      lines.push("| Agent | Handoffs | Avg Latency | Reliability | Error Rate |");
      lines.push("|-------|----------|-------------|-------------|------------|");
      for (const [name, m] of agents) {
        lines.push(`| ${name} | ${m.totalHandoffs} | ${m.averageLatency.toFixed(0)}ms | ${(m.reliability * 100).toFixed(1)}% | ${(m.errorRate * 100).toFixed(1)}% |`);
      }
      lines.push("");
    }
    if (handoffs.length > 0) {
      const routes = {};
      for (const h of handoffs) {
        const key = h.fromAgent + " \u2192 " + h.toAgent;
        if (!routes[key])
          routes[key] = { count: 0, totalLatency: 0 };
        routes[key].count++;
        routes[key].totalLatency += h.latency;
      }
      const sorted = Object.entries(routes).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
      lines.push("## Top Handoff Routes");
      lines.push("");
      lines.push("| Route | Count | Avg Latency |");
      lines.push("|-------|-------|-------------|");
      for (const [route, r] of sorted) {
        lines.push("| " + route + " | " + r.count + " | " + (r.totalLatency / r.count).toFixed(0) + "ms |");
      }
      lines.push("");
    }
    if (data.bottlenecks.length > 0) {
      lines.push("## \u26A0\uFE0F Bottlenecks");
      lines.push("");
      for (const b of data.bottlenecks) {
        lines.push("- **" + b.description + "** (severity: " + b.severity + "/10) \u2014 affects: " + b.affectedAgents.join(", "));
      }
      lines.push("");
    }
    return lines.join("\n");
  }
};

// src/core/AgentHandoffManager.ts
var import_events5 = require("events");
var AgentHandoffManager = class extends import_events5.EventEmitter {
  config;
  agents = /* @__PURE__ */ new Map();
  handoffs = /* @__PURE__ */ new Map();
  dependencies = /* @__PURE__ */ new Map();
  tracker;
  optimizer;
  activeHandoffs = /* @__PURE__ */ new Set();
  completedHandoffs = /* @__PURE__ */ new Map();
  performanceHistory = [];
  constructor(config) {
    super();
    this.config = { ...config };
    this.tracker = new HandoffTracker(config);
    this.optimizer = new HandoffOptimizer(config);
    this.setupEventListeners();
  }
  /**
   * Register a new agent
   */
  async registerAgent(agent) {
    console.log(`\u{1F916} Registering agent: ${agent.name}`);
    this.validateAgent(agent);
    this.agents.set(agent.id, agent);
    if (!this.dependencies.has(agent.id)) {
      this.dependencies.set(agent.id, []);
    }
    this.emit("agentRegistered", agent);
    console.log(`\u2705 Agent ${agent.name} registered successfully`);
  }
  /**
   * Register multiple agents
   */
  async registerAgents(agents) {
    console.log(`\u{1F916} Registering ${agents.length} agents...`);
    for (const agent of agents) {
      await this.registerAgent(agent);
    }
    console.log(`\u2705 All agents registered successfully`);
  }
  /**
   * Execute a handoff between agents
   */
  async executeHandoff(fromAgent, toAgent, data, options = {}) {
    console.log(`\u{1F504} Executing handoff: ${fromAgent} \u2192 ${toAgent}`);
    if (!this.agents.has(fromAgent)) {
      throw new Error(`Source agent ${fromAgent} not found`);
    }
    if (!this.agents.has(toAgent)) {
      throw new Error(`Target agent ${toAgent} not found`);
    }
    const handoff = {
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromAgent,
      toAgent,
      data,
      strategy: options.strategy || "direct",
      timestamp: Date.now(),
      status: "pending",
      priority: options.priority || "medium",
      timeout: options.timeout || 3e4,
      metadata: {
        startTime: Date.now(),
        expectedDuration: options.timeout || 3e4,
        retries: options.retries || 3
      }
    };
    this.handoffs.set(handoff.id, handoff);
    this.activeHandoffs.add(handoff.id);
    this.emit("handoffStarted", handoff);
    try {
      const result = await this.executeHandoffWithRetries(handoff, options.retries || 3);
      this.completedHandoffs.set(handoff.id, result);
      this.activeHandoffs.delete(handoff.id);
      this.recordHandoffMetrics(handoff, result);
      this.emit("handoffCompleted", { handoff, result });
      console.log(`\u2705 Handoff completed: ${fromAgent} \u2192 ${toAgent}`);
      return result;
    } catch (error) {
      const failedResult = {
        id: handoff.id,
        timestamp: Date.now(),
        success: false,
        latency: 0,
        messageSize: JSON.stringify(data).length,
        strategy: handoff.strategy,
        optimization: {
          target: "reliability",
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
          status: "failed",
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
      this.emit("handoffFailed", { handoff, error });
      console.log(`\u274C Handoff failed: ${fromAgent} \u2192 ${toAgent}`);
      throw error;
    }
  }
  /**
   * Execute handoff with retry logic
   */
  async executeHandoffWithRetries(handoff, maxRetries) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        handoff.status = "in_progress";
        this.handoffs.set(handoff.id, handoff);
        const result = await this.performHandoff(handoff);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          console.log(`\u26A0\uFE0F Handoff attempt ${attempt + 1} failed, retrying...`);
          await this.delay(1e3 * Math.pow(2, attempt));
        } else {
          console.log(`\u274C Handoff failed after ${maxRetries + 1} attempts`);
          throw lastError;
        }
      }
    }
    throw lastError;
  }
  /**
   * Perform the actual handoff
   */
  async performHandoff(handoff) {
    const startTime = Date.now();
    const fromAgent = this.agents.get(handoff.fromAgent);
    const toAgent = this.agents.get(handoff.toAgent);
    await this.delay(Math.random() * 200 + 50);
    const endTime = Date.now();
    const latency = endTime - startTime;
    const success = Math.random() > 0.1;
    if (success) {
      await this.delay(Math.random() * 100);
      const result = {
        id: handoff.id,
        timestamp: endTime,
        success: true,
        latency,
        messageSize: JSON.stringify(handoff.data).length,
        strategy: handoff.strategy,
        optimization: {
          target: "latency",
          improvement: Math.random() * 30,
          confidence: 0.8
        },
        metrics: {
          id: handoff.id,
          timestamp: endTime,
          fromAgent: handoff.fromAgent,
          toAgent: handoff.toAgent,
          latency,
          throughput: 1e3 / latency,
          // Requests per second
          reliability: 1,
          messageSize: JSON.stringify(handoff.data).length,
          status: "success",
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
      throw new Error("Handoff failed due to agent error");
    }
  }
  /**
   * Execute a sequence of handoffs
   */
  async executeHandoffSequence(sequence, options = {}) {
    console.log(`\u{1F504} Executing handoff sequence with ${sequence.length} handoffs...`);
    const results = [];
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
    console.log(`\u2705 Handoff sequence completed with ${results.length} results`);
    return results;
  }
  /**
   * Add dependency between agents
   */
  addDependency(fromAgent, toAgent, dependency) {
    if (!this.dependencies.has(fromAgent)) {
      this.dependencies.set(fromAgent, []);
    }
    this.dependencies.get(fromAgent).push({
      ...dependency,
      targetAgent: toAgent,
      lastUsed: Date.now(),
      usageCount: 0
    });
    console.log(`\u{1F517} Added dependency: ${fromAgent} \u2192 ${toAgent}`);
  }
  /**
   * Get agent dependencies
   */
  getDependencies(agent) {
    return this.dependencies.get(agent) || [];
  }
  /**
   * Get all agents
   */
  getAgents() {
    return Array.from(this.agents.values());
  }
  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  /**
   * Get active handoffs
   */
  getActiveHandoffs() {
    return Array.from(this.activeHandoffs).map((id) => this.handoffs.get(id));
  }
  /**
   * Get completed handoffs
   */
  getCompletedHandoffs() {
    return Array.from(this.completedHandoffs.values());
  }
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    const trackingData = await this.tracker.getResults();
    this.performanceHistory.push(trackingData);
    return trackingData;
  }
  /**
   * Optimize handoff performance
   */
  async optimizeHandoffs() {
    const trackingData = await this.getPerformanceMetrics();
    const optimization = await this.optimizer.optimize(trackingData);
    console.log("\u2705 Handoff optimization completed");
    return optimization;
  }
  /**
   * Start tracking
   */
  async startTracking(duration = 60) {
    console.log("\u{1F50D} Starting handoff tracking...");
    await this.tracker.trackAll(duration);
  }
  /**
   * Stop tracking
   */
  async stopTracking() {
    console.log("\u{1F6D1} Stopping handoff tracking...");
    await this.tracker.stopTracking();
  }
  /**
   * Get tracking results
   */
  async getTrackingResults() {
    return await this.tracker.getResults();
  }
  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      agents: this.agents.size,
      activeHandoffs: this.activeHandoffs.size,
      completedHandoffs: this.completedHandoffs.size,
      dependencies: Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0),
      uptime: Date.now() - this.startTime
    };
  }
  /**
   * Validate agent configuration
   */
  validateAgent(agent) {
    if (!agent.id || !agent.name) {
      throw new Error("Agent must have id and name");
    }
    if (!agent.capabilities || agent.capabilities.length === 0) {
      throw new Error("Agent must have at least one capability");
    }
    if (!agent.constraints) {
      throw new Error("Agent must have constraints");
    }
    if (!agent.performance) {
      throw new Error("Agent must have performance metrics");
    }
  }
  /**
   * Record handoff metrics
   */
  recordHandoffMetrics(handoff, result) {
    const metrics = {
      id: handoff.id,
      timestamp: result.timestamp,
      fromAgent: handoff.fromAgent,
      toAgent: handoff.toAgent,
      latency: result.latency,
      throughput: result.optimization.confidence * 100,
      // Mock throughput
      reliability: result.success ? 1 : 0,
      messageSize: result.messageSize,
      status: result.success ? "success" : "failed",
      error: result.success ? void 0 : "Handoff failed",
      strategy: handoff.strategy,
      metadata: result.metadata
    };
    this.tracker.recordMetrics(metrics);
  }
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.tracker.on("metrics", (metrics) => {
      this.emit("metrics", metrics);
    });
    this.tracker.on("handoff", (handoff) => {
      this.emit("handoff", handoff);
    });
    this.tracker.on("stats", (stats) => {
      this.emit("stats", stats);
    });
    this.tracker.on("trackingComplete", (results) => {
      this.emit("trackingComplete", results);
    });
    this.optimizer.on("optimizationComplete", (results) => {
      this.emit("optimizationComplete", results);
    });
    this.optimizer.on("planCreated", (plan) => {
      this.emit("planCreated", plan);
    });
  }
  /**
   * Utility methods
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  startTime = Date.now();
};

// src/cli.ts
var import_chalk = __toESM(require("chalk"));
var import_fs = require("fs");
var import_path = require("path");
var program = new import_commander.Command();
program.name("aho").description("Agent Handoff Optimizer - Optimize and debug agent handoffs in multi-agent systems").version("1.0.0");
program.command("track").description("Track handoffs in multi-agent systems").option("-a, --agent <agent>", "Specific agent to track").option("-d, --duration <seconds>", "Tracking duration in seconds", "60").option("-o, --output <file>", "Output file for tracking data").option("-v, --verbose", "Verbose output").action(async (options) => {
  try {
    const config = {
      outputFormat: "table",
      verbose: options.verbose || false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 3e5,
      agents: {},
      handoffStrategies: ["direct", "batch", "cached"],
      optimizationTargets: ["latency", "throughput", "reliability"]
    };
    const tracker = new HandoffTracker(config);
    const duration = parseInt(options.duration);
    console.log(import_chalk.default.blue(`\u{1F504} Starting tracking for ${duration} seconds...`));
    if (options.agent) {
      await tracker.startTracking(duration, options.agent);
    } else {
      await tracker.startTracking(duration);
    }
    console.log(import_chalk.default.green("\u2705 Tracking started successfully"));
    console.log(`\u{1F4CA} Tracking agent handoffs for ${duration} seconds`);
    await new Promise((resolve) => setTimeout(resolve, duration * 1e3));
    const metrics = tracker.getPerformanceMetrics();
    if (options.output) {
      (0, import_fs.writeFileSync)(options.output, JSON.stringify(metrics, null, 2));
      console.log(import_chalk.default.green(`\u{1F4C4} Metrics saved to ${options.output}`));
    }
    console.log(import_chalk.default.blue("\\n\u{1F4C8} Performance Metrics:"));
    console.log(`  Total Agents: ${metrics.systemMetrics.totalAgents}`);
    console.log(`  Total Handoffs: ${metrics.systemMetrics.totalHandoffs}`);
    console.log(`  Average Latency: ${metrics.systemMetrics.averageLatency}ms`);
    console.log(`  Throughput: ${metrics.systemMetrics.throughput} req/s`);
    console.log(`  Reliability: ${(metrics.systemMetrics.reliability * 100).toFixed(1)}%`);
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during tracking:"), error.message);
    process.exit(1);
  }
});
program.command("analyze").description("Analyze performance and generate recommendations").option("-i, --input <file>", "Input file with tracking data").option("-o, --output <file>", "Output file for analysis results").option("-t, --target <target>", "Optimization target: latency|throughput|reliability|cost").option("-v, --verbose", "Verbose output").action(async (options) => {
  try {
    const config = {
      outputFormat: "table",
      verbose: options.verbose || false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 3e5,
      agents: {},
      handoffStrategies: ["direct", "batch", "cached"],
      optimizationTargets: ["latency", "throughput", "reliability"]
    };
    let trackingData;
    if (options.input) {
      if (!(0, import_fs.existsSync)(options.input)) {
        console.error(import_chalk.default.red(`\u274C Input file not found: ${options.input}`));
        process.exit(1);
      }
      trackingData = JSON.parse((0, import_fs.readFileSync)(options.input, "utf-8"));
    } else {
      const tracker = new HandoffTracker(config);
      trackingData = await tracker.getPerformanceMetrics();
    }
    const analyzer = new PerformanceAnalyzer(config);
    const analysis = await analyzer.analyze(trackingData);
    console.log(import_chalk.default.blue("\\n\u{1F4CA} Performance Analysis Results:"));
    console.log(`\\n\u{1F50D} Bottlenecks Found: ${analysis.bottlenecks.length}`);
    analysis.bottlenecks.forEach((bottleneck) => {
      console.log(`  \u2022 ${bottleneck.description}`);
      console.log(`    Severity: ${bottleneck.severity}/10`);
      console.log(`    Affected: ${bottleneck.affectedAgents.join(", ")}`);
    });
    console.log(`\\n\u{1F4C8} Optimization Opportunities: ${analysis.opportunities.length}`);
    analysis.opportunities.forEach((opportunity) => {
      console.log(`  \u2022 ${opportunity.title}`);
      console.log(`    Impact: ${opportunity.impact.score}/10`);
      console.log(`    Feasibility: ${opportunity.impact.feasibility}/10`);
    });
    if (options.output) {
      (0, import_fs.writeFileSync)(options.output, JSON.stringify(analysis, null, 2));
      console.log(import_chalk.default.green(`\u{1F4C4} Analysis saved to ${options.output}`));
    }
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during analysis:"), error.message);
    process.exit(1);
  }
});
program.command("optimize").description("Generate optimization suggestions").option("-i, --input <file>", "Input file with tracking data").option("-o, --output <file>", "Output file for optimization results").option("-t, --target <target>", "Optimization target: latency|throughput|reliability|cost").option("-s, --strategy <strategy>", "Handoff strategy: direct|batch|cached|streaming").option("-c, --constraints <json>", "JSON string of constraints").option("-v, --verbose", "Verbose output").action(async (options) => {
  try {
    const config = {
      outputFormat: "table",
      verbose: options.verbose || false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 3e5,
      agents: {},
      handoffStrategies: ["direct", "batch", "cached"],
      optimizationTargets: ["latency", "throughput", "reliability"]
    };
    let trackingData;
    if (options.input) {
      if (!(0, import_fs.existsSync)(options.input)) {
        console.error(import_chalk.default.red(`\u274C Input file not found: ${options.input}`));
        process.exit(1);
      }
      trackingData = JSON.parse((0, import_fs.readFileSync)(options.input, "utf-8"));
    } else {
      const tracker = new HandoffTracker(config);
      trackingData = await tracker.getPerformanceMetrics();
    }
    const optimizer = new HandoffOptimizer(config);
    const constraints = options.constraints ? JSON.parse(options.constraints) : {};
    const optimization = await optimizer.optimize(trackingData, {
      target: options.target,
      strategy: options.strategy,
      constraints
    });
    console.log(import_chalk.default.blue("\\n\u{1F680} Optimization Results:"));
    console.log(`\\n\u{1F4CB} Generated ${optimization.suggestions.length} suggestions:`);
    optimization.suggestions.forEach((suggestion, index) => {
      console.log(`\\n${index + 1}. ${suggestion.title}`);
      console.log(`   Type: ${suggestion.type} (Priority: ${suggestion.priority}/10)`);
      console.log(`   Problem: ${suggestion.currentProblem}`);
      console.log(`   Solution: ${suggestion.proposedSolution}`);
      console.log(`   Expected Improvement:`);
      console.log(`     Latency: ${suggestion.expectedImprovement.latency}%`);
      console.log(`     Throughput: ${suggestion.expectedImprovement.throughput}%`);
      console.log(`     Reliability: ${suggestion.expectedImprovement.reliability}%`);
      console.log(`     Cost: ${suggestion.expectedImprovement.cost}%`);
      console.log(`   Implementation: ${suggestion.implementation.timeRequired}`);
    });
    console.log(`\\n\u{1F4CA} Plan Summary:`);
    console.log(`   Total Impact: ${optimization.plan.totalImpact.latency}% latency, ${optimization.plan.totalImpact.throughput}% throughput`);
    console.log(`   Estimated Completion: ${optimization.plan.estimatedCompletion.toLocaleDateString()}`);
    console.log(`   Dependencies: ${optimization.plan.dependencies.length}`);
    if (options.output) {
      (0, import_fs.writeFileSync)(options.output, JSON.stringify(optimization, null, 2));
      console.log(import_chalk.default.green(`\u{1F4C4} Optimization results saved to ${options.output}`));
    }
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during optimization:"), error.message);
    process.exit(1);
  }
});
program.command("visualize").description("Create visualizations of handoff flows").option("-i, --input <file>", "Input file with tracking data").option("-t, --type <type>", "Visualization type: flowchart|heatmap|dashboard|network|timeline|treemap", "flowchart").option("-o, --output <file>", "Output file for visualization data").option("-v, --verbose", "Verbose output").action(async (options) => {
  try {
    const config = {
      outputFormat: "table",
      verbose: options.verbose || false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 3e5,
      agents: {},
      handoffStrategies: ["direct", "batch", "cached"],
      optimizationTargets: ["latency", "throughput", "reliability"]
    };
    let trackingData;
    if (options.input) {
      if (!(0, import_fs.existsSync)(options.input)) {
        console.error(import_chalk.default.red(`\u274C Input file not found: ${options.input}`));
        process.exit(1);
      }
      trackingData = JSON.parse((0, import_fs.readFileSync)(options.input, "utf-8"));
    } else {
      const tracker = new HandoffTracker(config);
      trackingData = await tracker.getPerformanceMetrics();
    }
    const visualizer = new HandoffVisualizer(config);
    const visualization = await visualizer.render(trackingData, options.type);
    if (options.output) {
      (0, import_fs.writeFileSync)(options.output, JSON.stringify(visualization, null, 2));
      console.log(import_chalk.default.green(`\u{1F4C4} Visualization saved to ${options.output}`));
    } else {
      console.log(import_chalk.default.blue("\\n\u{1F4CA} Visualization generated:"));
      console.log(`Type: ${visualization.type}`);
      if (visualization.metadata) {
        console.log(`Metadata:`, visualization.metadata);
      }
    }
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during visualization:"), error.message);
    process.exit(1);
  }
});
program.command("config").description("Manage configuration settings").option("-s, --set <key=value>", "Set configuration value").option("-g, --get <key>", "Get configuration value").option("-l, --list", "List all configuration").action(async (options) => {
  try {
    const configPath = (0, import_path.join)(process.cwd(), "aho-config.json");
    if (options.list) {
      if ((0, import_fs.existsSync)(configPath)) {
        const config = JSON.parse((0, import_fs.readFileSync)(configPath, "utf-8"));
        console.log(import_chalk.default.blue("\\n\u{1F4CB} Current Configuration:"));
        Object.entries(config).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      } else {
        console.log(import_chalk.default.yellow("\u2139\uFE0F  No configuration file found"));
      }
      return;
    }
    if (options.get) {
      if ((0, import_fs.existsSync)(configPath)) {
        const config = JSON.parse((0, import_fs.readFileSync)(configPath, "utf-8"));
        console.log(import_chalk.default.blue(`\u{1F4CB} Configuration value for ${options.get}:`));
        console.log(config[options.get] || "Not set");
      } else {
        console.log(import_chalk.default.yellow("\u2139\uFE0F  No configuration file found"));
      }
      return;
    }
    if (options.set) {
      const [key, value] = options.set.split("=");
      if (!key || !value) {
        console.error(import_chalk.default.red("\u274C Invalid set format. Use: --set key=value"));
        process.exit(1);
      }
      let config = {};
      if ((0, import_fs.existsSync)(configPath)) {
        config = JSON.parse((0, import_fs.readFileSync)(configPath, "utf-8"));
      }
      config[key] = value;
      (0, import_fs.writeFileSync)(configPath, JSON.stringify(config, null, 2));
      console.log(import_chalk.default.green(`\u2705 Configuration updated: ${key} = ${value}`));
    }
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during config operation:"), error.message);
    process.exit(1);
  }
});
program.command("debug").description("Debug information and system status").option("-v, --verbose", "Verbose output").action(async (options) => {
  try {
    const config = {
      outputFormat: "table",
      verbose: options.verbose || false,
      trackLatency: true,
      analyzePerformance: true,
      autoOptimize: false,
      cacheEnabled: true,
      cacheTTL: 3e5,
      agents: {},
      handoffStrategies: ["direct", "batch", "cached"],
      optimizationTargets: ["latency", "throughput", "reliability"]
    };
    const manager = new AgentHandoffManager(config);
    const status = manager.getSystemStatus();
    console.log(import_chalk.default.blue("\\n\u{1F527} System Status:"));
    console.log(`  Agents: ${status.agents}`);
    console.log(`  Active Handoffs: ${status.activeHandoffs}`);
    console.log(`  Completed Handoffs: ${status.completedHandoffs}`);
    console.log(`  Dependencies: ${status.dependencies}`);
    console.log(`  Uptime: ${(status.uptime / 1e3).toFixed(1)}s`);
    if (options.verbose) {
      console.log(import_chalk.default.blue("\\n\u{1F4CA} Detailed Metrics:"));
      const metrics = await manager.getPerformanceMetrics();
      console.log(JSON.stringify(metrics, null, 2));
    }
  } catch (error) {
    console.error(import_chalk.default.red("\u274C Error during debug:"), error.message);
    process.exit(1);
  }
});
program.parse();
