# Agent Handoff Optimizer

A specialized CLI tool for optimizing and debugging agent handoffs in multi-agent systems. This tool helps you track, analyze, and improve the performance of inter-agent communication in complex AI systems.

## Why This Exists

When building multi-agent systems, the handoffs between different agents often become the bottleneck. Tracking these handoffs manually is tedious, and knowing where to optimize requires real data. This tool:

- **Tracks** handoff performance in real-time
- **Analyzes** bottlenecks and identifies patterns  
- **Suggests** concrete optimization strategies
- **Visualizes** the handoff flows and performance metrics
- **Manages** configurations and agent settings

## Features

### 🎯 Core Functionality
- **Real-time tracking** of handoff performance metrics
- **Comprehensive analysis** of latency, throughput, reliability
- **Intelligent optimization** suggestions with implementation guidance
- **Multiple visualization types** (flowchart, heatmap, dashboard, network diagram, timeline, treemap)
- **Agent management** with dependency tracking

### 📊 Performance Metrics
- **Latency** - Average, min, max, and percentiles
- **Throughput** - Requests per second with capacity analysis
- **Reliability** - Success rates, error rates, failure patterns
- **Resource Usage** - Memory, CPU, and network utilization
- **Bottleneck Detection** - Identifies performance hotspots

### 🔧 Built-in Optimizations
- **Latency Optimization** - Caching strategies, connection pooling, algorithm optimization
- **Throughput Enhancement** - Batch processing, parallel execution, load balancing
- **Reliability Improvements** - Retry mechanisms, circuit breakers, graceful degradation
- **Cost Optimization** - Resource scaling, right-sizing allocations

## Quick Start

### Installation
```bash
npm install -g agent-handoff-optimizer
```

### Basic Usage
```bash
# Start tracking handoff performance
aho track --duration 60 --agents agent1,agent2,agent3

# Analyze performance data
aho analyze --target latency --threshold 500

# Generate optimization suggestions
aho optimize --strategy batch --target throughput

# Create visualizations
aho visualize --type flowchart --output ./handoffs.png
```

## CLI Commands

### Track Handoffs
```bash
aho track [options]
```
Options:
- `--duration` - Duration in seconds to track (default: 30)
- `--agents` - Specific agents to track (comma-separated)
- `--config` - Path to configuration file
- `--output` - Output file for metrics

### Analyze Performance
```bash
aho analyze [options]
```
Options:
- `--target` - Target metric: latency, throughput, reliability, cost
- `--threshold` - Performance threshold for alerts
- `--historical` - Include historical data for comparison
- `--format` - Output format: table, json, csv

### Generate Optimizations
```bash
aho optimize [options]
```
Options:
- `--strategy` - Optimization strategy: direct, batch, cached, streaming
- `--target` - Target improvement area: latency, throughput, reliability, cost
- `--constraints` - Resource constraints (JSON format)
- `--priority` - High/Medium/Low priority

### Visualize Handoffs
```bash
aho visualize [options]
```
Options:
- `--type` - Visualization type: flowchart, heatmap, dashboard, network, timeline, treemap
- `--output` - Output file path
- `--theme` - Color theme: light, dark, auto
- `--scale` - Scale factor for visualization

### Configuration Management
```bash
aho config [options]
```
Options:
- `--init` - Initialize default configuration
- `--add` - Add new agent configuration
- `--list` - List all configurations
- `--validate` - Validate configuration

### Debug Information
```bash
aho debug [options]
```
Options:
- `--verbose` - Detailed debugging output
- `--health` - System health check
- `--metrics` - Current performance metrics
- `--connections` - Active connection status

## Configuration

Create a configuration file (`aho.config.json`):

```json
{
  "agents": {
    "data-collector": {
      "type": "data",
      "capabilities": ["collection", "processing"],
      "handoffStrategy": "direct",
      "timeout": 5000,
      "retryAttempts": 3
    },
    "analysis-engine": {
      "type": "analysis", 
      "capabilities": ["pattern-recognition", "optimization"],
      "handoffStrategy": "batch",
      "timeout": 10000,
      "batchSize": 100
    },
    "decision-maker": {
      "type": "decision",
      "capabilities": ["reasoning", "planning"],
      "handoffStrategy": "cached",
      "timeout": 8000,
      "cacheTTL": 30000
    }
  },
  "system": {
    "trackingInterval": 1000,
    "metricsRetention": 86400000,
    "optimizationInterval": 300000,
    "visualizationPort": 3000
  }
}
```

## Real-World Examples

### Optimizing a Data Pipeline
```bash
# Track data pipeline handoffs
aho track --duration 300 --agents collector,processor,analyzer,storage

# Analyze for latency issues
aho analyze --target latency --threshold 1000

# Optimize with batch processing
aho optimize --strategy batch --target throughput

# Visualize the flow
aho visualize --type flowchart --output ./pipeline-flow.png
```

### Debugging Multi-Agent Chatbot
```bash
# Track agent interactions in chatbot
aho track --duration 120 --agents intent-classifier,response-generator,entity-extractor

# Check reliability issues  
aho analyze --target reliability --threshold 0.95

# Fix with retry mechanisms
aho optimize --strategy cached --target reliability

# Create network diagram
aho visualize --type network --output ./agent-network.png
```

## Development

### Prerequisites
- Node.js >= 16.0.0
- TypeScript >= 5.0.0
- npm or yarn

### Setup
```bash
git clone https://github.com/sulthonzh/agent-handoff-optimizer.git
cd agent-handoff-optimizer
npm install
npm run build
```

### Testing
```bash
npm test              # Run test suite
npm run test:coverage # Run with coverage
npm run lint          # Check code style
npm run lint:fix      # Fix linting issues
```

### Building
```bash
npm run build          # Production build
npm run dev            # Development watch mode
```

## Architecture

The tool is built with a modular architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Interface │    │   Core Engine   │    │  Visualization  │
│                 │    │                 │    │                 │
│ • Commands      │────│ • Tracker       │────│ • Flowcharts    │
│ • Parser        │    │ • Optimizer     │    │ • Heatmaps      │
│ • Output        │    │ • Analyzer      │    │ • Dashboards    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Configuration   │    │ Metrics         │    │ Types & Events  │
│                 │    │                 │    │                 │
│ • Agents        │    │ • Performance   │    │ • Interfaces    │
│ • Settings      │    │ • History       │    │ • Events        │
│ • Validation     │    │ • Aggregation   │    │ • Enums         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests:
- [GitHub Issues](https://github.com/sulthonzh/agent-handoff-optimizer/issues)
- [Documentation](https://github.com/sulthonzh/agent-handoff-optimizer/wiki)