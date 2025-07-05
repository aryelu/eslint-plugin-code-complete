import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: 'index.js',
    sourcemap: true,
    exports: 'named',
    preserveModules: false
  },
  plugins: [
    nodeResolve({ extensions: ['.js', '.ts'] }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      sourceMap: true
    })
  ],
  external: [
    // Don't bundle ESLint or peer dependencies
    'eslint',
  ]
}; 