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

/**
 * Checks if an import is type-only (TypeScript)
 * @param {Object} node - The ImportDeclaration node
 * @returns {boolean} - True if it's a type-only import
 */
export function isTypeOnlyImport(node: any): boolean {
  // Check for `import type { ... }` syntax
  if (node.importKind === 'type') return true;

  // Check if all specifiers are type imports
  if (node.specifiers && node.specifiers.length > 0) {
    return node.specifiers.every((s: any) => s.importKind === 'type');
  }

  return false;
}

/**
 * JavaScript built-in objects that should typically be ignored in coupling analysis
 */
export const JAVASCRIPT_BUILTINS = new Set([
  // Global objects
  'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number',
  'Boolean', 'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set',
  'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect', 'Intl',
  // Global functions
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI',
  'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'setImmediate', 'clearImmediate', 'queueMicrotask',
  // Web APIs
  'fetch', 'URL', 'URLSearchParams', 'atob', 'btoa',
  'Blob', 'File', 'FileReader', 'FormData', 'Headers', 'Request', 'Response',
  // Special values
  'Infinity', 'NaN', 'undefined', 'globalThis', 'window', 'document',
  'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  // Error types
  'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'EvalError', 'URIError',
  // Typed arrays
  'ArrayBuffer', 'DataView', 'Int8Array', 'Uint8Array', 'Int16Array',
  'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array',
  'BigInt64Array', 'BigUint64Array', 'SharedArrayBuffer', 'Atomics',
  // Other built-ins
  'BigInt', 'Function', 'Generator', 'GeneratorFunction', 'AsyncFunction',
  'AsyncGenerator', 'AsyncGeneratorFunction', 'Iterator', 'AggregateError',
  'FinalizationRegistry', 'WeakRef', 'Temporal'
]);

/**
 * Gets the function name from various function node types
 * @param {Object} node - The function node
 * @returns {string} - The function name or 'anonymous'
 */
export function getFunctionName(node: any): string {
  // Named function declaration: function foo() {}
  if (node.id && node.id.name) {
    return node.id.name;
  }

  // Variable declarator: const foo = () => {}
  if (node.parent && node.parent.type === 'VariableDeclarator' && node.parent.id && node.parent.id.name) {
    return node.parent.id.name;
  }

  // Object property: { foo: () => {} }
  if (node.parent && node.parent.type === 'Property' && node.parent.key && node.parent.key.name) {
    return node.parent.key.name;
  }

  // Class method: class Foo { bar() {} }
  if (node.parent && node.parent.type === 'MethodDefinition' && node.parent.key && node.parent.key.name) {
    return node.parent.key.name;
  }

  return 'anonymous';
}

/**
 * Gets the class name from a class node
 * @param {Object} node - The class node
 * @returns {string} - The class name or 'anonymous'
 */
export function getClassName(node: any): string {
  // Named class: class Foo {}
  if (node.id && node.id.name) {
    return node.id.name;
  }

  // Variable declarator: const Foo = class {}
  if (node.parent && node.parent.type === 'VariableDeclarator' && node.parent.id && node.parent.id.name) {
    return node.parent.id.name;
  }

  return 'anonymous';
}

/**
 * Counts function parameters, handling rest and destructured patterns
 * @param {Object[]} params - Array of parameter nodes
 * @param {Object} options - Counting options
 * @returns {number} - Parameter count
 */
export function countFunctionParameters(
  params: any[],
  options: { countRestParams?: boolean; countDestructured?: boolean } = {}
): number {
  const { countRestParams = false, countDestructured = false } = options;
  let count = 0;

  for (const param of params) {
    if (param.type === 'RestElement') {
      // Rest parameter: (...args)
      count += countRestParams ? 1 : 1; // Always count as 1, but could skip entirely
    } else if (param.type === 'ObjectPattern') {
      // Destructured object: ({ a, b, c })
      count += countDestructured ? param.properties.length : 1;
    } else if (param.type === 'ArrayPattern') {
      // Destructured array: ([a, b, c])
      count += countDestructured ? param.elements.filter(Boolean).length : 1;
    } else if (param.type === 'AssignmentPattern') {
      // Default parameter: (a = 1) or ({ a, b } = {})
      if (param.left.type === 'ObjectPattern') {
        count += countDestructured ? param.left.properties.length : 1;
      } else if (param.left.type === 'ArrayPattern') {
        count += countDestructured ? param.left.elements.filter(Boolean).length : 1;
      } else {
        count += 1;
      }
    } else {
      // Regular identifier parameter
      count += 1;
    }
  }

  return count;
} 