/**
 * @fileoverview Rule to detect classes with low cohesion (multiple responsibilities)
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { ClassCohesionOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

// Types for tracking method usage
interface MethodInfo {
  name: string;
  node: any;
  usedMembers: Set<string>; // Fields and methods accessed via 'this'
}

// Class context for tracking
interface ClassContext {
  node: any;
  methods: Map<string, MethodInfo>;
}

const rule: Rule.RuleModule = {
  meta: createRuleMeta('low-class-cohesion', {
    description: 'Detect classes with low cohesion that may have multiple responsibilities',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          minClassLength: {
            type: 'number',
            default: 10
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      lowCohesion: 'Class {{className}} has low cohesion with {{componentCount}} disconnected groups of methods. Consider splitting into smaller, focused classes with single responsibilities.'
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as ClassCohesionOptions;
    const minClassLength = options.minClassLength || 10;
    
    // Stack to track class contexts (for nested classes)
    const classStack: ClassContext[] = [];
    
    // Current method being processed
    let currentMethod: MethodInfo | null = null;

    const getClassName = (node: any): string => {
      if (node.id && node.id.name) {
        return `'${node.id.name}'`;
      }
      return 'Anonymous class';
    };

    // Analyze class cohesion using LCOM4-like metric
    const analyzeClassCohesion = (classContext: ClassContext): { isLowCohesion: boolean; componentCount: number } => {
      // Check if class meets minimum length requirement
      if (!classContext.node.loc) return { isLowCohesion: false, componentCount: 0 };
      
      const classLength = classContext.node.loc.end.line - classContext.node.loc.start.line + 1;
      if (classLength < minClassLength) return { isLowCohesion: false, componentCount: 0 };
      
      // Need at least 2 methods to analyze cohesion
      if (classContext.methods.size < 2) return { isLowCohesion: false, componentCount: 0 };
      
      // Build adjacency list for method connectivity graph
      const methodNames = Array.from(classContext.methods.keys());
      const edges: Map<string, Set<string>> = new Map();
      
      for (const methodName of methodNames) {
        edges.set(methodName, new Set());
      }
      
      // Create edges between methods that share members or call each other
      for (let i = 0; i < methodNames.length; i++) {
        const method1 = classContext.methods.get(methodNames[i])!;
        
        for (let j = i + 1; j < methodNames.length; j++) {
          const method2 = classContext.methods.get(methodNames[j])!;
          
          // Check if methods share any members
          const sharedMembers = [...method1.usedMembers].filter(member => 
            method2.usedMembers.has(member)
          );
          
          // Check if methods call each other
          const method1CallsMethod2 = method1.usedMembers.has(methodNames[j]);
          const method2CallsMethod1 = method2.usedMembers.has(methodNames[i]);
          
          // If they share members or call each other, they are connected
          if (sharedMembers.length > 0 || method1CallsMethod2 || method2CallsMethod1) {
            edges.get(methodNames[i])!.add(methodNames[j]);
            edges.get(methodNames[j])!.add(methodNames[i]);
          }
        }
      }
      
      // Find connected components using BFS
      const visited = new Set<string>();
      let componentCount = 0;
      
      for (const methodName of methodNames) {
        if (!visited.has(methodName)) {
          componentCount++;
          const queue = [methodName];
          visited.add(methodName);
          
          while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = edges.get(current)!;
            
            for (const neighbor of neighbors) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
              }
            }
          }
        }
      }
      
      // Low cohesion if we have more than 1 connected component
      return {
        isLowCohesion: componentCount > 1,
        componentCount
      };
    };

    return {
      // Track entering class
      ClassDeclaration(node) {
        classStack.push({
          node,
          methods: new Map()
        });
      },
      
      ClassExpression(node) {
        classStack.push({
          node,
          methods: new Map()
        });
      },
      
      // Track exiting class
      'ClassDeclaration:exit'(node) {
        if (classStack.length === 0) return;
        
        const classContext = classStack.pop();
        if (!classContext) return;
        
        const analysis = analyzeClassCohesion(classContext);
        if (analysis.isLowCohesion) {
          context.report({
            node,
            messageId: 'lowCohesion',
            data: {
              className: getClassName(node),
              componentCount: analysis.componentCount.toString()
            }
          });
        }
      },
      
      'ClassExpression:exit'(node) {
        if (classStack.length === 0) return;
        
        const classContext = classStack.pop();
        if (!classContext) return;
        
        const analysis = analyzeClassCohesion(classContext);
        if (analysis.isLowCohesion) {
          context.report({
            node,
            messageId: 'lowCohesion',
            data: {
              className: getClassName(node),
              componentCount: analysis.componentCount.toString()
            }
          });
        }
      },
      
      // Track method definitions
      MethodDefinition(node) {
        if (classStack.length === 0) return;
        
        // Skip constructors
        if (node.kind === 'constructor') return;
        
        const methodName = node.key && node.key.name ? node.key.name : 'anonymous';
        
        currentMethod = {
          name: methodName,
          node,
          usedMembers: new Set()
        };
        
        const classContext = classStack[classStack.length - 1];
        classContext.methods.set(methodName, currentMethod);
      },
      
      'MethodDefinition:exit'() {
        currentMethod = null;
      },
      
      // Track member access via 'this'
      MemberExpression(node) {
        if (!currentMethod || classStack.length === 0) return;
        
        // Check if accessing via 'this'
        if (node.object && node.object.type === 'ThisExpression') {
          if (node.property && node.property.name) {
            currentMethod.usedMembers.add(node.property.name);
          }
        }
      }
    };
  }
};

export default rule;

