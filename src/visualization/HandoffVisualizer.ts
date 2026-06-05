/**
 * Handoff Visualizer - Visualization components for agent handoffs
 */

import { PerformanceMetrics } from '../types/HandoffMetrics';
import { Config } from '../types/Config';
import { EventEmitter } from 'events';

export class HandoffVisualizer extends EventEmitter {
  private config: Config;

  constructor(config: Config) {
    super();
    this.config = { ...config };
  }

  /**
   * Generate flowchart visualization data
   */
  async generateFlowchart(trackingData: PerformanceMetrics): Promise<any> {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;

    const nodes = agents.map(agent => ({
      id: agent,
      label: agent,
      type: 'agent',
      metrics: trackingData.agentMetrics[agent]
    }));

    const edges = handoffs.map(handoff => ({
      from: handoff.fromAgent,
      to: handoff.toAgent,
      label: `${handoff.latency}ms`,
      data: handoff
    }));

    return {
      type: 'flowchart',
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
  async generateHeatmap(trackingData: PerformanceMetrics): Promise<any> {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;

    // Create heatmap matrix
    const heatmapMatrix: Record<string, Record<string, number>> = {};
    const agentsSorted = agents.sort();

    // Initialize matrix
    agentsSorted.forEach(fromAgent => {
      heatmapMatrix[fromAgent] = {};
      agentsSorted.forEach(toAgent => {
        heatmapMatrix[fromAgent][toAgent] = 0;
      });
    });

    // Fill matrix with handoff data
    handoffs.forEach(handoff => {
      const from = handoff.fromAgent;
      const to = handoff.toAgent;
      
      // Use latency as the heatmap value
      heatmapMatrix[from][to] = handoff.latency;
    });

    // Generate heatmap data
    return {
      type: 'heatmap',
      matrix: heatmapMatrix,
      agents: agentsSorted,
      metrics: {
        minLatency: Math.min(...Object.values(handoffs).map(h => h.latency)),
        maxLatency: Math.max(...Object.values(handoffs).map(h => h.latency)),
        avgLatency: trackingData.systemMetrics.averageLatency
      },
      analysis: this.generateHeatmapAnalysis(trackingData)
    };
  }

  /**
   * Generate performance dashboard
   */
  async generatePerformanceDashboard(trackingData: PerformanceMetrics): Promise<any> {
    const agents = Object.keys(trackingData.agentMetrics);
    
    const agentData = agents.map(agent => ({
      name: agent,
      latency: trackingData.agentMetrics[agent].averageLatency,
      throughput: trackingData.agentMetrics[agent].throughput,
      reliability: trackingData.agentMetrics[agent].reliability * 100,
      memoryUsage: trackingData.agentMetrics[agent].memoryUsage,
      cpuUsage: trackingData.agentMetrics[agent].cpuUsage
    }));

    return {
      type: 'dashboard',
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
  async generateNetworkDiagram(trackingData: PerformanceMetrics): Promise<any> {
    const agents = Object.keys(trackingData.agentMetrics);
    const handoffs = trackingData.handoffMetrics;

    const nodes = agents.map(agent => ({
      id: agent,
      label: agent,
      group: 'agent',
      metrics: trackingData.agentMetrics[agent]
    }));

    const links = handoffs.map(handoff => ({
      source: handoff.fromAgent,
      target: handoff.toAgent,
      value: handoff.latency,
      data: handoff
    }));

    return {
      type: 'network',
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
  async generateTimeline(trackingData: PerformanceMetrics): Promise<any> {
    const handoffs = trackingData.handoffMetrics.sort((a, b) => a.timestamp - b.timestamp);

    const timelineData = handoffs.map(handoff => ({
      timestamp: handoff.timestamp,
      fromAgent: handoff.fromAgent,
      toAgent: handoff.toAgent,
      latency: handoff.latency,
      status: handoff.status,
      strategy: handoff.strategy,
      messageSize: handoff.messageSize
    }));

    return {
      type: 'timeline',
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
  async generateTreemap(trackingData: PerformanceMetrics): Promise<any> {
    const agents = Object.keys(trackingData.agentMetrics);
    
    const agentNodes = agents.map(agent => {
      const metrics = trackingData.agentMetrics[agent];
      return {
        name: agent,
        value: metrics.totalHandoffs || 1,
        children: [
          {
            name: 'Latency',
            value: metrics.averageLatency
          },
          {
            name: 'Throughput',
            value: metrics.throughput
          },
          {
            name: 'Reliability',
            value: metrics.reliability * 100
          }
        ]
      };
    });

    return {
      type: 'treemap',
      name: 'Agents',
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
  private generateHeatmapAnalysis(trackingData: PerformanceMetrics): any {
    const handoffs = trackingData.handoffMetrics;
    
    const analysis = {
      bottlenecks: [],
      patterns: [],
      recommendations: []
    };

    // Identify bottlenecks
    const avgLatencyByPair = this.calculateAverageLatencyByPair(handoffs);
    Object.entries(avgLatencyByPair).forEach(([pair, latency]) => {
      if (latency > 1000) {
        analysis.bottlenecks.push({
          pair,
          latency,
          severity: latency > 1500 ? 'high' : 'medium'
        });
      }
    });

    // Identify patterns
    const patterns = this.identifyHandoffPatterns(handoffs);
    analysis.patterns = patterns;

    // Generate recommendations
    if (analysis.bottlenecks.length > 0) {
      analysis.recommendations.push(
        'Consider implementing caching for high-latency handoffs',
        'Optimize communication between agent pairs with high latency'
      );
    }

    return analysis;
  }

  /**
   * Calculate network density
   */
  private calculateNetworkDensity(nodes: number, links: number): number {
    const maxLinks = nodes * (nodes - 1) / 2;
    return maxLinks > 0 ? links / maxLinks : 0;
  }

  /**
   * Calculate average latency by agent pair
   */
  private calculateAverageLatencyByPair(handoffs: any[]): Record<string, number> {
    const pairLatencies: Record<string, number[]> = {};
    
    handoffs.forEach(handoff => {
      const pair = `${handoff.fromAgent}→${handoff.toAgent}`;
      if (!pairLatencies[pair]) {
        pairLatencies[pair] = [];
      }
      pairLatencies[pair].push(handoff.latency);
    });

    const result: Record<string, number> = {};
    Object.entries(pairLatencies).forEach(([pair, latencies]) => {
      result[pair] = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    });

    return result;
  }

  /**
   * Identify handoff patterns
   */
  private identifyHandoffPatterns(handoffs: any[]): any[] {
    const patterns = [];
    
    // Find frequent handoff routes
    const routes = handoffs.map(h => `${h.fromAgent}→${h.toAgent}`);
    const routeCounts: Record<string, number> = {};
    
    routes.forEach(route => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    // Sort by frequency
    const sortedRoutes = Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    sortedRoutes.forEach(([route, count]) => {
      patterns.push({
        type: 'frequent_route',
        route,
        frequency: count,
        percentage: (count / routes.length) * 100
      });
    });

    // Find high-latency handoffs
    const highLatencyHandoffs = handoffs.filter(h => h.latency > 1000);
    if (highLatencyHandoffs.length > 0) {
      patterns.push({
        type: 'high_latency',
        count: highLatencyHandoffs.length,
        averageLatency: highLatencyHandoffs.reduce((sum, h) => sum + h.latency, 0) / highLatencyHandoffs.length
      });
    }

    return patterns;
  }

  /**
   * Render visualization
   */
  async render(
    trackingData: PerformanceMetrics,
    type: 'flowchart' | 'heatmap' | 'dashboard' | 'network' | 'timeline' | 'treemap'
  ): Promise<any> {
    switch (type) {
      case 'flowchart':
        return await this.generateFlowchart(trackingData);
      case 'heatmap':
        return await this.generateHeatmap(trackingData);
      case 'dashboard':
        return await this.generatePerformanceDashboard(trackingData);
      case 'network':
        return await this.generateNetworkDiagram(trackingData);
      case 'timeline':
        return await this.generateTimeline(trackingData);
      case 'treemap':
        return await this.generateTreemap(trackingData);
      default:
        throw new Error(`Unknown visualization type: ${type}`);
    }
  }

  /**
   * Get available visualization types
   */
  getAvailableTypes(): string[] {
    return ['flowchart', 'heatmap', 'dashboard', 'network', 'timeline', 'treemap'];
  }
}