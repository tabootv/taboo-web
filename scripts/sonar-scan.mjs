#!/usr/bin/env node

/**
 * SonarJS Scanner Script
 *
 * Runs ESLint with SonarJS rules and outputs JSON report to scratchpad.
 *
 * Usage:
 *   node scripts/sonar-scan.mjs [target]
 *
 * Examples:
 *   node scripts/sonar-scan.mjs                    # Scan src/
 *   node scripts/sonar-scan.mjs src/components/    # Scan specific directory
 *   node scripts/sonar-scan.mjs src/hooks/use-*.ts # Scan with glob pattern
 *   node scripts/sonar-scan.mjs --staged           # Scan staged files only
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const isStaged = args.includes('--staged');
const target = args.find((arg) => !arg.startsWith('--')) || 'src/';

// Scratchpad directory for output (session-isolated, outside git)
const scratchpadDir =
  process.env.SONAR_OUTPUT_DIR ||
  '/private/tmp/claude/-Users-igaosoza-workspace-www-tabootv-taboo-web/scratchpad';

// Ensure scratchpad directory exists
if (!existsSync(scratchpadDir)) {
  mkdirSync(scratchpadDir, { recursive: true });
}

const reportPath = resolve(scratchpadDir, 'sonar-report.json');
const summaryPath = resolve(scratchpadDir, 'sonar-summary.md');

/**
 * Get list of staged TypeScript/JavaScript files
 */
function getStagedFiles() {
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      cwd: projectRoot,
      encoding: 'utf-8',
    });
    return result
      .split('\n')
      .filter((f) => f.match(/\.(ts|tsx|js|jsx)$/) && !f.includes('node_modules'))
      .map((f) => resolve(projectRoot, f));
  } catch {
    return [];
  }
}

/**
 * Run ESLint with SonarJS config
 */
function runScan(files) {
  const eslintArgs = [
    'eslint',
    '--config',
    'eslint.sonar.config.mjs',
    '--format',
    'json',
    '--no-error-on-unmatched-pattern',
    ...files,
  ];

  const result = spawnSync('npx', eslintArgs, {
    cwd: projectRoot,
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs
  });

  // ESLint returns exit code 1 when there are linting errors
  // We still want the JSON output in that case
  return result.stdout || '[]';
}

/**
 * Parse ESLint JSON output and generate summary
 */
function generateSummary(jsonOutput) {
  let results;
  try {
    results = JSON.parse(jsonOutput);
  } catch {
    return {
      totalFiles: 0,
      totalErrors: 0,
      totalWarnings: 0,
      byRule: {},
      byFile: [],
      summary: 'Failed to parse ESLint output',
    };
  }

  const byRule = {};
  const byFile = [];

  for (const file of results) {
    if (file.messages.length === 0) continue;

    const fileEntry = {
      path: file.filePath.replace(projectRoot + '/', ''),
      errors: file.errorCount,
      warnings: file.warningCount,
      messages: [],
    };

    for (const msg of file.messages) {
      const ruleId = msg.ruleId || 'unknown';

      // Track by rule
      if (!byRule[ruleId]) {
        byRule[ruleId] = { count: 0, files: new Set() };
      }
      byRule[ruleId].count++;
      byRule[ruleId].files.add(fileEntry.path);

      // Track by file
      fileEntry.messages.push({
        rule: ruleId,
        severity: msg.severity === 2 ? 'error' : 'warning',
        message: msg.message,
        line: msg.line,
        column: msg.column,
        fixable: !!msg.fix,
      });
    }

    byFile.push(fileEntry);
  }

  // Convert Sets to arrays for JSON serialization
  const byRuleSerialized = {};
  for (const [rule, data] of Object.entries(byRule)) {
    byRuleSerialized[rule] = {
      count: data.count,
      files: Array.from(data.files),
    };
  }

  const totalErrors = byFile.reduce((sum, f) => sum + f.errors, 0);
  const totalWarnings = byFile.reduce((sum, f) => sum + f.warnings, 0);

  return {
    totalFiles: byFile.length,
    totalErrors,
    totalWarnings,
    byRule: byRuleSerialized,
    byFile,
    summary: `Found ${totalErrors} errors and ${totalWarnings} warnings in ${byFile.length} files`,
  };
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(summary) {
  const lines = ['# SonarJS Scan Report', ''];
  lines.push(`**Summary:** ${summary.summary}`);
  lines.push('');

  if (Object.keys(summary.byRule).length === 0) {
    lines.push('No issues found.');
    return lines.join('\n');
  }

  // Priority rules (show these first)
  const priorityRules = ['sonarjs/cognitive-complexity', 'sonarjs/prefer-optional-chain'];

  lines.push('## Issues by Rule');
  lines.push('');

  // Sort rules: priority first, then by count
  const sortedRules = Object.entries(summary.byRule).sort((a, b) => {
    const aPriority = priorityRules.indexOf(a[0]);
    const bPriority = priorityRules.indexOf(b[0]);
    if (aPriority !== -1 && bPriority === -1) return -1;
    if (bPriority !== -1 && aPriority === -1) return 1;
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    return b[1].count - a[1].count;
  });

  for (const [rule, data] of sortedRules) {
    const isPriority = priorityRules.includes(rule) ? ' ⚠️' : '';
    lines.push(`### \`${rule}\`${isPriority} (${data.count} occurrences)`);
    lines.push('');
    lines.push('Files:');
    for (const file of data.files.slice(0, 10)) {
      lines.push(`- ${file}`);
    }
    if (data.files.length > 10) {
      lines.push(`- ... and ${data.files.length - 10} more`);
    }
    lines.push('');
  }

  lines.push('## Files with Issues');
  lines.push('');

  // Sort files by error count
  const sortedFiles = [...summary.byFile].sort((a, b) => b.errors - a.errors);

  for (const file of sortedFiles.slice(0, 20)) {
    lines.push(`### ${file.path}`);
    lines.push(`Errors: ${file.errors}, Warnings: ${file.warnings}`);
    lines.push('');

    for (const msg of file.messages.slice(0, 10)) {
      const icon = msg.severity === 'error' ? '❌' : '⚠️';
      const fixIcon = msg.fixable ? ' 🔧' : '';
      lines.push(`- ${icon} Line ${msg.line}: \`${msg.rule}\`${fixIcon}`);
      lines.push(`  ${msg.message}`);
    }

    if (file.messages.length > 10) {
      lines.push(`- ... and ${file.messages.length - 10} more issues`);
    }
    lines.push('');
  }

  if (sortedFiles.length > 20) {
    lines.push(`... and ${sortedFiles.length - 20} more files with issues`);
  }

  return lines.join('\n');
}

// Main execution
console.log('🔍 SonarJS Scanner');
console.log('==================');

let filesToScan;
if (isStaged) {
  filesToScan = getStagedFiles();
  console.log(`Scanning ${filesToScan.length} staged files...`);
  if (filesToScan.length === 0) {
    console.log('No staged TypeScript/JavaScript files to scan.');
    process.exit(0);
  }
} else {
  filesToScan = [resolve(projectRoot, target)];
  console.log(`Scanning: ${target}`);
}

console.log('');

const jsonOutput = runScan(filesToScan);
const summary = generateSummary(jsonOutput);
const markdown = generateMarkdownSummary(summary);

// Write outputs
writeFileSync(reportPath, jsonOutput);
writeFileSync(summaryPath, markdown);

// Console output
console.log(summary.summary);
console.log('');
console.log(`📄 Full JSON report: ${reportPath}`);
console.log(`📋 Summary report: ${summaryPath}`);
console.log('');

if (summary.totalErrors > 0 || summary.totalWarnings > 0) {
  console.log('Top issues:');
  const topRules = Object.entries(summary.byRule)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  for (const [rule, data] of topRules) {
    console.log(`  - ${rule}: ${data.count} occurrences`);
  }
}

// Exit with error if there are errors (for CI integration)
process.exit(summary.totalErrors > 0 ? 1 : 0);
