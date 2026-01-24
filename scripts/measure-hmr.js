#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * HMR (Hot Module Replacement) Measurement Script
 * Measures Next.js dev server startup and HMR update times
 *
 * Usage:
 *   node scripts/measure-hmr.js              # Interactive mode with instructions
 *   node scripts/measure-hmr.js --startup    # Measure only dev server startup time
 *   node scripts/measure-hmr.js --save-baseline  # Save results to baseline
 */

const METRICS_DIR = path.join(__dirname, '..', 'metrics');
const PROJECT_DIR = path.join(__dirname, '..');

/**
 * Format duration to human readable
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

/**
 * Measure dev server startup time
 */
function measureStartup() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let resolved = false;

    console.log('🚀 Starting dev server...\n');

    const proc = spawn('npm', ['run', 'dev'], {
      cwd: PROJECT_DIR,
      shell: true,
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill();
        reject(new Error('Timeout: Dev server did not start within 60 seconds'));
      }
    }, 60000);

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);

      // Next.js outputs "Ready in X" when the server is ready
      if (text.includes('Ready in') || text.includes('ready started') || text.includes('Local:')) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          const duration = Date.now() - startTime;

          // Give it a moment to fully initialize, then kill
          setTimeout(() => {
            proc.kill();
            resolve({
              duration,
              durationFormatted: formatDuration(duration),
            });
          }, 1000);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
}

/**
 * Run interactive HMR measurement mode
 */
async function runInteractiveMode(saveBaseline) {
  console.log('⚡ HMR Measurement - Interactive Mode\n');
  console.log('This script helps you measure HMR (Hot Module Replacement) latency.');
  console.log('Since HMR requires user interaction, follow these steps:\n');

  console.log('📋 Instructions:');
  console.log('─'.repeat(50));
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Open the browser DevTools Console');
  console.log('3. Filter console for "hmr" or "Fast Refresh"');
  console.log('4. Make a small change to a component file');
  console.log('5. Note the time shown in the console');
  console.log('6. Repeat 3-5 times and calculate the average\n');

  console.log('📊 What to look for in console:');
  console.log('─'.repeat(50));
  console.log('- "[Fast Refresh] done in XXXms"');
  console.log('- "hmr - compiled client and server in XXXms"\n');

  console.log('🎯 Test files to modify for consistent results:');
  console.log('─'.repeat(50));
  console.log('- src/components/ui/button.tsx (small component)');
  console.log('- src/app/page.tsx (main page)');
  console.log('- src/app/(public)/home/page.tsx (larger component)\n');

  console.log('📝 Recording your measurements:');
  console.log('─'.repeat(50));
  console.log('After measuring, you can manually add HMR data to metrics/baseline.json:\n');

  const sampleData = {
    hmr: {
      timestamp: new Date().toISOString(),
      measurements: [
        { file: 'src/components/ui/button.tsx', duration: '<YOUR_MEASUREMENT>ms' },
        { file: 'src/app/page.tsx', duration: '<YOUR_MEASUREMENT>ms' },
      ],
      average: '<CALCULATED_AVERAGE>ms',
      notes: 'Manual measurement',
    },
  };

  console.log(JSON.stringify(sampleData, null, 2));
  console.log('');

  // Measure startup time as a baseline
  console.log('📏 Measuring dev server startup time as baseline...\n');

  try {
    const startup = await measureStartup();

    console.log(`\n✅ Dev server startup: ${startup.durationFormatted}`);

    if (saveBaseline) {
      if (!fs.existsSync(METRICS_DIR)) {
        fs.mkdirSync(METRICS_DIR, { recursive: true });
      }

      const baselinePath = path.join(METRICS_DIR, 'baseline.json');
      let baseline = {};

      if (fs.existsSync(baselinePath)) {
        baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
      }

      baseline.hmr = {
        timestamp: new Date().toISOString(),
        devServerStartup: {
          duration: startup.duration,
          durationFormatted: startup.durationFormatted,
        },
        measurements: [],
        notes: 'Dev server startup measured. Add manual HMR measurements after testing.',
      };

      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
      console.log(`✅ HMR baseline saved to ${baselinePath}`);
    }

    return { startup };
  } catch (error) {
    console.error('❌ Error measuring startup:', error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const startupOnly = args.includes('--startup');
  const saveBaseline = args.includes('--save-baseline');

  if (startupOnly) {
    console.log('⏱️  Measuring dev server startup time...\n');

    try {
      const result = await measureStartup();
      console.log(`\n✅ Dev server startup: ${result.durationFormatted}`);

      if (saveBaseline) {
        if (!fs.existsSync(METRICS_DIR)) {
          fs.mkdirSync(METRICS_DIR, { recursive: true });
        }

        const baselinePath = path.join(METRICS_DIR, 'baseline.json');
        let baseline = {};

        if (fs.existsSync(baselinePath)) {
          baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
        }

        baseline.hmr = baseline.hmr || {};
        baseline.hmr.devServerStartup = {
          duration: result.duration,
          durationFormatted: result.durationFormatted,
          timestamp: new Date().toISOString(),
        };

        fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
        console.log(`✅ Startup time saved to ${baselinePath}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    return await runInteractiveMode(saveBaseline);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, measureStartup };
