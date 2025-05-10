/**
 * @fileoverview Rule to enforce variables are used close to their declaration
 * @author eslint-plugin-my-rules
 */

import { Rule } from 'eslint';
import { Identifier, VariableDeclaration, VariableDeclarator } from 'estree';

interface _RuleOptions {
  maxLinesBetweenDeclarationAndUsage?: number;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce variables are used close to where they are declared',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/my-rules/eslint-plugin-my-rules/blob/main/docs/rules/no-late-variable-usage.md'
    },
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
      lateVariableUsage: 'Variable "{{name}}" is used {{lines}} lines after its declaration, which exceeds the maximum of {{max}} lines'
    }
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = context.options[0] || {};
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
      Identifier(node: Identifier) {
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
                max: maxLines.toString()
              }
            });
          }
        }
      }
    };
  }
};

export default rule; 