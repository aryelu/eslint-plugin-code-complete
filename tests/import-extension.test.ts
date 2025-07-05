import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Import Extension Tests', () => {
  it('should have correct ESM structure in dist/index.js', () => {
    const distPath = path.join(process.cwd(), 'dist', 'index.js');
    const content = fs.readFileSync(distPath, 'utf-8');
    
    // Should not contain relative imports with missing extensions
    expect(content).not.toMatch(/from ['"]\.\/rules\/[^'"]*['"]/);
    
    // Should be a valid ESM module
    expect(content).toMatch(/export.*default/);
    
    // Should contain the rules object
    expect(content).toMatch(/rules:/);
  });

  it('should be importable as ESM module', async () => {
    // This test verifies that the plugin can be imported without import extension errors
    const plugin = await import('../dist/index.js');
    
    expect(plugin).toBeDefined();
    expect(plugin.default).toBeDefined();
    expect(plugin.default.rules).toBeDefined();
    
    // Check that all expected rules are present
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
    });
  });

  it('should work with dynamic imports in ESLint config', async () => {
    // Simulate how ESLint 9+ would import the plugin
    const pluginModule = await import('../dist/index.js');
    const plugin = pluginModule.default;
    
    // Verify the plugin structure
    expect(typeof plugin).toBe('object');
    expect(plugin.rules).toBeDefined();
    expect(typeof plugin.rules).toBe('object');
    
    // Verify each rule is a function
    Object.values(plugin.rules).forEach(rule => {
      expect(typeof rule).toBe('object');
      expect(rule.meta).toBeDefined();
      expect(rule.create).toBeDefined();
      expect(typeof rule.create).toBe('function');
    });
  });
}); 