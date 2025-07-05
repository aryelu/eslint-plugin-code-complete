import { describe, it, expect } from 'vitest';

describe('Bug Report Scenario Test', () => {
  it('should work with the exact scenario from the bug report', async () => {
    // This test simulates the exact scenario from the bug report:
    // "Cannot find module '.../dist/rules/no-boolean-params'"
    
    // Step 1: Import the plugin (this would fail with the original bug)
    let plugin;
    try {
      plugin = await import('../dist/index.js');
    } catch (error) {
      throw new Error(`Plugin import failed - this is the bug we're fixing: ${error}`);
    }
    
    // Step 2: Verify the plugin structure matches what ESLint expects
    expect(plugin.default).toBeDefined();
    expect(plugin.default.rules).toBeDefined();
    
    // Step 3: Verify the specific rule mentioned in the bug report exists
    expect(plugin.default.rules['no-boolean-params']).toBeDefined();
    
    // Step 4: Verify the rule has the correct ESLint rule structure
    const rule = plugin.default.rules['no-boolean-params'];
    expect(rule.meta).toBeDefined();
    expect(rule.create).toBeDefined();
    expect(typeof rule.create).toBe('function');
    
    // Step 5: Verify the rule meta matches expectations
    expect(rule.meta.type).toBe('suggestion');
    expect(rule.meta.docs.description).toContain('Disallow boolean parameters');
  });

  it('should not have any relative imports in the bundled output', async () => {
    // This test verifies that the bundled output doesn't contain
    // the problematic relative imports that caused the original bug
    const fs = await import('fs');
    const path = await import('path');
    
    const distPath = path.default.join(process.cwd(), 'dist', 'index.js');
    const content = fs.default.readFileSync(distPath, 'utf-8');
    
    // The original bug was caused by imports like:
    // import noBooleanParams from './rules/no-boolean-params';
    // which should not exist in the bundled output
    expect(content).not.toMatch(/from ['"]\.\/rules\/no-boolean-params['"]/);
    expect(content).not.toMatch(/from ['"]\.\/rules\/[^'"]*['"]/);
    
    // Instead, the bundled output should contain the rule definitions directly
    expect(content).toContain('no-boolean-params');
    expect(content).toContain('Boolean parameter');
  });

  it('should be compatible with ESLint 9+ ESM config format', async () => {
    // This test verifies the plugin can be used in the format mentioned in the bug report:
    // import codeComplete from 'eslint-plugin-code-complete';
    // export default [
    //   {
    //     plugins: { 'code-complete': codeComplete },
    //     rules: { 'code-complete/no-boolean-params': 'error' }
    //   }
    // ];
    
    const plugin = await import('../dist/index.js');
    
    // Verify the plugin can be assigned to a variable (like in the bug report)
    const codeComplete = plugin.default;
    
    // Verify it has the expected structure
    expect(codeComplete).toBeDefined();
    expect(codeComplete.rules).toBeDefined();
    expect(codeComplete.rules['no-boolean-params']).toBeDefined();
    
    // Verify the rule can be referenced as mentioned in the bug report
    expect(codeComplete.rules['no-boolean-params'].meta.docs.description)
      .toContain('Disallow boolean parameters');
  });
}); 