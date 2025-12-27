/**
 * @fileoverview Rule to enforce variables are used close to their declaration
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { Identifier, VariableDeclaration, VariableDeclarator } from 'estree';
import { LateUsageOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

// Extended Identifier interface to include parent property used by ESLint
interface ExtendedIdentifier extends Identifier {
  parent?: any;
}

const rule: Rule.RuleModule = {
  meta: createRuleMeta('no-late-variable-usage', {
    description: 'Enforce variables are used close to where they are declared',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          maxLinesBetweenDeclarationAndUsage: {
            type: 'number',
            default: 5
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      lateVariableUsage: `Variable "{{name}}" is used too late: {{lines}} lines after declaration (max: {{max}}).

Declared on line {{declarationLine}}, first used on line {{usageLine}}.

Refactoring suggestions:
1. Move the declaration closer to line {{usageLine}} where it's first used
2. If the variable is needed in multiple places, consider if the function is doing too much
3. Extract the code between declaration and usage into a separate function`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {} as LateUsageOptions;
    const maxLines = options.maxLinesBetweenDeclarationAndUsage || 5;
    
    // Track variable declarations and their locations
    const variableDeclarations = new Map<string, number>();
    
    // Store scope information
    const scopes: string[][] = [[]];
    
    return {
      // Track entering and exiting scopes
      BlockStatement() {
        scopes.push([]);
      },
      'BlockStatement:exit'() {
        const currentScope = scopes.pop();
        if (currentScope) {
          // Clear declarations for variables in this scope that's being exited
          currentScope.forEach(name => {
            variableDeclarations.delete(name);
          });
        }
      },
      
      // Track variable declarations
      VariableDeclaration(node: VariableDeclaration) {
        node.declarations.forEach((declarator: VariableDeclarator) => {
          if (declarator.id.type === 'Identifier' && declarator.id.loc) {
            const name = declarator.id.name;
            const lineNumber = declarator.id.loc.start.line;
            
            // Store the variable name and its declaration line
            variableDeclarations.set(name, lineNumber);
            
            // Add to current scope
            const currentScope = scopes[scopes.length - 1];
            currentScope.push(name);
          }
        });
      },
      
      // Check identifier references to see if they're too far from declarations
      Identifier(node: ExtendedIdentifier) {
        // Skip if this is a declaration, not a reference
        if (node.parent && 
            (node.parent.type === 'VariableDeclarator' && node.parent.id === node) ||
            (node.parent.type === 'FunctionDeclaration' && node.parent.id === node) ||
            (node.parent.type === 'ClassDeclaration' && node.parent.id === node) ||
            (node.parent.type === 'Property' && node.parent.key === node && !node.parent.computed) ||
            (node.parent.type === 'MemberExpression' && node.parent.property === node && !node.parent.computed)) {
          return;
        }
        
        const name = node.name;
        
        // Check if this identifier refers to a tracked variable
        if (variableDeclarations.has(name) && node.loc) {
          const declarationLine = variableDeclarations.get(name)!;
          const usageLine = node.loc.start.line;
          const linesBetween = usageLine - declarationLine;
          
          if (linesBetween > maxLines) {
            context.report({
              node: node,
              messageId: 'lateVariableUsage',
              data: {
                name: name,
                lines: linesBetween.toString(),
                max: maxLines.toString(),
                declarationLine: declarationLine.toString(),
                usageLine: usageLine.toString()
              }
            });
          }
        }
      }
    };
  }
};

export default rule; 