#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build Time Measurement Script
 * Measures Next.js build time and captures build stats
 */

const METRICS_DIR = path.join(__dirname, '..', 'metrics');
const PROJECT_DIR = path.join(__dirname, '..');

/**
 * Run a command and measure execution time
 */
function runTimed(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    const proc = spawn(command, args, {
      cwd: PROJECT_DIR,
      shell: true,
      ...options,
    });

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      if (!options.silent) {
        process.stdout.write(text);
      }
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      if (!options.silent) {
        process.stderr.write(text);
      }
    });

    proc.on('close', (code) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      resolve({
        code,
        duration,
        durationFormatted: formatDuration(duration),
        stdout,
        stderr,
      });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Format duration to human readable
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(2);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(2);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Parse build output for stats
 */
function parseBuildOutput(stdout) {
  const stats = {
    routeCount: 0,
    staticRoutes: 0,
    dynamicRoutes: 0,
    hasErrors: false,
    hasWarnings: false,
  };

  // Count routes from build output
  const routeMatches = stdout.match(/○|●|ƒ|λ/g);
  if (routeMatches) {
    stats.routeCount = routeMatches.length;
  }

  // Check for static routes (○)
  const staticMatches = stdout.match(/○/g);
  if (staticMatches) {
    stats.staticRoutes = staticMatches.length;
  }

  // Check for dynamic routes (ƒ or λ)
  const dynamicMatches = stdout.match(/ƒ|λ/g);
  if (dynamicMatches) {
    stats.dynamicRoutes = dynamicMatches.length;
  }

  // Check for errors
  stats.hasErrors = stdout.includes('Error') || stdout.includes('error');
  stats.hasWarnings = stdout.includes('Warning') || stdout.includes('warning');

  return stats;
}

/**
 * Clean build artifacts
 */
async function cleanBuild() {
  const nextDir = path.join(PROJECT_DIR, '.next');

  if (fs.existsSync(nextDir)) {
    console.log('🧹 Cleaning .next directory...');
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const cleanFirst = args.includes('--clean');
  const runs = parseInt(args.find((a) => a.startsWith('--runs='))?.split('=')[1] || '1', 10);
  const saveBaseline = args.includes('--save-baseline');
  const silent = args.includes('--silent');

  console.log('⏱️  Build Time Measurement\n');
  console.log(`Runs: ${runs}`);
  console.log(`Clean build: ${cleanFirst}`);
  console.log('');

  const results = [];

  for (let i = 0; i < runs; i++) {
    if (runs > 1) {
      console.log(`\n📦 Run ${i + 1}/${runs}`);
      console.log('─'.repeat(40));
    }

    if (cleanFirst) {
      await cleanBuild();
    }

    console.log('🔨 Running build...\n');

    const buildResult = await runTimed('npm', ['run', 'build'], { silent });

    const buildStats = parseBuildOutput(buildResult.stdout);

    results.push({
      run: i + 1,
      duration: buildResult.duration,
      durationFormatted: buildResult.durationFormatted,
      exitCode: buildResult.code,
      ...buildStats,
    });

    console.log(`\n✅ Build completed in ${buildResult.durationFormatted}`);
  }

  // Calculate statistics
  const durations = results.map((r) => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const summary = {
    timestamp: new Date().toISOString(),
    runs: results.length,
    cleanBuild: cleanFirst,
    average: {
      duration: Math.round(avgDuration),
      durationFormatted: formatDuration(avgDuration),
    },
    min: {
      duration: minDuration,
      durationFormatted: formatDuration(minDuration),
    },
    max: {
      duration: maxDuration,
      durationFormatted: formatDuration(maxDuration),
    },
    results,
  };

  console.log('\n📊 Summary');
  console.log('═'.repeat(40));
  console.log(`Average: ${summary.average.durationFormatted}`);
  console.log(`Min: ${summary.min.durationFormatted}`);
  console.log(`Max: ${summary.max.durationFormatted}`);

  if (saveBaseline) {
    if (!fs.existsSync(METRICS_DIR)) {
      fs.mkdirSync(METRICS_DIR, { recursive: true });
    }

    const baselinePath = path.join(METRICS_DIR, 'baseline.json');
    let baseline = {};

    if (fs.existsSync(baselinePath)) {
      baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    }

    baseline.buildTime = summary;

    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    console.log(`\n✅ Build time baseline saved to ${baselinePath}`);
  }

  return summary;
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
