#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Bundle Size Measurement Script
 * Analyzes Next.js build output to measure bundle sizes
 */

const BUILD_DIR = path.join(__dirname, '..', '.next');
const METRICS_DIR = path.join(__dirname, '..', 'metrics');

/**
 * Parse the Next.js build manifest for bundle information
 */
function parseBuildManifest() {
  const manifestPath = path.join(BUILD_DIR, 'build-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('Build manifest not found. Run "npm run build" first.');
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Parse the Next.js app build manifest
 */
function parseAppBuildManifest() {
  const manifestPath = path.join(BUILD_DIR, 'app-build-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Analyze static chunks
 */
function analyzeStaticChunks() {
  const chunksDir = path.join(BUILD_DIR, 'static', 'chunks');
  const results = {
    total: 0,
    files: [],
  };

  if (!fs.existsSync(chunksDir)) {
    return results;
  }

  function scanDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath, prefix + item + '/');
      } else if (item.endsWith('.js')) {
        const size = stat.size;
        results.total += size;
        results.files.push({
          name: prefix + item,
          size,
          sizeFormatted: formatBytes(size),
        });
      }
    }
  }

  scanDir(chunksDir);

  // Sort by size descending
  results.files.sort((a, b) => b.size - a.size);

  return results;
}

/**
 * Analyze page bundles
 */
function analyzePages() {
  const pagesDir = path.join(BUILD_DIR, 'server', 'app');
  const results = {
    total: 0,
    pages: [],
  };

  if (!fs.existsSync(pagesDir)) {
    return results;
  }

  function scanDir(dir, route = '/') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const newRoute = route === '/' ? '/' + item : route + '/' + item;
        scanDir(fullPath, newRoute);
      } else if (item === 'page.js') {
        const size = stat.size;
        results.total += size;
        results.pages.push({
          route: route,
          size,
          sizeFormatted: formatBytes(size),
        });
      }
    }
  }

  scanDir(pagesDir);

  // Sort by size descending
  results.pages.sort((a, b) => b.size - a.size);

  return results;
}

/**
 * Get total build size
 */
function getTotalBuildSize() {
  let total = 0;

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        total += stat.size;
      }
    }
  }

  scanDir(BUILD_DIR);

  return total;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const saveBaseline = args.includes('--save-baseline');

  console.log('📦 Analyzing bundle sizes...\n');

  if (!fs.existsSync(BUILD_DIR)) {
    console.error('Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const chunks = analyzeStaticChunks();
  const pages = analyzePages();
  const totalBuildSize = getTotalBuildSize();

  const results = {
    timestamp: new Date().toISOString(),
    totalBuildSize,
    totalBuildSizeFormatted: formatBytes(totalBuildSize),
    staticChunks: {
      total: chunks.total,
      totalFormatted: formatBytes(chunks.total),
      count: chunks.files.length,
      largest: chunks.files.slice(0, 10),
    },
    pages: {
      total: pages.total,
      totalFormatted: formatBytes(pages.total),
      count: pages.pages.length,
      routes: pages.pages,
    },
  };

  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('📊 Bundle Size Report');
    console.log('=====================\n');

    console.log(`Total Build Size: ${results.totalBuildSizeFormatted}`);
    console.log(`Static Chunks: ${results.staticChunks.totalFormatted} (${results.staticChunks.count} files)`);
    console.log(`Server Pages: ${results.pages.totalFormatted} (${results.pages.count} pages)\n`);

    console.log('🔝 Top 10 Largest Chunks:');
    results.staticChunks.largest.forEach((chunk, i) => {
      console.log(`   ${i + 1}. ${chunk.name} - ${chunk.sizeFormatted}`);
    });

    console.log('\n📄 Pages by Size:');
    results.pages.routes.slice(0, 15).forEach((page, i) => {
      console.log(`   ${i + 1}. ${page.route} - ${page.sizeFormatted}`);
    });
  }

  if (saveBaseline) {
    if (!fs.existsSync(METRICS_DIR)) {
      fs.mkdirSync(METRICS_DIR, { recursive: true });
    }

    const baselinePath = path.join(METRICS_DIR, 'baseline.json');
    let baseline = {};

    if (fs.existsSync(baselinePath)) {
      baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    }

    baseline.bundle = results;

    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    console.log(`\n✅ Bundle baseline saved to ${baselinePath}`);
  }

  return results;
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, analyzeStaticChunks, analyzePages };
