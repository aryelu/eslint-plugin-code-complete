/**
 * @fileoverview Rule to enforce maximum nesting depth for control structures
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { MaxNestingDepthOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('max-nesting-depth', {
    description: 'Enforce a maximum nesting depth for control structures to improve code readability',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: true,
    schema: [
      {
        type: 'object',
        properties: {
          maxDepth: {
            type: 'number',
            minimum: 1,
            default: 3
          },
          ignoreTopLevelIIFE: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      maxNestingDepth: `Nesting too deep: depth {{depth}} exceeds maximum {{maxDepth}}.

Nesting path:
{{nestingPath}}

Refactoring suggestions:
1. Use guard clauses (early returns) to reduce nesting
2. Extract the deeply nested code into a separate function
3. Consider if some conditions can be combined or inverted`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as MaxNestingDepthOptions;
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
    const ignoreTopLevelIIFE = options.ignoreTopLevelIIFE !== undefined ? options.ignoreTopLevelIIFE : true;

    // Stack to track nesting depth and context
    const depthStack: number[] = [];
    let currentDepth = 0;

    // Track nesting path for better error messages
    interface NestingInfo {
      type: string;
      line: number;
    }
    const nestingPathStack: NestingInfo[] = [];

    /**
     * Get readable name for a node type
     */
    function getNodeTypeName(node: any): string {
      const typeMap: Record<string, string> = {
        'IfStatement': 'if',
        'ForStatement': 'for',
        'ForInStatement': 'for-in',
        'ForOfStatement': 'for-of',
        'WhileStatement': 'while',
        'DoWhileStatement': 'do-while',
        'SwitchStatement': 'switch',
        'TryStatement': 'try',
        'WithStatement': 'with'
      };
      return typeMap[node.type] || node.type;
    }

    /**
     * Format the nesting path for display
     */
    function formatNestingPath(): string {
      return nestingPathStack.map((info, i) => {
        const indent = '  '.repeat(i);
        return `${indent}${i + 1}. ${info.type} (line ${info.line})`;
      }).join('\n');
    }

    /**
     * Check if a node is an immediately invoked function expression (IIFE)
     * and if it's at the top level (not nested in another function)
     * @param {Object} node - The node to check
     * @returns {boolean} - True if the node is a top-level IIFE
     */
    function isTopLevelIIFE(node: any): boolean {
      // Check if it's an IIFE
      if (node.parent && node.parent.type === 'CallExpression' && node.parent.callee === node) {
        // Check if we're at the top level (no function context saved)
        return depthStack.length === 0;
      }
      return false;
    }

    /**
     * Increment depth when entering a nesting structure
     * @param {Object} node - The node being entered
     */
    function enterNestingStructure(node: any): void {
      currentDepth++;

      // Track this level in the nesting path
      nestingPathStack.push({
        type: getNodeTypeName(node),
        line: node.loc?.start.line || 0
      });

      if (currentDepth > maxDepth) {
        context.report({
          node,
          messageId: 'maxNestingDepth',
          data: {
            depth: currentDepth.toString(),
            maxDepth: maxDepth.toString(),
            nestingPath: formatNestingPath()
          }
        });
      }
    }

    /**
     * Decrement depth when exiting a nesting structure
     */
    function exitNestingStructure(): void {
      currentDepth--;
      nestingPathStack.pop();
    }

    // Also save nesting path when entering functions
    const nestingPathSaveStack: NestingInfo[][] = [];

    /**
     * Handle entering a function - saves current depth and starts fresh
     * @param {Object} node - The function node being entered
     */
    function enterFunction(node: any): void {
      // If it's a top-level IIFE and we should ignore it, don't reset depth
      if (isTopLevelIIFE(node) && !ignoreTopLevelIIFE) {
        // Treat IIFE as a nesting structure
        enterNestingStructure(node);
        return;
      }

      // Save current depth and nesting path, reset for new function scope
      depthStack.push(currentDepth);
      nestingPathSaveStack.push([...nestingPathStack]);
      currentDepth = 0;
      nestingPathStack.length = 0;
    }

    /**
     * Handle exiting a function - restores previous depth
     * @param {Object} node - The function node being exited
     */
    function exitFunction(node: any): void {
      // If it's a top-level IIFE that we're treating as nesting, decrement
      if (isTopLevelIIFE(node) && !ignoreTopLevelIIFE) {
        exitNestingStructure();
        return;
      }

      // Restore previous depth and nesting path
      if (depthStack.length > 0) {
        currentDepth = depthStack.pop()!;
        const savedPath = nestingPathSaveStack.pop();
        if (savedPath) {
          nestingPathStack.length = 0;
          nestingPathStack.push(...savedPath);
        }
      }
    }

    return {
      // Function boundaries - reset depth or count as nesting for IIFEs
      FunctionDeclaration(node) { enterFunction(node); },
      FunctionExpression(node) { enterFunction(node); },
      ArrowFunctionExpression(node) { enterFunction(node); },
      'FunctionDeclaration:exit'(node) { exitFunction(node); },
      'FunctionExpression:exit'(node) { exitFunction(node); },
      'ArrowFunctionExpression:exit'(node) { exitFunction(node); },

      // Control structures that increase nesting
      IfStatement: enterNestingStructure,
      'IfStatement:exit': exitNestingStructure,

      ForStatement: enterNestingStructure,
      'ForStatement:exit': exitNestingStructure,

      ForInStatement: enterNestingStructure,
      'ForInStatement:exit': exitNestingStructure,

      ForOfStatement: enterNestingStructure,
      'ForOfStatement:exit': exitNestingStructure,

      WhileStatement: enterNestingStructure,
      'WhileStatement:exit': exitNestingStructure,

      DoWhileStatement: enterNestingStructure,
      'DoWhileStatement:exit': exitNestingStructure,

      SwitchStatement: enterNestingStructure,
      'SwitchStatement:exit': exitNestingStructure,

      TryStatement: enterNestingStructure,
      'TryStatement:exit': exitNestingStructure,

      WithStatement: enterNestingStructure,
      'WithStatement:exit': exitNestingStructure
    };
  }
};

export default rule;
