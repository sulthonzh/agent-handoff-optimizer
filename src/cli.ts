#!/usr/bin/env node

/**
 * Agent Handoff Optimizer CLI
 * 
 * Command-line interface for optimizing and debugging agent handoffs
 */

import { Command } from 'commander';
import { Config } from './types/Config';
import { HandoffTracker } from './core/HandoffTracker';
import { HandoffOptimizer } from './core/HandoffOptimizer';
import { PerformanceAnalyzer } from './analytics/PerformanceAnalyzer';
import { HandoffVisualizer } from './visualization/HandoffVisualizer';
import { AgentHandoffManager } from './core/AgentHandoffManager';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('aho')
  .description('Agent Handoff Optimizer - Optimize and debug agent handoffs in multi-agent systems')
  .version('1.0.0');

// Track command
program
  .command('track')
  .description('Track handoffs in multi-agent systems')
  .option('-a, --agent <agent>', 'Specific agent to track')
  .option('-d, --duration <seconds>', 'Tracking duration in seconds', '60')
  .option('-o, --output <file>', 'Output file for tracking data')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const config: Config = {
        outputFormat: 'table',
        verbose: options.verbose || false,
        trackLatency: true,
        analyzePerformance: true,
        autoOptimize: false,
        cacheEnabled: true,
        cacheTTL: 300000,
        agents: {},
        handoffStrategies: ['direct', 'batch', 'cached'],
        optimizationTargets: ['latency', 'throughput', 'reliability']
      };

      const tracker = new HandoffTracker(config);
      const duration = parseInt(options.duration);

      console.log(chalk.blue(`🔄 Starting tracking for ${duration} seconds...`));

      if (options.agent) {
        await tracker.startTracking(duration, options.agent);
      } else {
        await tracker.startTracking(duration);
      }

      console.log(chalk.green('✅ Tracking started successfully'));
      console.log(`📊 Tracking agent handoffs for ${duration} seconds`);

      // Wait for tracking to complete
      await new Promise(resolve => setTimeout(resolve, duration * 1000));

      const metrics = tracker.getPerformanceMetrics();
      
      if (options.output) {
        writeFileSync(options.output, JSON.stringify(metrics, null, 2));
        console.log(chalk.green(`📄 Metrics saved to ${options.output}`));
      }

      console.log(chalk.blue('\\n📈 Performance Metrics:'));
      console.log(`  Total Agents: ${metrics.systemMetrics.totalAgents}`);
      console.log(`  Total Handoffs: ${metrics.systemMetrics.totalHandoffs}`);
      console.log(`  Average Latency: ${metrics.systemMetrics.averageLatency}ms`);
      console.log(`  Throughput: ${metrics.systemMetrics.throughput} req/s`);
      console.log(`  Reliability: ${(metrics.systemMetrics.reliability * 100).toFixed(1)}%`);

    } catch (error) {
      console.error(chalk.red('❌ Error during tracking:'), error.message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze performance and generate recommendations')
  .option('-i, --input <file>', 'Input file with tracking data')
  .option('-o, --output <file>', 'Output file for analysis results')
  .option('-t, --target <target>', 'Optimization target: latency|throughput|reliability|cost')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const config: Config = {
        outputFormat: 'table',
        verbose: options.verbose || false,
        trackLatency: true,
        analyzePerformance: true,
        autoOptimize: false,
        cacheEnabled: true,
        cacheTTL: 300000,
        agents: {},
        handoffStrategies: ['direct', 'batch', 'cached'],
        optimizationTargets: ['latency', 'throughput', 'reliability']
      };

      let trackingData;
      
      if (options.input) {
        if (!existsSync(options.input)) {
          console.error(chalk.red(`❌ Input file not found: ${options.input}`));
          process.exit(1);
        }
        trackingData = JSON.parse(readFileSync(options.input, 'utf-8'));
      } else {
        // Load recent tracking data
        const tracker = new HandoffTracker(config);
        trackingData = await tracker.getPerformanceMetrics();
      }

      const analyzer = new PerformanceAnalyzer(config);
      const analysis = await analyzer.analyze(trackingData);

      console.log(chalk.blue('\\n📊 Performance Analysis Results:'));
      console.log(`\\n🔍 Bottlenecks Found: ${analysis.bottlenecks.length}`);
      analysis.bottlenecks.forEach(bottleneck => {
        console.log(`  • ${bottleneck.description}`);
        console.log(`    Severity: ${bottleneck.severity}/10`);
        console.log(`    Affected: ${bottleneck.affectedAgents.join(', ')}`);
      });

      console.log(`\\n📈 Optimization Opportunities: ${analysis.opportunities.length}`);
      analysis.opportunities.forEach(opportunity => {
        console.log(`  • ${opportunity.title}`);
        console.log(`    Impact: ${opportunity.impact.score}/10`);
        console.log(`    Feasibility: ${opportunity.impact.feasibility}/10`);
      });

      if (options.output) {
        writeFileSync(options.output, JSON.stringify(analysis, null, 2));
        console.log(chalk.green(`📄 Analysis saved to ${options.output}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error during analysis:'), error.message);
      process.exit(1);
    }
  });

// Optimize command
program
  .command('optimize')
  .description('Generate optimization suggestions')
  .option('-i, --input <file>', 'Input file with tracking data')
  .option('-o, --output <file>', 'Output file for optimization results')
  .option('-t, --target <target>', 'Optimization target: latency|throughput|reliability|cost')
  .option('-s, --strategy <strategy>', 'Handoff strategy: direct|batch|cached|streaming')
  .option('-c, --constraints <json>', 'JSON string of constraints')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const config: Config = {
        outputFormat: 'table',
        verbose: options.verbose || false,
        trackLatency: true,
        analyzePerformance: true,
        autoOptimize: false,
        cacheEnabled: true,
        cacheTTL: 300000,
        agents: {},
        handoffStrategies: ['direct', 'batch', 'cached'],
        optimizationTargets: ['latency', 'throughput', 'reliability']
      };

      let trackingData;
      
      if (options.input) {
        if (!existsSync(options.input)) {
          console.error(chalk.red(`❌ Input file not found: ${options.input}`));
          process.exit(1);
        }
        trackingData = JSON.parse(readFileSync(options.input, 'utf-8'));
      } else {
        // Load recent tracking data
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

      console.log(chalk.blue('\\n🚀 Optimization Results:'));
      console.log(`\\n📋 Generated ${optimization.suggestions.length} suggestions:`);
      
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

      console.log(`\\n📊 Plan Summary:`);
      console.log(`   Total Impact: ${optimization.plan.totalImpact.latency}% latency, ${optimization.plan.totalImpact.throughput}% throughput`);
      console.log(`   Estimated Completion: ${optimization.plan.estimatedCompletion.toLocaleDateString()}`);
      console.log(`   Dependencies: ${optimization.plan.dependencies.length}`);

      if (options.output) {
        writeFileSync(options.output, JSON.stringify(optimization, null, 2));
        console.log(chalk.green(`📄 Optimization results saved to ${options.output}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error during optimization:'), error.message);
      process.exit(1);
    }
  });

// Visualize command
program
  .command('visualize')
  .description('Create visualizations of handoff flows')
  .option('-i, --input <file>', 'Input file with tracking data')
  .option('-t, --type <type>', 'Visualization type: flowchart|heatmap|dashboard|network|timeline|treemap', 'flowchart')
  .option('-o, --output <file>', 'Output file for visualization data')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const config: Config = {
        outputFormat: 'table',
        verbose: options.verbose || false,
        trackLatency: true,
        analyzePerformance: true,
        autoOptimize: false,
        cacheEnabled: true,
        cacheTTL: 300000,
        agents: {},
        handoffStrategies: ['direct', 'batch', 'cached'],
        optimizationTargets: ['latency', 'throughput', 'reliability']
      };

      let trackingData;
      
      if (options.input) {
        if (!existsSync(options.input)) {
          console.error(chalk.red(`❌ Input file not found: ${options.input}`));
          process.exit(1);
        }
        trackingData = JSON.parse(readFileSync(options.input, 'utf-8'));
      } else {
        // Load recent tracking data
        const tracker = new HandoffTracker(config);
        trackingData = await tracker.getPerformanceMetrics();
      }

      const visualizer = new HandoffVisualizer(config);
      const visualization = await visualizer.render(trackingData, options.type);
      
      if (options.output) {
        writeFileSync(options.output, JSON.stringify(visualization, null, 2));
        console.log(chalk.green(`📄 Visualization saved to ${options.output}`));
      } else {
        console.log(chalk.blue('\\n📊 Visualization generated:'));
        console.log(`Type: ${visualization.type}`);
        if (visualization.metadata) {
          console.log(`Metadata:`, visualization.metadata);
        }
      }

    } catch (error) {
      console.error(chalk.red('❌ Error during visualization:'), error.message);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage configuration settings')
  .option('-s, --set <key=value>', 'Set configuration value')
  .option('-g, --get <key>', 'Get configuration value')
  .option('-l, --list', 'List all configuration')
  .action(async (options) => {
    try {
      const configPath = join(process.cwd(), 'aho-config.json');
      
      if (options.list) {
        if (existsSync(configPath)) {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          console.log(chalk.blue('\\n📋 Current Configuration:'));
          Object.entries(config).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        } else {
          console.log(chalk.yellow('ℹ️  No configuration file found'));
        }
        return;
      }

      if (options.get) {
        if (existsSync(configPath)) {
          const config = JSON.parse(readFileSync(configPath, 'utf-8'));
          console.log(chalk.blue(`📋 Configuration value for ${options.get}:`));
          console.log(config[options.get] || 'Not set');
        } else {
          console.log(chalk.yellow('ℹ️  No configuration file found'));
        }
        return;
      }

      if (options.set) {
        const [key, value] = options.set.split('=');
        if (!key || !value) {
          console.error(chalk.red('❌ Invalid set format. Use: --set key=value'));
          process.exit(1);
        }

        let config: any = {};
        if (existsSync(configPath)) {
          config = JSON.parse(readFileSync(configPath, 'utf-8'));
        }

        config[key] = value;
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk.green(`✅ Configuration updated: ${key} = ${value}`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error during config operation:'), error.message);
      process.exit(1);
    }
  });

// Debug command
program
  .command('debug')
  .description('Debug information and system status')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      const config: Config = {
        outputFormat: 'table',
        verbose: options.verbose || false,
        trackLatency: true,
        analyzePerformance: true,
        autoOptimize: false,
        cacheEnabled: true,
        cacheTTL: 300000,
        agents: {},
        handoffStrategies: ['direct', 'batch', 'cached'],
        optimizationTargets: ['latency', 'throughput', 'reliability']
      };

      const manager = new AgentHandoffManager(config);
      const status = manager.getSystemStatus();

      console.log(chalk.blue('\\n🔧 System Status:'));
      console.log(`  Agents: ${status.agents}`);
      console.log(`  Active Handoffs: ${status.activeHandoffs}`);
      console.log(`  Completed Handoffs: ${status.completedHandoffs}`);
      console.log(`  Dependencies: ${status.dependencies}`);
      console.log(`  Uptime: ${(status.uptime / 1000).toFixed(1)}s`);

      if (options.verbose) {
        console.log(chalk.blue('\\n📊 Detailed Metrics:'));
        const metrics = await manager.getPerformanceMetrics();
        console.log(JSON.stringify(metrics, null, 2));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error during debug:'), error.message);
      process.exit(1);
    }
  });

program.parse();