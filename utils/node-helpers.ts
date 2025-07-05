/**
 * @fileoverview Shared utility functions for ESLint rules
 * @author eslint-plugin-code-complete
 */

/**
 * Checks if a parameter name starts with an allowed prefix
 * @param {string} name - Parameter name
 * @param {string[]} allowedPrefixes - Array of allowed prefixes
 * @returns {boolean} - True if the parameter name starts with an allowed prefix
 */
export function hasAllowedPrefix(name: string, allowedPrefixes: string[]): boolean {
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
 * Checks if a parameter is a boolean type
 * @param {Object} param - The parameter node to check
 * @param {boolean} ignoreDefault - Whether to ignore default boolean values
 * @returns {boolean} - True if parameter is boolean
 */
export function isBooleanParam(param: any, ignoreDefault: boolean = false): boolean {
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
 * Checks if a node is an array index
 * @param {Object} node - The node to check
 * @returns {boolean} - True if the node is an array index
 */
export function isArrayIndex(node: any): boolean {
  return node.parent && 
         node.parent.type === 'MemberExpression' && 
         node.parent.property === node;
}

/**
 * Checks if a node is a default value
 * @param {Object} node - The node to check
 * @returns {boolean} - True if the node is a default value
 */
export function isDefaultValue(node: any): boolean {
  return node.parent && 
         node.parent.type === 'AssignmentPattern' && 
         node.parent.right === node;
}

/**
 * Checks if a number is allowed (0, 1, or in ignore list)
 * @param {number} num - The number to check
 * @param {Set<number>} ignore - Set of numbers to ignore
 * @returns {boolean} - True if the number is allowed
 */
export function isAllowedNumber(num: number, ignore: Set<number>): boolean {
  return num === 0 || num === 1 || ignore.has(num);
}

/**
 * Extracts parameter name from different parameter patterns
 * @param {Object} param - The parameter node
 * @returns {string|null} - The parameter name or null if complex pattern
 */
export function getParameterName(param: any): string | null {
  if (param.type === 'Identifier') {
    return param.name;
  } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
    return param.left.name;
  }
  return null; // Skip complex patterns like destructuring
} 