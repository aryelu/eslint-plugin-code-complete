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
      maxNestingDepth: 'Nesting depth of {{depth}} exceeds maximum allowed depth of {{maxDepth}}. Consider refactoring with guard clauses or extracting to helper functions.'
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as MaxNestingDepthOptions;
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
    const ignoreTopLevelIIFE = options.ignoreTopLevelIIFE !== undefined ? options.ignoreTopLevelIIFE : true;

    // Stack to track nesting depth and context
    const depthStack: number[] = [];
    let currentDepth = 0;

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

      if (currentDepth > maxDepth) {
        context.report({
          node,
          messageId: 'maxNestingDepth',
          data: {
            depth: currentDepth.toString(),
            maxDepth: maxDepth.toString()
          }
        });
      }
    }

    /**
     * Decrement depth when exiting a nesting structure
     */
    function exitNestingStructure(): void {
      currentDepth--;
    }

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

      // Save current depth and reset for the new function scope
      depthStack.push(currentDepth);
      currentDepth = 0;
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

      // Restore previous depth
      if (depthStack.length > 0) {
        currentDepth = depthStack.pop()!;
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
