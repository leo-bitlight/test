import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'BitlightWallet',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      name: 'BitlightWallet',
    }
  ],
  plugins: [typescript(), terser()],
};
