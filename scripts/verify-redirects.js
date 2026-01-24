#!/usr/bin/env node

/**
 * Redirect Verification Script
 *
 * Validates the redirect configuration in next.config.ts:
 * - Parses redirect rules from the config
 * - Detects redirect loops
 * - Ensures redirect chains are max 1 hop
 * - Tests redirects against a running server (optional)
 *
 * Usage:
 *   node scripts/verify-redirects.js              # Static analysis only
 *   node scripts/verify-redirects.js --test-live  # Test against running server
 *   node scripts/verify-redirects.js --base-url http://localhost:3000
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const testLive = args.includes('--test-live');
const baseUrlIndex = args.indexOf('--base-url');
const baseUrl =
  baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'http://localhost:3000';

/**
 * Extract redirect configuration from next.config.ts
 * This is a simple regex-based parser for the redirect array
 */
function parseRedirectsFromConfig() {
  const configPath = path.join(__dirname, '..', 'next.config.ts');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  // Extract the routeRedirects array
  const redirectsMatch = configContent.match(
    /const routeRedirects:\s*Redirect\[\]\s*=\s*\[([\s\S]*?)\];/
  );

  if (!redirectsMatch) {
    console.error('❌ Could not find routeRedirects array in next.config.ts');
    process.exit(1);
  }

  const redirectsContent = redirectsMatch[1];

  // Remove single-line comments to avoid parsing commented-out redirects
  const contentWithoutComments = redirectsContent.replace(/\/\/.*$/gm, '');

  // Parse individual redirect objects
  const redirects = [];
  const objectRegex =
    /\{\s*source:\s*['"]([^'"]+)['"]\s*,\s*destination:\s*['"]([^'"]+)['"]\s*,\s*permanent:\s*(true|false)\s*,?\s*\}/g;

  let match;
  while ((match = objectRegex.exec(contentWithoutComments)) !== null) {
    redirects.push({
      source: match[1],
      destination: match[2],
      permanent: match[3] === 'true',
    });
  }

  return redirects;
}

/**
 * Normalize a route pattern for comparison
 * Converts dynamic segments like :param to a placeholder
 */
function normalizeRoute(route) {
  return route.replace(/:[^/]+/g, ':param').replace(/\*/g, '*');
}

/**
 * Check if two routes match (considering dynamic segments)
 */
function routesMatch(route1, route2) {
  const norm1 = normalizeRoute(route1);
  const norm2 = normalizeRoute(route2);
  return norm1 === norm2;
}

/**
 * Detect redirect loops
 * A loop exists if following redirects eventually leads back to the start
 */
function detectLoops(redirects) {
  const loops = [];

  for (const redirect of redirects) {
    const visited = new Set([normalizeRoute(redirect.source)]);
    let current = redirect.destination;
    const chain = [redirect.source];

    while (current) {
      const normalized = normalizeRoute(current);

      if (visited.has(normalized)) {
        loops.push({
          redirect,
          chain: [...chain, current],
          message: `Loop detected: ${chain.join(' → ')} → ${current}`,
        });
        break;
      }

      visited.add(normalized);
      chain.push(current);

      // Find if there's a redirect from the current destination
      const nextRedirect = redirects.find((r) =>
        routesMatch(r.source, current)
      );

      if (nextRedirect) {
        current = nextRedirect.destination;
      } else {
        break;
      }
    }
  }

  return loops;
}

/**
 * Detect redirect chains longer than 1 hop
 */
function detectChains(redirects) {
  const chains = [];

  for (const redirect of redirects) {
    let current = redirect.destination;
    let hops = 0;
    const chain = [redirect.source, current];

    while (current) {
      const nextRedirect = redirects.find((r) =>
        routesMatch(r.source, current)
      );

      if (nextRedirect) {
        hops++;
        current = nextRedirect.destination;
        chain.push(current);
      } else {
        break;
      }
    }

    if (hops > 0) {
      chains.push({
        redirect,
        hops,
        chain,
        message: `Chain of ${hops + 1} hops: ${chain.join(' → ')}`,
      });
    }
  }

  return chains;
}

/**
 * Validate all redirects use permanent (301)
 */
function validatePermanent(redirects) {
  const nonPermanent = redirects.filter((r) => !r.permanent);
  return nonPermanent.map((r) => ({
    redirect: r,
    message: `Non-permanent redirect: ${r.source} → ${r.destination} (should use permanent: true for SEO)`,
  }));
}

/**
 * Test redirects against a live server
 */
async function testLiveRedirects(redirects, baseUrl) {
  const results = [];

  for (const redirect of redirects) {
    // Convert pattern to a testable URL (replace :param with 'test')
    const testPath = redirect.source
      .replace(/:([^/]+)/g, 'test-$1')
      .replace(/\*/g, 'test-path');

    const url = `${baseUrl}${testPath}`;

    try {
      const response = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': 'RedirectVerifier/1.0' },
      });

      const location = response.headers.get('location');
      const statusCode = response.status;

      results.push({
        redirect,
        url,
        statusCode,
        location,
        success: statusCode === 301 || statusCode === 308,
        message:
          statusCode === 301 || statusCode === 308
            ? `✓ ${redirect.source} → ${statusCode} → ${location}`
            : `✗ ${redirect.source} returned ${statusCode} (expected 301)`,
      });
    } catch (error) {
      results.push({
        redirect,
        url,
        statusCode: null,
        location: null,
        success: false,
        message: `✗ ${redirect.source} - Error: ${error.message}`,
      });
    }
  }

  return results;
}

/**
 * Main validation function
 */
async function main() {
  console.log('🔍 Redirect Verification Script\n');
  console.log('='.repeat(50));

  // Parse redirects
  console.log('\n📋 Parsing redirect configuration...');
  const redirects = parseRedirectsFromConfig();
  console.log(`   Found ${redirects.length} redirect(s)\n`);

  if (redirects.length === 0) {
    console.log('ℹ️  No active redirects configured.');
    console.log('   Commented redirects are excluded from validation.\n');
    process.exit(0);
  }

  // Display parsed redirects
  console.log('📝 Configured Redirects:');
  redirects.forEach((r, i) => {
    console.log(
      `   ${i + 1}. ${r.source} → ${r.destination} (${r.permanent ? '301' : '302'})`
    );
  });
  console.log();

  let hasErrors = false;

  // Check for non-permanent redirects
  console.log('🔒 Checking for permanent (301) redirects...');
  const nonPermanent = validatePermanent(redirects);
  if (nonPermanent.length > 0) {
    console.log('   ⚠️  Warnings:');
    nonPermanent.forEach((w) => console.log(`      ${w.message}`));
    hasErrors = true;
  } else {
    console.log('   ✅ All redirects are permanent (301)');
  }
  console.log();

  // Check for loops
  console.log('🔄 Checking for redirect loops...');
  const loops = detectLoops(redirects);
  if (loops.length > 0) {
    console.log('   ❌ Loops detected:');
    loops.forEach((l) => console.log(`      ${l.message}`));
    hasErrors = true;
  } else {
    console.log('   ✅ No redirect loops detected');
  }
  console.log();

  // Check for chains
  console.log('⛓️  Checking for redirect chains...');
  const chains = detectChains(redirects);
  if (chains.length > 0) {
    console.log('   ⚠️  Chains detected (should be max 1 hop):');
    chains.forEach((c) => console.log(`      ${c.message}`));
    hasErrors = true;
  } else {
    console.log('   ✅ No redirect chains detected (max 1 hop)');
  }
  console.log();

  // Live testing (optional)
  if (testLive) {
    console.log(`🌐 Testing redirects against ${baseUrl}...`);
    const liveResults = await testLiveRedirects(redirects, baseUrl);

    const successes = liveResults.filter((r) => r.success);
    const failures = liveResults.filter((r) => !r.success);

    liveResults.forEach((r) => console.log(`   ${r.message}`));
    console.log();

    if (failures.length > 0) {
      console.log(
        `   ❌ ${failures.length}/${liveResults.length} redirects failed`
      );
      hasErrors = true;
    } else {
      console.log(
        `   ✅ ${successes.length}/${liveResults.length} redirects working`
      );
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(50));
  if (hasErrors) {
    console.log('❌ Validation completed with warnings/errors');
    process.exit(1);
  } else {
    console.log('✅ All redirect validations passed!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
