#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { main: measureBundle } = require('./measure-bundle');

/**
 * Bundle Size Comparison Script
 * Compares current bundle against baseline and applies budgets.
 */

const METRICS_DIR = path.join(__dirname, '..', 'metrics');
const BASELINE_PATH = path.join(METRICS_DIR, 'baseline.json');
const REPORT_PATH = path.join(METRICS_DIR, 'bundle-report.md');

// Budgets (bytes)
const BUDGET_TOTAL_BUILD = 10 * 1024 * 1024; // 10 MB
const BUDGET_STATIC_CHUNKS = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const sign = bytes < 0 ? '-' : '';
  return sign + parseFloat((Math.abs(bytes) / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDelta(current, baseline) {
  const diff = current - baseline;
  const pct = baseline > 0 ? ((diff / baseline) * 100).toFixed(1) : 'N/A';
  const sign = diff > 0 ? '+' : '';
  const emoji = diff > 0 ? '\u{1F534}' : diff < 0 ? '\u{1F7E2}' : '\u{26AA}';
  return `${emoji} ${sign}${formatBytes(diff)} (${sign}${pct}%)`;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
    return data.bundle || null;
  } catch {
    return null;
  }
}

function buildReport(current, baseline) {
  const lines = [];
  const warnings = [];

  lines.push('## Bundle Size Report\n');

  // Budget checks
  if (current.totalBuildSize > BUDGET_TOTAL_BUILD) {
    warnings.push(`Total build size (${formatBytes(current.totalBuildSize)}) exceeds budget of ${formatBytes(BUDGET_TOTAL_BUILD)}`);
  }
  if (current.staticChunks.total > BUDGET_STATIC_CHUNKS) {
    warnings.push(`Static chunks (${formatBytes(current.staticChunks.total)}) exceed budget of ${formatBytes(BUDGET_STATIC_CHUNKS)}`);
  }

  if (warnings.length > 0) {
    lines.push('### \u{26A0}\u{FE0F} Budget Warnings\n');
    warnings.forEach((w) => lines.push(`- ${w}`));
    lines.push('');
  }

  // Summary table
  lines.push('### Summary\n');
  lines.push('| Metric | Current | Baseline | Delta |');
  lines.push('|--------|---------|----------|-------|');

  if (baseline) {
    lines.push(
      `| Total Build | ${formatBytes(current.totalBuildSize)} | ${formatBytes(baseline.totalBuildSize)} | ${formatDelta(current.totalBuildSize, baseline.totalBuildSize)} |`
    );
    lines.push(
      `| Static Chunks | ${formatBytes(current.staticChunks.total)} | ${formatBytes(baseline.staticChunks.total)} | ${formatDelta(current.staticChunks.total, baseline.staticChunks.total)} |`
    );
    lines.push(
      `| Server Pages | ${formatBytes(current.pages.total)} | ${formatBytes(baseline.pages.total)} | ${formatDelta(current.pages.total, baseline.pages.total)} |`
    );
  } else {
    lines.push(`| Total Build | ${formatBytes(current.totalBuildSize)} | — | No baseline |`);
    lines.push(`| Static Chunks | ${formatBytes(current.staticChunks.total)} | — | No baseline |`);
    lines.push(`| Server Pages | ${formatBytes(current.pages.total)} | — | No baseline |`);
  }

  lines.push('');

  // Per-page comparison (top 15)
  if (baseline && baseline.pages && baseline.pages.routes) {
    const baselineMap = {};
    baseline.pages.routes.forEach((p) => {
      baselineMap[p.route] = p.size;
    });

    const pageRows = current.pages.routes.map((p) => {
      const base = baselineMap[p.route];
      return {
        route: p.route,
        current: p.size,
        baseline: base,
        delta: base != null ? p.size - base : null,
      };
    });

    // Sort by absolute delta descending (new pages last)
    pageRows.sort((a, b) => {
      if (a.delta == null && b.delta == null) return b.current - a.current;
      if (a.delta == null) return 1;
      if (b.delta == null) return -1;
      return Math.abs(b.delta) - Math.abs(a.delta);
    });

    lines.push('### Pages (top changes)\n');
    lines.push('| Page | Current | Delta |');
    lines.push('|------|---------|-------|');

    pageRows.slice(0, 15).forEach((row) => {
      const delta =
        row.baseline != null ? formatDelta(row.current, row.baseline) : '\u{1F195} new';
      lines.push(`| \`${row.route}\` | ${formatBytes(row.current)} | ${delta} |`);
    });

    lines.push('');
  }

  lines.push(`\n<sub>Generated at ${new Date().toISOString()}</sub>`);

  return lines.join('\n');
}

function main() {
  console.log('Comparing bundle sizes...\n');

  const current = measureBundle();
  const baseline = loadBaseline();

  if (!baseline) {
    console.log('No baseline found. Run "npm run measure:baseline" on main to create one.\n');
  }

  const report = buildReport(current, baseline);

  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(report);
  console.log(`\nReport saved to ${REPORT_PATH}`);

  return { report, warnings: [] };
}

if (require.main === module) {
  main();
}

module.exports = { main };
