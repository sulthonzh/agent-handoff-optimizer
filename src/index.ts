#!/usr/bin/env node

/**
 * Agent Handoff Optimizer - Main Entry Point
 * 
 * A specialized tool for optimizing and debugging agent handoffs in multi-agent systems.
 * 
 * Features:
 * - Handoff performance tracking
 * - Coordination optimization
 * - Debugging & visibility
 * - Performance analytics
 * 
 * @author Sulthonzh
 * @version 1.0.0
 */

export { HandoffTracker } from './core/HandoffTracker';
export { HandoffOptimizer } from './core/HandoffOptimizer';
export { PerformanceAnalyzer } from './analytics/PerformanceAnalyzer';
export { HandoffVisualizer } from './visualization/HandoffVisualizer';
export { AgentHandoffManager } from './core/AgentHandoffManager';
export { Config } from './types/Config';
export { HandoffMetrics } from './types/HandoffMetrics';
export { AgentRegistry } from './types/AgentConfig';
export { HandoffResult } from './types/HandoffResult';
export { OptimizationSuggestion } from './types/OptimizationSuggestion';

// Re-export all agent config types
export {
  AgentDefinition,
  AgentCapability,
  AgentConstraints,
  AgentPerformance,
  AgentHandoff,
  AgentDependency
} from './types/AgentConfig';