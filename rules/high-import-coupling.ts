/**
 * @fileoverview Rule to detect files with too many imports (high coupling)
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { HighImportCouplingOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { isTypeOnlyImport } from '../utils/node-helpers.js';

const DEFAULT_MAX_IMPORTS = 10;

const rule: Rule.RuleModule = {
  meta: createRuleMeta('high-import-coupling', {
    description: 'Detect files that import from too many modules, indicating high coupling',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    schema: [
      {
        type: 'object',
        properties: {
          maxImports: {
            type: 'number',
            default: DEFAULT_MAX_IMPORTS,
            minimum: 1
          },
          ignoreTypeImports: {
            type: 'boolean',
            default: true
          },
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
            default: []
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooManyImports: `File has high import coupling: {{importCount}} module imports (max: {{maxImports}}).

Imported modules:
{{importList}}

Refactoring suggestions:
1. Split this file into smaller, focused modules
2. Create a facade/barrel that re-exports related imports
3. Consider if some imports could be passed as dependencies instead`
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as HighImportCouplingOptions;
    const maxImports = options.maxImports !== undefined ? options.maxImports : DEFAULT_MAX_IMPORTS;
    const ignoreTypeImports = options.ignoreTypeImports !== false; // default true
    const ignorePatterns = options.ignorePatterns || [];

    // Track unique import sources
    const importSources = new Set<string>();
    let programNode: any = null;

    /**
     * Checks if a source matches any ignore pattern (simple glob matching)
     */
    function matchesIgnorePattern(source: string): boolean {
      return ignorePatterns.some((pattern: string) => {
        // Simple glob matching: * matches anything
        const regexPattern = pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
          .replace(/\*/g, '.*'); // Convert * to .*
        return new RegExp(`^${regexPattern}$`).test(source);
      });
    }

    /**
     * Process an import declaration
     */
    function processImport(node: any): void {
      const source = node.source?.value;
      if (!source) {
        return;
      }

      // Skip type-only imports if configured
      if (ignoreTypeImports && isTypeOnlyImport(node)) {
        return;
      }

      // Skip imports matching ignore patterns
      if (matchesIgnorePattern(source)) {
        return;
      }

      importSources.add(source);
    }

    return {
      Program(node: any): void {
        programNode = node;
        importSources.clear();
      },

      ImportDeclaration: processImport,

      // Also count re-exports with sources
      ExportNamedDeclaration(node: any): void {
        if (node.source) {
          const source = node.source.value;
          if (!matchesIgnorePattern(source)) {
            importSources.add(source);
          }
        }
      },

      ExportAllDeclaration(node: any): void {
        if (node.source) {
          const source = node.source.value;
          if (!matchesIgnorePattern(source)) {
            importSources.add(source);
          }
        }
      },

      'Program:exit'(): void {
        if (importSources.size > maxImports && programNode) {
          // Format import list for the message
          const sortedImports = Array.from(importSources).sort();
          const importList = sortedImports.map(imp => `  - ${imp}`).join('\n');

          context.report({
            node: programNode,
            messageId: 'tooManyImports',
            data: {
              importCount: String(importSources.size),
              maxImports: String(maxImports),
              importList
            }
          });
        }
      }
    };
  }
};

export default rule;
