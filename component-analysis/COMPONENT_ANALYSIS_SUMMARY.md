# Component Analysis Summary

## Overview

Comprehensive analysis of all 269 React components in the TabooTV codebase using component-refactoring skill patterns.

**Analysis Date**: January 23, 2026  
**Total Components Analyzed**: 269  
**High Priority**: 26 components  
**Medium Priority**: 16 components  
**Low Priority**: 227 components

## Analysis Results

### Top 10 Most Complex Components

1. **shaka-player.tsx** - 85/100 (1189 lines, 18 useState, 10 useEffect)
2. **custom-video-player.tsx** - 80/100 (555 lines, 12 useState, 4 useEffect)
3. **content/create/page.tsx** - 75/100 (480 lines, 5 useState, 1 API call)
4. **content/edit/[uuid]/page.tsx** - 75/100 (372 lines, 5 useState, 2 API calls)
5. **short-video-card.tsx** - 75/100 (422 lines, 5 useState, 4 useEffect)
6. **choose-plan-content.tsx** - 70/100 (488 lines, 4 useState, 3 useEffect)
7. **contents/shorts/page.tsx** - 70/100 (251 lines, 5 useState, 2 useEffect)
8. **contents/videos/page.tsx** - 70/100 (253 lines, 5 useState, 2 useEffect)
9. **profile/edit/page.tsx** - 70/100 (445 lines, **17 useState**, 1 useEffect)
10. **videos/[id]/page.tsx** - 70/100 (471 lines, 3 useState, 4 useEffect)

## Generated Reports

1. **`component-analysis.json`** - Machine-readable JSON with all metrics
2. **`component-analysis-report.md`** - Detailed markdown report with all components
3. **`component-analysis-manual-review.md`** - Context-specific recommendations for top components
4. **`component-refactoring-priority.md`** - Prioritized refactoring plan with timelines

## Key Findings

### Common Patterns Identified

1. **Multiple State Hooks** (Pattern 1)
   - 26 components with 5+ useState hooks
   - Most critical: `profile/edit/page.tsx` with 17 useState hooks

2. **Large Components** (Pattern 2)
   - 26 components exceeding 300 lines
   - Largest: `studio/analytics/page.tsx` with 1384 lines

3. **Complex Conditionals** (Pattern 3)
   - Many components with deep nesting (>4 levels)
   - `shaka-player.tsx` has 99 conditionals

4. **API Logic in Components** (Pattern 4)
   - Some components still have direct API calls
   - Should migrate to TanStack Query hooks

5. **Modal Management** (Pattern 5)
   - Few components with multiple modals (good!)

6. **Form Logic** (Pattern 6)
   - Several form-heavy components need extraction

## Refactoring Priority

### 🔴 Tier 1: Critical (Immediate)
1. `shaka-player.tsx` - Core video player
2. `profile/edit/page.tsx` - Too many useState hooks
3. `content/create/page.tsx` - Key creator feature
4. `content/edit/[uuid]/page.tsx` - Can share with create

### 🟡 Tier 2: Important (Next 1-2 months)
5. `custom-video-player.tsx`
6. `videos/[id]/page.tsx`
7. `short-video-card.tsx`
8. `netflix-hover-card.tsx`
9. `GlobalSearchNetflix.tsx`
10. `choose-plan-content.tsx`

### 🟢 Tier 3: Nice to Have (Ongoing)
- Content listing pages
- Other medium-priority components

## Analysis Script

The analysis was performed using `scripts/analyze-components.js`, which:
- Scans all `.tsx` files in `src/`
- Analyzes complexity metrics (lines, hooks, conditionals, nesting)
- Calculates complexity scores (0-100)
- Generates JSON and Markdown reports
- Groups components by refactoring patterns

**To re-run analysis**:
```bash
node scripts/analyze-components.js
```

## Next Steps

1. **Review Reports**: Read the detailed reports for specific recommendations
2. **Start with Tier 1**: Begin refactoring critical components
3. **Follow Patterns**: Use component-refactoring skill patterns as guidance
4. **Test Thoroughly**: Ensure no regressions after each refactoring
5. **Iterate**: Continue with Tier 2 and Tier 3 components

## Success Criteria

After refactoring, components should meet:
- ✅ Complexity Score < 50
- ✅ Line Count < 300
- ✅ useState Hooks < 5 (or grouped in custom hooks)
- ✅ Max Nesting < 4 levels
- ✅ Conditionals < 10 per component

## References

- Component Refactoring Skill: `.claude/skills/component-refactoring/SKILL.md`
- Complexity Patterns: `.claude/skills/component-refactoring/references/complexity-patterns.md`
- Component Splitting: `.claude/skills/component-refactoring/references/component-splitting.md`
- Hook Extraction: `.claude/skills/component-refactoring/references/hook-extraction.md`
