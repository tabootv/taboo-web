# Component Analysis Reports

This folder contains all reports and analysis from the component complexity analysis performed on January 23, 2026.

## Files

- **`component-analysis.json`** - Machine-readable JSON with all component metrics
- **`component-analysis-report.md`** - Detailed markdown report with all 269 components
- **`component-analysis-manual-review.md`** - Context-specific recommendations for top components
- **`component-refactoring-priority.md`** - Prioritized refactoring plan with timelines
- **`COMPONENT_ANALYSIS_SUMMARY.md`** - Quick reference summary

## Running the Analysis

To re-run the analysis script:

```bash
node scripts/analyze-components.js
```

The script will generate updated reports in this folder.

## Summary

- **Total Components**: 269
- **High Priority**: 26 components
- **Medium Priority**: 16 components
- **Low Priority**: 227 components

See `COMPONENT_ANALYSIS_SUMMARY.md` for a quick overview.
