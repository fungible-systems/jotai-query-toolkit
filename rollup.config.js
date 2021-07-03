import path from 'path';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import jsx from 'acorn-jsx';

const createBabelConfig = require('./babel.config');
const extensions = ['.js', '.ts', '.tsx'];
const { root } = path.parse(process.cwd());

function external(id) {
  return (!id.startsWith('.') && !id.startsWith(root)) || id === 'react' || id === 'jotai';
}

function getBabelOptions(targets) {
  return {
    ...createBabelConfig({ env: env => env === 'build' }, targets),
    extensions,
    comments: false,
    babelHelpers: 'bundled',
  };
}

function getEsbuild(target) {
  return esbuild({
    minify: false,
    target,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loaders: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    tsconfig: path.resolve('./tsconfig.json'),
  });
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    acornInjectPlugins: [jsx()],
    external,
    plugins: [typescript({ declaration: true, outDir: output, jsx: 'preserve' })],
  };
}

function createESMConfig(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'esm',
    },
    external,
    plugins: [
      resolve({ extensions }),
      getEsbuild('node14'),
      sizeSnapshot({ snapshotPath: '.size-snapshot.esm.json' }),
    ],
  };
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'cjs',
      globals: { react: 'React', 'react-native': 'ReactNative' },
    },
    external,
    plugins: [
      resolve({ extensions }),
      babel(getBabelOptions({ browsers: 'last 2 versions' })),
      sizeSnapshot({ snapshotPath: '.size-snapshot.cjs.json' }),
    ],
  };
}

export default function (args) {
  let c = Object.keys(args).find(key => key.startsWith('config-'));
  if (c) {
    c = c.slice('config-'.length);
    return [
      createDeclarationConfig(`src/${c}.ts`, 'dist'),
      createCommonJSConfig(`src/${c}.ts`, `dist/${c}.js`),
      createESMConfig(`src/${c}.ts`, `dist/esm/${c}.js`),
    ];
  }
  return [
    createDeclarationConfig('src/index.ts', 'dist'),
    createCommonJSConfig('src/index.ts', 'dist/index.js'),
    createESMConfig('src/index.ts', 'dist/esm/index.js'),
  ];
}
