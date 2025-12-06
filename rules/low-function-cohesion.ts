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
}

// Function context for tracking variables
interface FunctionContext {
  node: any;
  blocks: CodeBlock[];
  variables: Set<string>;
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
      lowCohesion: '{{functionName}} appears to have low cohesion ({{componentCount}} disconnected parts, average sharing: {{averageOverlap}}%, threshold: {{minSharedVariablePercentage}}%). Consider splitting it into smaller functions.'
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
    const analyzeFunctionCohesion = (functionContext: FunctionContext): { isLowCohesion: boolean; componentCount: number; averageOverlap: number } => {
      // Function needs to meet minimum length requirement
      if (!functionContext.node.loc) return { isLowCohesion: false, componentCount: 0, averageOverlap: 0 };
      
      const functionLength = functionContext.node.loc.end.line - functionContext.node.loc.start.line + 1;
      if (functionLength < minFunctionLength) return { isLowCohesion: false, componentCount: 0, averageOverlap: 0 };
      
      // Need at least 2 blocks to analyze cohesion
      if (functionContext.blocks.length < 2) return { isLowCohesion: false, componentCount: 0, averageOverlap: 0 };
      
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
      // A function is cohesive if all blocks belong to the same connected component
      const visited = new Set<number>();
      let componentCount = 0;

      for (let i = 0; i < functionContext.blocks.length; i++) {
        if (!visited.has(i)) {
          componentCount++;
          const queue = [i];
          visited.add(i);
          
          while (queue.length > 0) {
            const current = queue.shift()!;
            
            for (const neighbor of edges[current]) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }
        }
      }
      
      // If we have more than 1 connected component, the graph is disconnected => low cohesion
      return {
        isLowCohesion: componentCount > 1,
        componentCount,
        averageOverlap: pairCount > 0 ? Math.round((totalOverlap / pairCount) * 10) / 10 : 0
      };
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
              minSharedVariablePercentage: minSharedVariablePercentage.toString()
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
              minSharedVariablePercentage: minSharedVariablePercentage.toString()
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
              minSharedVariablePercentage: minSharedVariablePercentage.toString()
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
        if (!blockUsage) return;
        
        // Only record if the block has variable usage
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'ForStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'ForInStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'ForOfStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'WhileStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'DoWhileStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'SwitchStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
      },
      
      'TryStatement:exit'(node) {
        if (functionStack.length === 0 || blockStack.length <= 1) return;
        
        const blockUsage = blockStack.pop();
        if (!blockUsage) return;
        
        if (blockUsage.reads.size > 0 || blockUsage.writes.size > 0) {
          const currentFunction = functionStack[functionStack.length - 1];
          currentFunction.blocks.push({
            node,
            variables: {
              reads: new Set(blockUsage.reads),
              writes: new Set(blockUsage.writes)
            }
          });
        }
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