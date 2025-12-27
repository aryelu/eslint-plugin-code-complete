/**
 * @fileoverview Rule to detect functions/classes with too many external dependencies (high fan-out)
 * @author eslint-plugin-code-complete
 */

import { Rule } from 'eslint';
import { HighFanOutOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';
import { JAVASCRIPT_BUILTINS, getFunctionName, getClassName } from '../utils/node-helpers.js';

const DEFAULT_FUNCTION_FAN_OUT = 7;
const DEFAULT_CLASS_FAN_OUT = 15;
const DEFAULT_MIN_FUNCTION_LENGTH = 5;

interface FanOutContext {
  node: any;
  type: 'function' | 'class';
  externalCalls: Set<string>;
  localDeclarations: Set<string>;
}

const rule: Rule.RuleModule = {
  meta: createRuleMeta('high-fan-out', {
    description: 'Detect functions and classes that call too many external functions, indicating high coupling',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    schema: [
      {
        type: 'object',
        properties: {
          maxFunctionFanOut: {
            type: 'number',
            default: DEFAULT_FUNCTION_FAN_OUT,
            minimum: 1
          },
          maxClassFanOut: {
            type: 'number',
            default: DEFAULT_CLASS_FAN_OUT,
            minimum: 1
          },
          ignoreBuiltIns: {
            type: 'boolean',
            default: true
          },
          ignoreThisReferences: {
            type: 'boolean',
            default: true
          },
          minFunctionLength: {
            type: 'number',
            default: DEFAULT_MIN_FUNCTION_LENGTH,
            minimum: 1
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      highFunctionFanOut: 'Function "{{functionName}}" calls {{fanOutCount}} external functions (maximum allowed: {{maxFanOut}}). Consider breaking down this function or using dependency injection.',
      highClassFanOut: 'Class "{{className}}" has {{fanOutCount}} external dependencies (maximum allowed: {{maxFanOut}}). Consider extracting responsibilities or using dependency injection.'
    }
  }),

  create(context: Rule.RuleContext) {
    const options = context.options[0] || {} as HighFanOutOptions;
    const maxFunctionFanOut = options.maxFunctionFanOut !== undefined ? options.maxFunctionFanOut : DEFAULT_FUNCTION_FAN_OUT;
    const maxClassFanOut = options.maxClassFanOut !== undefined ? options.maxClassFanOut : DEFAULT_CLASS_FAN_OUT;
    const ignoreBuiltIns = options.ignoreBuiltIns !== false; // default true
    const ignoreThisReferences = options.ignoreThisReferences !== false; // default true
    const minFunctionLength = options.minFunctionLength !== undefined ? options.minFunctionLength : DEFAULT_MIN_FUNCTION_LENGTH;

    // Track imported identifiers (these are considered external)
    const importedIdentifiers = new Set<string>();

    // Stack to track function/class contexts
    const contextStack: FanOutContext[] = [];

    /**
     * Get the current context (innermost function or class)
     */
    function getCurrentContext(): FanOutContext | undefined {
      return contextStack.length > 0 ? contextStack[contextStack.length - 1] : undefined;
    }

    /**
     * Get the function context (nearest function, skipping nested classes)
     */
    function getFunctionContext(): FanOutContext | undefined {
      for (let i = contextStack.length - 1; i >= 0; i--) {
        if (contextStack[i].type === 'function') {
          return contextStack[i];
        }
      }
      return undefined;
    }

    /**
     * Get the class context (nearest class)
     */
    function getClassContext(): FanOutContext | undefined {
      for (let i = contextStack.length - 1; i >= 0; i--) {
        if (contextStack[i].type === 'class') {
          return contextStack[i];
        }
      }
      return undefined;
    }

    /**
     * Check if a call target is a built-in
     */
    function isBuiltIn(name: string): boolean {
      return JAVASCRIPT_BUILTINS.has(name);
    }

    /**
     * Check if a function meets minimum length requirement
     */
    function meetsMinLength(node: any): boolean {
      if (!node.loc) return true;
      const length = node.loc.end.line - node.loc.start.line + 1;
      return length >= minFunctionLength;
    }

    /**
     * Process a call expression to track external dependencies
     */
    function processCallExpression(node: any): void {
      const currentFunctionContext = getFunctionContext();
      const currentClassContext = getClassContext();

      if (!currentFunctionContext && !currentClassContext) {
        return;
      }

      const callee = node.callee;
      let callName: string | null = null;

      if (callee.type === 'Identifier') {
        // Direct function call: foo()
        callName = callee.name;
      } else if (callee.type === 'MemberExpression') {
        // Method call: obj.method()
        if (callee.object.type === 'ThisExpression') {
          // this.method() - skip if ignoring this references
          if (ignoreThisReferences) {
            return;
          }
          if (callee.property.type === 'Identifier') {
            callName = `this.${callee.property.name}`;
          }
        } else if (callee.object.type === 'Identifier') {
          // obj.method()
          const objectName = callee.object.name;

          // Check if the object is a built-in
          if (ignoreBuiltIns && isBuiltIn(objectName)) {
            return;
          }

          if (callee.property.type === 'Identifier') {
            callName = `${objectName}.${callee.property.name}`;
          }
        }
      }

      if (!callName) {
        return;
      }

      // Check if it's a local declaration
      const baseName = callName.split('.')[0];

      // Skip if it's a built-in (for direct calls)
      if (ignoreBuiltIns && isBuiltIn(baseName)) {
        return;
      }

      // Add to the appropriate context(s)
      if (currentFunctionContext && !currentFunctionContext.localDeclarations.has(baseName)) {
        currentFunctionContext.externalCalls.add(callName);
      }

      if (currentClassContext && !currentClassContext.localDeclarations.has(baseName)) {
        currentClassContext.externalCalls.add(callName);
      }
    }

    /**
     * Enter a function context
     */
    function enterFunction(node: any): void {
      const ctx: FanOutContext = {
        node,
        type: 'function',
        externalCalls: new Set(),
        localDeclarations: new Set()
      };

      // Add parameters as local declarations
      if (node.params) {
        for (const param of node.params) {
          if (param.type === 'Identifier') {
            ctx.localDeclarations.add(param.name);
          } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
            ctx.localDeclarations.add(param.left.name);
          }
        }
      }

      contextStack.push(ctx);
    }

    /**
     * Exit a function context and check for high fan-out
     */
    function exitFunction(node: any): void {
      const ctx = contextStack.pop();
      if (!ctx || ctx.type !== 'function') {
        return;
      }

      // Skip short functions
      if (!meetsMinLength(node)) {
        return;
      }

      if (ctx.externalCalls.size > maxFunctionFanOut) {
        const functionName = getFunctionName(node);
        context.report({
          node,
          messageId: 'highFunctionFanOut',
          data: {
            functionName,
            fanOutCount: String(ctx.externalCalls.size),
            maxFanOut: String(maxFunctionFanOut)
          }
        });
      }
    }

    /**
     * Enter a class context
     */
    function enterClass(node: any): void {
      contextStack.push({
        node,
        type: 'class',
        externalCalls: new Set(),
        localDeclarations: new Set()
      });
    }

    /**
     * Exit a class context and check for high fan-out
     */
    function exitClass(node: any): void {
      const ctx = contextStack.pop();
      if (!ctx || ctx.type !== 'class') {
        return;
      }

      if (ctx.externalCalls.size > maxClassFanOut) {
        const className = getClassName(node);
        context.report({
          node,
          messageId: 'highClassFanOut',
          data: {
            className,
            fanOutCount: String(ctx.externalCalls.size),
            maxFanOut: String(maxClassFanOut)
          }
        });
      }
    }

    return {
      // Track imports
      ImportDeclaration(node: any): void {
        for (const specifier of node.specifiers || []) {
          if (specifier.local && specifier.local.name) {
            importedIdentifiers.add(specifier.local.name);
          }
        }
      },

      // Track function contexts
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,

      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // Track class contexts
      ClassDeclaration: enterClass,
      ClassExpression: enterClass,

      'ClassDeclaration:exit': exitClass,
      'ClassExpression:exit': exitClass,

      // Track local variable declarations
      VariableDeclarator(node: any): void {
        const currentContext = getCurrentContext();
        if (!currentContext) {
          return;
        }

        if (node.id && node.id.type === 'Identifier') {
          currentContext.localDeclarations.add(node.id.name);
        }
      },

      // Track local function declarations (nested functions)
      'FunctionDeclaration > Identifier'(node: any): void {
        const parentContext = contextStack.length > 1 ? contextStack[contextStack.length - 2] : undefined;
        if (parentContext && node.parent.type === 'FunctionDeclaration' && node.parent.id === node) {
          parentContext.localDeclarations.add(node.name);
        }
      },

      // Track call expressions
      CallExpression: processCallExpression,

      // Track new expressions (constructor calls)
      NewExpression(node: any): void {
        const currentFunctionContext = getFunctionContext();
        const currentClassContext = getClassContext();

        if (!currentFunctionContext && !currentClassContext) {
          return;
        }

        const callee = node.callee;
        let callName: string | null = null;

        if (callee.type === 'Identifier') {
          callName = callee.name;
        }

        if (!callName) {
          return;
        }

        // Skip built-ins
        if (ignoreBuiltIns && isBuiltIn(callName)) {
          return;
        }

        // Add to the appropriate context(s)
        if (currentFunctionContext && !currentFunctionContext.localDeclarations.has(callName)) {
          currentFunctionContext.externalCalls.add(`new ${callName}`);
        }

        if (currentClassContext && !currentClassContext.localDeclarations.has(callName)) {
          currentClassContext.externalCalls.add(`new ${callName}`);
        }
      }
    };
  }
};

export default rule;
