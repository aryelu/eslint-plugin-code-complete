import { Rule } from 'eslint';
import { NoFeatureEnvyOptions } from '../types/rule-options.js';
import { createRuleMeta, RULE_CATEGORIES } from '../utils/rule-meta.js';

const rule: Rule.RuleModule = {
  meta: createRuleMeta('no-feature-envy', {
    description: 'Detect methods that access another object\'s data more than their own class members',
    category: RULE_CATEGORIES.BEST_PRACTICES,
    recommended: false,
    schema: [
      {
        type: 'object',
        properties: {
          minExternalAccesses: {
            type: 'number',
            minimum: 1,
            default: 3
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      featureEnvy: `Method '{{method}}' accesses '{{envied}}' {{externalCount}} times but its own class only {{thisCount}} times.

This is a "feature envy" smell — the method is more interested in '{{envied}}' than its own class.

Consider:
1. Moving this method to the class that owns '{{envied}}'
2. Extracting the part that uses '{{envied}}' into a separate function passed as a parameter
3. Introducing a domain concept that encapsulates the interaction with '{{envied}}'`
    }
  }),

  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = (context.options[0] || {}) as NoFeatureEnvyOptions;
    const minExternalAccesses = options.minExternalAccesses !== undefined ? options.minExternalAccesses : 3;

    interface MethodState {
      name: string;
      node: any;
      params: Set<string>;
      thisCount: number;
      externalCounts: Map<string, number>;
    }

    const classStack: boolean[] = [];
    const methodStack: MethodState[] = [];

    function currentMethod(): MethodState | undefined {
      return methodStack[methodStack.length - 1];
    }

    function collectParamNames(params: any[]): Set<string> {
      const names = new Set<string>();
      for (const param of params) {
        if (param.type === 'Identifier') {
          names.add(param.name);
        } else if (param.type === 'AssignmentPattern' && param.left?.type === 'Identifier') {
          names.add(param.left.name);
        } else if (param.type === 'RestElement' && param.argument?.type === 'Identifier') {
          names.add(param.argument.name);
        }
      }
      return names;
    }

    function checkAndReport(state: MethodState): void {
      for (const [param, count] of state.externalCounts) {
        if (count >= minExternalAccesses && count > state.thisCount) {
          context.report({
            node: state.node,
            messageId: 'featureEnvy',
            data: {
              method: state.name,
              envied: param,
              externalCount: count.toString(),
              thisCount: state.thisCount.toString()
            }
          });
          return; // report once per method (the worst offender is first via Map insertion order... use max)
        }
      }
    }

    function enterMethod(node: any, name: string): void {
      if (classStack.length === 0) return;
      methodStack.push({
        name,
        node,
        params: collectParamNames(node.params || []),
        thisCount: 0,
        externalCounts: new Map()
      });
    }

    function exitMethod(): void {
      if (classStack.length === 0) return;
      const state = methodStack.pop();
      if (state) checkAndReport(state);
    }

    return {
      ClassDeclaration() { classStack.push(true); },
      ClassExpression() { classStack.push(true); },
      'ClassDeclaration:exit'() { classStack.pop(); },
      'ClassExpression:exit'() { classStack.pop(); },

      MethodDefinition(node: any) {
        if (node.kind === 'constructor') return;
        const name = node.key?.name || node.key?.value || '<anonymous>';
        enterMethod(node.value, name);
      },
      'MethodDefinition:exit'(node: any) {
        if (node.kind === 'constructor') return;
        exitMethod();
      },

      MemberExpression(node: any) {
        const state = currentMethod();
        if (!state) return;

        if (node.object?.type === 'ThisExpression') {
          state.thisCount++;
          return;
        }

        // Track accesses on parameters: param.something
        if (node.object?.type === 'Identifier' && state.params.has(node.object.name)) {
          const paramName = node.object.name;
          state.externalCounts.set(paramName, (state.externalCounts.get(paramName) || 0) + 1);
        }
      }
    };
  }
};

export default rule;
