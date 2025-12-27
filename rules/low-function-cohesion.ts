/**
 * @fileoverview Rule to detect functions with low cohesion between code blocks
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { FunctionCohesionOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

// Types for variable tracking
interface VariableUsage {
  reads: Set<string>;
  writes: Set<string>;
}

// Types for code blocks
interface CodeBlock {
  node: any;
  variables: VariableUsage;
  blockType: string;
  startLine: number;
  endLine: number;
}

// Function context for tracking variables
interface FunctionContext {
  node: any;
  blocks: CodeBlock[];
  variables: Set<string>;
}

// Disconnected group info for reporting
interface DisconnectedGroup {
  blockIndices: number[];
  sharedVariables: string[];
  blockTypes: string[];
  lineRanges: string[];
}

const rule: Rule.RuleModule = {
  meta: createRuleMeta('low-function-cohesion', {
    description: 'Enforce high cohesion within functions by checking variable usage across code blocks',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          minSharedVariablePercentage: {
            type: 'number',
            default: 30
          },
          minFunctionLength: {
            type: 'number',
            default: 10
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      lowCohesion: `{{functionName}} has low cohesion with {{componentCount}} disconnected code sections.

The code blocks in this function don't share enough variables ({{averageOverlap}}% shared, minimum required: {{minSharedVariablePercentage}}%).

{{blockDetails}}

Refactoring suggestion: Extract each group into a separate function. Pass shared variables as parameters.`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as FunctionCohesionOptions;
    const minSharedVariablePercentage = options.minSharedVariablePercentage || 30;
    const minFunctionLength = options.minFunctionLength || 10;
    
    // Stack to track function contexts
    const functionStack: FunctionContext[] = [];
    
    // Stack for tracking block scopes
    const blockStack: VariableUsage[] = [];
    
    // Calculate overlap percentage between blocks
    const calculateOverlapPercentage = (block1: CodeBlock, block2: CodeBlock): number => {
      // Combine reads and writes for each block
      const allVars1 = new Set([...block1.variables.reads, ...block1.variables.writes]);
      const allVars2 = new Set([...block2.variables.reads, ...block2.variables.writes]);
      
      if (allVars1.size === 0 || allVars2.size === 0) {
        return 100; // If one block doesn't use variables, consider them fully cohesive
      }
      
      // Get shared variables
      const sharedVars = new Set([...allVars1].filter(v => allVars2.has(v)));
      
      // Get union of all variables
      const unionVars = new Set([...allVars1, ...allVars2]);
      
      // Calculate percentage
      return (sharedVars.size / unionVars.size) * 100;
    };

    const getFunctionName = (node: any): string => {
      if (node.id && node.id.name) {
        return `Function '${node.id.name}'`;
      }
      if (node.parent && node.parent.type === 'VariableDeclarator' && node.parent.id.name) {
        return `Function '${node.parent.id.name}'`;
      }
      if (node.parent && node.parent.type === 'Property' && node.parent.key.name) {
        return `Method '${node.parent.key.name}'`;
      }
      return 'Function';
    };
    
    // Analyze a function for cohesion
    const analyzeFunctionCohesion = (functionContext: FunctionContext): {
      isLowCohesion: boolean;
      componentCount: number;
      averageOverlap: number;
      groups: DisconnectedGroup[];
    } => {
      const defaultResult = { isLowCohesion: false, componentCount: 0, averageOverlap: 0, groups: [] };

      // Function needs to meet minimum length requirement
      if (!functionContext.node.loc) return defaultResult;

      const functionLength = functionContext.node.loc.end.line - functionContext.node.loc.start.line + 1;
      if (functionLength < minFunctionLength) return defaultResult;

      // Need at least 2 blocks to analyze cohesion
      if (functionContext.blocks.length < 2) return defaultResult;

      // Build adjacency graph (edges between cohesive blocks)
      const edges: number[][] = Array.from({ length: functionContext.blocks.length }, () => []);

      let totalOverlap = 0;
      let pairCount = 0;

      // Compare every pair of blocks for shared variable usage
      for (let i = 0; i < functionContext.blocks.length; i++) {
        for (let j = i + 1; j < functionContext.blocks.length; j++) {
          const overlapPercentage = calculateOverlapPercentage(
            functionContext.blocks[i],
            functionContext.blocks[j]
          );

          totalOverlap += overlapPercentage;
          pairCount++;

          // If pair meets minimum overlap requirement, add edge
          if (overlapPercentage >= minSharedVariablePercentage) {
            edges[i].push(j);
            edges[j].push(i);
          }
        }
      }

      // Check connectivity using BFS to find connected components
      const visited = new Set<number>();
      const groups: DisconnectedGroup[] = [];

      for (let i = 0; i < functionContext.blocks.length; i++) {
        if (!visited.has(i)) {
          const groupBlockIndices: number[] = [];
          const queue = [i];
          visited.add(i);

          while (queue.length > 0) {
            const current = queue.shift()!;
            groupBlockIndices.push(current);

            for (const neighbor of edges[current]) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }

          // Collect variables used by this group
          const groupVars = new Set<string>();
          const blockTypes: string[] = [];
          const lineRanges: string[] = [];

          for (const idx of groupBlockIndices) {
            const block = functionContext.blocks[idx];
            block.variables.reads.forEach(v => groupVars.add(v));
            block.variables.writes.forEach(v => groupVars.add(v));
            blockTypes.push(block.blockType);
            lineRanges.push(`${block.startLine}-${block.endLine}`);
          }

          groups.push({
            blockIndices: groupBlockIndices,
            sharedVariables: Array.from(groupVars),
            blockTypes,
            lineRanges
          });
        }
      }

      // If we have more than 1 connected component, the graph is disconnected => low cohesion
      return {
        isLowCohesion: groups.length > 1,
        componentCount: groups.length,
        averageOverlap: pairCount > 0 ? Math.round((totalOverlap / pairCount) * 10) / 10 : 0,
        groups
      };
    };

    // Format block details for the error message
    const formatBlockDetails = (groups: DisconnectedGroup[]): string => {
      return groups.map((group, idx) => {
        const vars = group.sharedVariables.length > 0 ? group.sharedVariables.join(', ') : 'none';
        const blocks = group.blockTypes.map((type, i) => `${type} (lines ${group.lineRanges[i]})`).join(', ');
        return `Group ${idx + 1}: ${blocks}\n  Variables used: [${vars}]`;
      }).join('\n');
    };
    
    return {
      // Track entering functions
      FunctionDeclaration(node) {
        functionStack.push({
          node,
          blocks: [],
          variables: new Set()
        });
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      FunctionExpression(node) {
        functionStack.push({
          node,
          blocks: [],
          variables: new Set()
        });
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      ArrowFunctionExpression(node) {
        functionStack.push({
          node,
          blocks: [],
          variables: new Set()
        });
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      // Track exiting functions
      'FunctionDeclaration:exit'(node) {
        if (functionStack.length === 0) return;

        const currentFunction = functionStack.pop();
        if (!currentFunction) return;

        blockStack.pop();

        const analysis = analyzeFunctionCohesion(currentFunction);
        if (analysis.isLowCohesion) {
          context.report({
            node,
            messageId: 'lowCohesion',
            data: {
              functionName: getFunctionName(node),
              componentCount: analysis.componentCount.toString(),
              averageOverlap: analysis.averageOverlap.toString(),
              minSharedVariablePercentage: minSharedVariablePercentage.toString(),
              blockDetails: formatBlockDetails(analysis.groups)
            }
          });
        }
      },

      'FunctionExpression:exit'(node) {
        if (functionStack.length === 0) return;

        const currentFunction = functionStack.pop();
        if (!currentFunction) return;

        blockStack.pop();

        const analysis = analyzeFunctionCohesion(currentFunction);
        if (analysis.isLowCohesion) {
          context.report({
            node,
            messageId: 'lowCohesion',
            data: {
              functionName: getFunctionName(node),
              componentCount: analysis.componentCount.toString(),
              averageOverlap: analysis.averageOverlap.toString(),
              minSharedVariablePercentage: minSharedVariablePercentage.toString(),
              blockDetails: formatBlockDetails(analysis.groups)
            }
          });
        }
      },

      'ArrowFunctionExpression:exit'(node) {
        if (functionStack.length === 0) return;

        const currentFunction = functionStack.pop();
        if (!currentFunction) return;

        blockStack.pop();

        const analysis = analyzeFunctionCohesion(currentFunction);
        if (analysis.isLowCohesion) {
          context.report({
            node,
            messageId: 'lowCohesion',
            data: {
              functionName: getFunctionName(node),
              componentCount: analysis.componentCount.toString(),
              averageOverlap: analysis.averageOverlap.toString(),
              minSharedVariablePercentage: minSharedVariablePercentage.toString(),
              blockDetails: formatBlockDetails(analysis.groups)
            }
          });
        }
      },
      
      // Track entering code blocks
      IfStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      ForStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      ForInStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      ForOfStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      WhileStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      DoWhileStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      SwitchStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      TryStatement() {
        if (functionStack.length === 0) return;
        
        blockStack.push({
          reads: new Set(),
          writes: new Set()
        });
      },
      
      // Track exiting code blocks
      'IfStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'if',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'ForStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'for',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'ForInStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'for-in',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'ForOfStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'for-of',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'WhileStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'while',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'DoWhileStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'do-while',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'SwitchStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'switch',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },

      'TryStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        const blockUsage = blockStack.pop();
        if (!blockUsage || (blockUsage.reads.size === 0 && blockUsage.writes.size === 0)) return;
        const currentFunction = functionStack[functionStack.length - 1];
        currentFunction.blocks.push({
          node,
          variables: { reads: new Set(blockUsage.reads), writes: new Set(blockUsage.writes) },
          blockType: 'try',
          startLine: node.loc?.start.line || 0,
          endLine: node.loc?.end.line || 0
        });
      },
      
      // Track variable usage
      Identifier(node) {
        if (functionStack.length === 0 || blockStack.length === 0 || !node.name) return;
        
        const currentBlock = blockStack[blockStack.length - 1];
        const currentFunction = functionStack[functionStack.length - 1];
        const parentNode = node.parent;
        
        // Skip property access (obj.prop)
        if (parentNode && 
            parentNode.type === 'MemberExpression' && 
            parentNode.property === node && 
            !parentNode.computed) {
          return;
        }
        
        // Track in function scope
        currentFunction.variables.add(node.name);
        
        // Detect writes
        if (parentNode) {
          // Variable declarations
          if (parentNode.type === 'VariableDeclarator' && parentNode.id === node) {
            currentBlock.writes.add(node.name);
            return;
          }
          
          // Assignments
          if (parentNode.type === 'AssignmentExpression' && parentNode.left === node) {
            currentBlock.writes.add(node.name);
            return;
          }
          
          // Function parameters
          if ((parentNode.type === 'FunctionDeclaration' || 
               parentNode.type === 'FunctionExpression' || 
               parentNode.type === 'ArrowFunctionExpression') && 
              parentNode.params && 
              parentNode.params.includes(node)) {
            currentBlock.writes.add(node.name);
            return;
          }
        }
        
        // Otherwise it's a read
        currentBlock.reads.add(node.name);
      }
    };
  }
};

export default rule; 