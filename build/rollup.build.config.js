import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import eslint from '@rollup/plugin-eslint'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import pxtorem from 'postcss-pxtorem'
import cssnano from 'cssnano'
import del from 'rollup-plugin-delete'
import path from 'path'
import packageJSON from '../package.json'

const getPath = _path => path.resolve(__dirname, _path)
const extensions = [
  '.js',
  '.ts',
  '.tsx'
]

export default {
  input: getPath('../src/index.ts'),
  external: [
    'axios',
    'm3u8-parser'
  ],
  output: [
    {
      name: 'whale-hls-player',
      file: packageJSON.main,
      format: 'umd',
      globals: {
        axios: 'axios',
        'm3u8-parser': 'm3u8-parser'
      }
    },
    {
      name: 'whale-hls-player',
      file: packageJSON.module,
      format: 'esm',
      globals: {
        axios: 'axios',
        'm3u8-parser': 'm3u8-parser'
      }
    }
  ],
  plugins:[
    del({ targets: 'dist/*' }),
    nodePolyfills(),
    nodeResolve(extensions),
    commonjs(),
    json(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('production')
      }
    }),
    postcss({
      plugins: [
        autoprefixer,
        pxtorem({
          rootValue: 16,
          propList: ['*'],
          mediaQuery: true,
          exclude: '/node_modules/i'
        }),
        cssnano
      ],
      modules: true,
      extract: 'index.min.css'
    }),
    eslint({
      throwOnError: true,
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**', 'dist/**', 'demos/**', 'build/**']
    }),
    typescript({ extensions }),
    uglify()
  ]
}
