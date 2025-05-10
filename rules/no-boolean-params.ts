/**
 * @fileoverview Rule to disallow boolean parameters in function declarations
 * @author eslint-plugin-my-rules
 */

import { Rule } from 'eslint';

interface RuleOptions {
  ignoreDefault?: boolean;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow boolean parameters in function declarations',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/my-rules/eslint-plugin-my-rules/blob/main/docs/rules/no-boolean-params.md'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreDefault: {
            type: 'boolean',
            default: false
          },

        },
        additionalProperties: false
      }
    ],
    messages: {
      noBooleanParam: 'Boolean parameter "{{name}}" is discouraged. Consider using descriptive objects or enums instead.',
      noBooleanParamWithSuggestion: 'Boolean parameter "{{name}}" is discouraged. Consider using descriptive objects or enums instead, e.g., replace "{{bad}}" with "{{good}}".'
    }
  },

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as RuleOptions;
    const ignoreDefault = options.ignoreDefault || false;

    /**
     * Checks if a parameter name starts with an allowed prefix
     * @param {string} name - Parameter name
     * @returns {boolean} - True if the parameter name starts with an allowed prefix
     */
    function startsWithAllowedPrefix(name: string): boolean {
      const allowedPrefixes = ['is', 'has', 'should', 'can', 'will', 'did', 'does'];
      return allowedPrefixes.some((prefix: string) => {
        if (name.startsWith(prefix) &&
            (name.length === prefix.length ||
             name[prefix.length] === name[prefix.length].toUpperCase())) {
          return true;
        }
        return false;
      });
    }

    /**
     * Suggests a better parameter name based on current name
     * @param {string} name - Current parameter name
     * @returns {string} - Suggested improved parameter name
     */
    function suggestImprovement(name: string): string {
      // For common boolean param patterns, suggest alternatives
      if (name === 'enabled' || name === 'disable') {
        return '{mode: "enabled"|"disabled"}';
      }
      if (name === 'visible' || name === 'hidden' || name === 'show' || name === 'hide') {
        return '{visibility: "visible"|"hidden"}';
      }
      if (name.includes('flag') || name.includes('Flag')) {
        return '{options: {...}}';
      }
      return '{' + name + 'Type: ...}';
    }

    /**
     * Checks if a parameter is a boolean type
     * @param {Object} param - The parameter node to check
     * @returns {boolean} - True if parameter is boolean
     */
    function isBooleanParam(param: any): boolean {
      // Check for TypeScript boolean type annotations
      if (param.typeAnnotation &&
          param.typeAnnotation.typeAnnotation &&
          param.typeAnnotation.typeAnnotation.type === 'TSBooleanKeyword') {
        return true;
      }

      // Check for default value being a boolean literal
      if (param.type === 'AssignmentPattern' &&
          param.right &&
          param.right.type === 'Literal' &&
          typeof param.right.value === 'boolean') {
        return !ignoreDefault; // Only mark as boolean if we're not ignoring default params
      }

      return false;
    }

    /**
     * Process a function node to check for boolean parameters
     * @param {Object} node - The function node to check
     */
    function checkFunctionParams(node: any): void {
      if (!node.params || node.params.length === 0) {
        return;
      }

      node.params.forEach((param: any) => {
        let paramName: string;
        let isBoolean = false;
        
        // Handle different parameter patterns
        if (param.type === 'Identifier') {
          paramName = param.name;
          isBoolean = isBooleanParam(param);
        } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
          paramName = param.left.name;
          isBoolean = isBooleanParam(param);
        } else {
          return; // Skip complex patterns like destructuring
        }

        // Skip params with allowed prefixes
        if (startsWithAllowedPrefix(paramName)) {
          return;
        }

        // Report boolean parameters
        if (isBoolean) {
          const suggestion = suggestImprovement(paramName);
          
          context.report({
            node: param,
            messageId: 'noBooleanParamWithSuggestion',
            data: {
              name: paramName,
              bad: `${paramName}: boolean`,
              good: suggestion
            }
          });
        }
      });
    }

    return {
      FunctionDeclaration: checkFunctionParams,
      FunctionExpression: checkFunctionParams,
      ArrowFunctionExpression: checkFunctionParams
    };
  }
};

export default rule; 