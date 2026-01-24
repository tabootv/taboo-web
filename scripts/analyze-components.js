#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Component Complexity Analysis Script
 * Analyzes all .tsx files in src/ for refactoring opportunities
 */

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUTPUT_DIR = path.join(__dirname, '..', 'component-analysis');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'component-analysis.json');
const OUTPUT_MD = path.join(OUTPUT_DIR, 'component-analysis-report.md');

/**
 * Find all .tsx files recursively
 */
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Count occurrences of a pattern in code
 */
function countPattern(code, pattern) {
  const matches = code.match(new RegExp(pattern, 'g'));
  return matches ? matches.length : 0;
}

/**
 * Calculate nesting depth of a code block
 */
function calculateMaxNesting(code) {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (code[i] === '}') {
      currentDepth--;
    }
  }
  
  return maxDepth;
}

/**
 * Analyze a single component file
 */
function analyzeComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  
  // Count hooks
  const useStateCount = countPattern(content, /useState\s*\(/g);
  const useEffectCount = countPattern(content, /useEffect\s*\(/g);
  const useCallbackCount = countPattern(content, /useCallback\s*\(/g);
  const useMemoCount = countPattern(content, /useMemo\s*\(/g);
  const totalHooks = useStateCount + useEffectCount + useCallbackCount + useMemoCount;
  
  // Count conditionals
  const ifCount = countPattern(content, /\bif\s*\(/g);
  const switchCount = countPattern(content, /\bswitch\s*\(/g);
  const ternaryCount = countPattern(content, /\?[^:]*:/g);
  const conditionalCount = ifCount + switchCount + ternaryCount;
  
  // Count API calls
  const fetchCount = countPattern(content, /\.fetch\s*\(/g);
  const axiosCount = countPattern(content, /axios\.(get|post|put|delete|patch)\s*\(/g);
  const apiClientCount = countPattern(content, /Client\.(get|post|put|delete|patch)\s*\(/g);
  const directApiCalls = fetchCount + axiosCount + apiClientCount;
  
  // Count modal states (common patterns)
  const modalStateCount = countPattern(content, /(show|isOpen|isVisible|isModal).*(Modal|Dialog)/gi);
  const setModalCount = countPattern(content, /set(Show|IsOpen|IsVisible|IsModal).*(Modal|Dialog)/gi);
  const modalCount = Math.max(modalStateCount, setModalCount);
  
  // Count form fields (input, textarea, select elements)
  const inputCount = countPattern(content, /<(input|textarea|select)\b/gi);
  
  // Calculate nesting depth
  const maxNesting = calculateMaxNesting(content);
  
  // Check for patterns
  const hasMultipleStates = useStateCount >= 5;
  const hasComplexConditionals = conditionalCount > 10 || maxNesting > 4;
  const hasApiLogic = directApiCalls > 0;
  const hasMultipleModals = modalCount >= 3;
  const hasFormLogic = inputCount >= 5;
  const isLarge = lineCount > 300;
  
  // Calculate complexity score (0-100)
  // Based on component-refactoring skill thresholds
  let complexityScore = 0;
  
  // Line count contribution (max 30 points)
  if (lineCount > 300) complexityScore += 30;
  else if (lineCount > 200) complexityScore += 20;
  else if (lineCount > 150) complexityScore += 10;
  
  // State management contribution (max 20 points)
  if (useStateCount >= 8) complexityScore += 20;
  else if (useStateCount >= 5) complexityScore += 15;
  else if (useStateCount >= 3) complexityScore += 10;
  
  // Conditional complexity (max 20 points)
  if (conditionalCount > 15 || maxNesting > 5) complexityScore += 20;
  else if (conditionalCount > 10 || maxNesting > 4) complexityScore += 15;
  else if (conditionalCount > 5) complexityScore += 10;
  
  // Effects complexity (max 15 points)
  if (useEffectCount >= 5) complexityScore += 15;
  else if (useEffectCount >= 3) complexityScore += 10;
  else if (useEffectCount >= 2) complexityScore += 5;
  
  // API logic in component (max 10 points)
  if (hasApiLogic) complexityScore += 10;
  
  // Modal management (max 5 points)
  if (hasMultipleModals) complexityScore += 5;
  
  complexityScore = Math.min(100, complexityScore);
  
  // Determine priority
  let priority = 'Low';
  if (complexityScore >= 70 || (isLarge && complexityScore >= 50)) {
    priority = 'High';
  } else if (complexityScore >= 50 || isLarge) {
    priority = 'Medium';
  }
  
  // Generate recommendations
  const recommendations = [];
  if (hasMultipleStates) {
    recommendations.push('Extract custom hooks (Pattern 1)');
  }
  if (isLarge) {
    recommendations.push('Split into sub-components (Pattern 2)');
  }
  if (hasComplexConditionals) {
    recommendations.push('Simplify conditional logic (Pattern 3)');
  }
  if (hasApiLogic) {
    recommendations.push('Extract API/data logic to hooks (Pattern 4)');
  }
  if (hasMultipleModals) {
    recommendations.push('Extract modal management (Pattern 5)');
  }
  if (hasFormLogic) {
    recommendations.push('Extract form logic (Pattern 6)');
  }
  
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  return {
    path: relativePath,
    absolutePath: filePath,
    lineCount,
    hooks: {
      useState: useStateCount,
      useEffect: useEffectCount,
      useCallback: useCallbackCount,
      useMemo: useMemoCount,
      total: totalHooks,
    },
    conditionals: {
      if: ifCount,
      switch: switchCount,
      ternary: ternaryCount,
      total: conditionalCount,
    },
    maxNesting,
    apiCalls: directApiCalls,
    modals: modalCount,
    formFields: inputCount,
    complexityScore,
    priority,
    recommendations,
    patterns: {
      hasMultipleStates,
      isLarge,
      hasComplexConditionals,
      hasApiLogic,
      hasMultipleModals,
      hasFormLogic,
    },
  };
}

/**
 * Main analysis function
 */
function main() {
  console.log('🔍 Starting component analysis...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const files = findTsxFiles(SRC_DIR);
  console.log(`Found ${files.length} .tsx files\n`);
  
  const results = files.map(file => {
    try {
      return analyzeComponent(file);
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error.message);
      return null;
    }
  }).filter(Boolean);
  
  // Sort by complexity score (descending)
  results.sort((a, b) => b.complexityScore - a.complexityScore);
  
  // Save JSON report
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
  console.log(`✅ JSON report saved to ${OUTPUT_JSON}`);
  
  // Generate markdown report
  generateMarkdownReport(results);
  console.log(`✅ Markdown report saved to ${OUTPUT_MD}`);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Total components: ${results.length}`);
  console.log(`   High priority: ${results.filter(r => r.priority === 'High').length}`);
  console.log(`   Medium priority: ${results.filter(r => r.priority === 'Medium').length}`);
  console.log(`   Low priority: ${results.filter(r => r.priority === 'Low').length}`);
  console.log(`\n   Top 10 most complex:`);
  results.slice(0, 10).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.path} (Score: ${r.complexityScore}, Lines: ${r.lineCount})`);
  });
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
  const highPriority = results.filter(r => r.priority === 'High');
  const mediumPriority = results.filter(r => r.priority === 'Medium');
  const lowPriority = results.filter(r => r.priority === 'Low');
  
  let markdown = `# Component Complexity Analysis Report\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Components**: ${results.length}\n`;
  markdown += `- **High Priority**: ${highPriority.length}\n`;
  markdown += `- **Medium Priority**: ${mediumPriority.length}\n`;
  markdown += `- **Low Priority**: ${lowPriority.length}\n\n`;
  
  // High Priority Components
  markdown += `## 🔴 High Priority Components\n\n`;
  if (highPriority.length === 0) {
    markdown += `No high priority components found.\n\n`;
  } else {
    highPriority.forEach((comp, i) => {
      markdown += `### ${i + 1}. ${comp.path}\n\n`;
      markdown += `- **Complexity Score**: ${comp.complexityScore}/100\n`;
      markdown += `- **Lines**: ${comp.lineCount}\n`;
      markdown += `- **useState Hooks**: ${comp.hooks.useState}\n`;
      markdown += `- **useEffect Hooks**: ${comp.hooks.useEffect}\n`;
      markdown += `- **Conditionals**: ${comp.conditionals.total}\n`;
      markdown += `- **Max Nesting**: ${comp.maxNesting}\n`;
      markdown += `- **API Calls**: ${comp.apiCalls}\n`;
      markdown += `- **Modals**: ${comp.modals}\n`;
      markdown += `\n**Recommendations**:\n`;
      comp.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
      markdown += `\n`;
    });
  }
  
  // Medium Priority Components
  markdown += `## 🟡 Medium Priority Components\n\n`;
  if (mediumPriority.length === 0) {
    markdown += `No medium priority components found.\n\n`;
  } else {
    mediumPriority.slice(0, 30).forEach((comp, i) => {
      markdown += `### ${i + 1}. ${comp.path}\n\n`;
      markdown += `- **Complexity Score**: ${comp.complexityScore}/100\n`;
      markdown += `- **Lines**: ${comp.lineCount}\n`;
      markdown += `- **Recommendations**: ${comp.recommendations.join(', ')}\n\n`;
    });
  }
  
  // Group by Pattern
  markdown += `## 📋 Components by Refactoring Pattern\n\n`;
  
  const byPattern = {
    'Pattern 1: Extract Custom Hooks': results.filter(r => r.patterns.hasMultipleStates),
    'Pattern 2: Extract Sub-Components': results.filter(r => r.patterns.isLarge),
    'Pattern 3: Simplify Conditional Logic': results.filter(r => r.patterns.hasComplexConditionals),
    'Pattern 4: Extract API/Data Logic': results.filter(r => r.patterns.hasApiLogic),
    'Pattern 5: Extract Modal Management': results.filter(r => r.patterns.hasMultipleModals),
    'Pattern 6: Extract Form Logic': results.filter(r => r.patterns.hasFormLogic),
  };
  
  Object.entries(byPattern).forEach(([pattern, comps]) => {
    if (comps.length > 0) {
      markdown += `### ${pattern}\n\n`;
      comps.slice(0, 20).forEach(comp => {
        markdown += `- **${comp.path}** (Score: ${comp.complexityScore}, Lines: ${comp.lineCount})\n`;
      });
      markdown += `\n`;
    }
  });
  
  // All Components (sorted)
  markdown += `## 📊 All Components (Sorted by Complexity)\n\n`;
  markdown += `| Path | Score | Lines | useState | useEffect | Conditionals | Priority |\n`;
  markdown += `|------|-------|-------|----------|-----------|--------------|----------|\n`;
  
  results.forEach(comp => {
    markdown += `| ${comp.path} | ${comp.complexityScore} | ${comp.lineCount} | ${comp.hooks.useState} | ${comp.hooks.useEffect} | ${comp.conditionals.total} | ${comp.priority} |\n`;
  });
  
  fs.writeFileSync(OUTPUT_MD, markdown);
}

// Run analysis
main();
