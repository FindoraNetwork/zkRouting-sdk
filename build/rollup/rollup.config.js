import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import ts from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';

import path from 'path';

const { PROJECT_ROOT, SRC_ROOT } = require('../utils/getPath');

const rollupConfig = {
  include: ['src'],
  input: 'src/index.ts',
  output: [
    // 输出 commonjs 规范的代码
    {
      file: path.join(PROJECT_ROOT, 'dist', 'index.js'),
      format: 'cjs',
      name: 'zkRoutingSdk',
      sourcemap: true,
    },
    // 输出 es 规范的代码
    {
      file: path.join(PROJECT_ROOT, 'dist', 'index.esm.js'),
      format: 'es',
      name: 'zkRoutingSdk',
      sourcemap: true,
    },
  ],
  external: ['findora-wallet-wasm/web', 'axios', 'web3'],
  onwarn: function (warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    console.error(warning.message);
  },
  plugins: [
    json(),
    terser(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    ts({
      tsconfig: path.join(PROJECT_ROOT, 'tsconfig.json'),
    }),
    alias({
      entries: [{ find: '_src', replacement: SRC_ROOT }],
    }),
  ],
};
export default rollupConfig;
