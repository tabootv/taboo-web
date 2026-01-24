/**
 * Barrel to Direct Imports Codemod
 *
 * Transforms barrel file imports to direct module imports.
 *
 * Usage:
 *   npx jscodeshift -t codemods/barrel-to-direct-imports.ts src/ --parser=tsx --extensions=ts,tsx
 *
 * Options (pass via --barrelPath and --exportMap):
 *   --barrelPath: The import path to transform (e.g., "@/api/client")
 *   --exportMapFile: Path to JSON file mapping exports to their source files
 *
 * Example:
 *   npx jscodeshift -t codemods/barrel-to-direct-imports.ts src/ \
 *     --parser=tsx --extensions=ts,tsx \
 *     --barrelPath="@/api/client" \
 *     --exportMapFile="codemods/maps/api-client.json"
 */

import type { Transform, FileInfo, API, Options } from 'jscodeshift';
import * as path from 'path';
import * as fs from 'fs';

interface ExportMap {
  [exportName: string]: string; // exportName -> relative module path
}

const transform: Transform = (fileInfo: FileInfo, api: API, options: Options) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Get options
  const barrelPath: string = options.barrelPath;
  const exportMapFile: string = options.exportMapFile;

  if (!barrelPath) {
    console.warn('No --barrelPath specified, skipping transform');
    return null;
  }

  // Load export map from file if provided
  let exportMap: ExportMap = {};
  if (exportMapFile) {
    try {
      // Resolve path relative to current working directory
      const absolutePath = path.resolve(process.cwd(), exportMapFile);
      const content = fs.readFileSync(absolutePath, 'utf-8');
      exportMap = JSON.parse(content);
    } catch (err) {
      console.warn(`Could not load export map from ${exportMapFile}:`, err);
    }
  }

  // Track if we made any changes
  let hasChanges = false;

  // Find all imports from the barrel path
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const source = path.node.source.value;
      return source === barrelPath;
    })
    .forEach((path) => {
      const specifiers = path.node.specifiers;
      if (!specifiers || specifiers.length === 0) return;

      // Group imports by their target module
      const importsByModule: Map<string, string[]> = new Map();

      specifiers.forEach((spec) => {
        if (spec.type === 'ImportSpecifier') {
          const importedName =
            spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value;
          const localName = spec.local?.name || importedName;

          // Look up the module for this export
          const modulePath = exportMap[importedName];

          if (modulePath) {
            const existing = importsByModule.get(modulePath) || [];
            // Track both imported and local names if they differ
            if (localName !== importedName) {
              existing.push(`${importedName} as ${localName}`);
            } else {
              existing.push(importedName);
            }
            importsByModule.set(modulePath, existing);
          } else {
            // Keep original if no mapping found (fallback to kebab-case guess)
            const guessedModule = `${barrelPath}/${toKebabCase(importedName)}`;
            const existing = importsByModule.get(guessedModule) || [];
            if (localName !== importedName) {
              existing.push(`${importedName} as ${localName}`);
            } else {
              existing.push(importedName);
            }
            importsByModule.set(guessedModule, existing);
          }
        }
      });

      // Create new import declarations
      const newImports: ReturnType<typeof j.importDeclaration>[] = [];

      importsByModule.forEach((imports, modulePath) => {
        const importSpecifiers = imports.map((imp) => {
          if (imp.includes(' as ')) {
            const [imported, local] = imp.split(' as ');
            return j.importSpecifier(j.identifier(imported), j.identifier(local));
          }
          return j.importSpecifier(j.identifier(imp));
        });

        newImports.push(j.importDeclaration(importSpecifiers, j.literal(modulePath)));
      });

      if (newImports.length > 0) {
        // Replace the barrel import with direct imports
        j(path).replaceWith(newImports);
        hasChanges = true;
      }
    });

  if (!hasChanges) {
    return null;
  }

  return root.toSource({ quote: 'single' });
};

/**
 * Convert PascalCase or camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export default transform;
