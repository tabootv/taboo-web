#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Local CI Simulation ===${NC}"
echo "This script mirrors GitHub Actions CI exactly."
echo ""

# Change to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Function to run a step
run_step() {
    local step_name="$1"
    local command="$2"

    echo -e "${YELLOW}>>> $step_name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}[PASS] $step_name${NC}"
        echo ""
    else
        echo -e "${RED}[FAIL] $step_name${NC}"
        exit 1
    fi
}

# Clean up caches to simulate fresh CI environment
echo -e "${YELLOW}=== Cleaning caches ===${NC}"
rm -f tsconfig.tsbuildinfo
rm -rf .next

# Option: Clean node_modules for true parity (slow but accurate)
if [[ "${CLEAN_MODULES:-false}" == "true" ]]; then
    echo "Removing node_modules for clean install..."
    rm -rf node_modules
fi

# Step 1: Install dependencies (like npm ci)
run_step "Install dependencies" "npm ci"

# Step 2: Lint (matches CI)
run_step "ESLint" "npm run lint"

# Step 3: Type check (matches CI)
run_step "TypeScript type-check" "npm run type-check"

# Step 4: Format check (matches CI)
run_step "Prettier format check" "npm run format:check"

# Step 5: Build (matches CI)
run_step "Next.js build" "npm run build"

echo -e "${GREEN}=== All CI checks passed! ===${NC}"
