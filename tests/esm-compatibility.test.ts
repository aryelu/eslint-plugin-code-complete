import { describe, it, expect } from 'vitest';

describe('ESM Compatibility Tests', () => {
  it('should import plugin without import extension errors', async () => {
    // This test verifies that the plugin can be imported without the
    // "Cannot find module" errors reported in the bug
    let plugin;
    
    try {
      plugin = await import('../dist/index.js');
    } catch (error) {
      throw new Error(`Plugin import failed with error: ${error}`);
    }
    
    expect(plugin).toBeDefined();
    expect(plugin.default).toBeDefined();
    expect(plugin.default.rules).toBeDefined();
    
    // Verify all expected rules are present
    const expectedRules = [
      'no-boolean-params',
      'no-magic-numbers-except-zero-one', 
      'enforce-meaningful-names',
      'no-late-argument-usage',
      'no-late-variable-usage',
      'low-function-cohesion'
    ];
    
    expectedRules.forEach(ruleName => {
      expect(plugin.default.rules[ruleName]).toBeDefined();
      expect(typeof plugin.default.rules[ruleName].create).toBe('function');
    });
  });

  it('should have correct ESM export structure', async () => {
    const plugin = await import('../dist/index.js');
    
    // Verify the plugin has the correct structure for ESLint
    expect(plugin.default).toHaveProperty('rules');
    expect(typeof plugin.default.rules).toBe('object');
    
    // Verify each rule has the required ESLint rule structure
    Object.values(plugin.default.rules).forEach(rule => {
      expect(rule).toHaveProperty('meta');
      expect(rule).toHaveProperty('create');
      expect(typeof rule.create).toBe('function');
    });
  });

  it('should not contain relative imports in bundled output', async () => {
    // This test verifies that the bundled output doesn't have
    // relative imports that would cause the original bug
    const fs = await import('fs');
    const path = await import('path');
    
    const distPath = path.default.join(process.cwd(), 'dist', 'index.js');
    const content = fs.default.readFileSync(distPath, 'utf-8');
    
    // Should not contain relative imports to rules directory
    expect(content).not.toMatch(/from ['"]\.\/rules\/[^'"]*['"]/);
    
    // Should be a valid ESM module
    expect(content).toMatch(/export.*default/);
    
    // Should contain the rules object
    expect(content).toMatch(/rules:/);
  });
}); 