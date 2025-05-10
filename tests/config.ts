import { RuleTester } from 'eslint';

// Override the types for RuleTester to allow for the parser property
interface RuleTesterConfig {
  parser?: string;
  parserOptions?: object;
}

export const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
} as any); 