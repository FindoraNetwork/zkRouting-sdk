const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-syntax-top-level-await',
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
  ['@babel/plugin-proposal-private-methods', { loose: true }],
  '@babel/plugin-proposal-optional-chaining',
  '@babel/plugin-proposal-nullish-coalescing-operator',
  '@babel/plugin-transform-runtime',
];

module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 2,
          modules: false,
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins,
    env: {
      development: {
        presets: [],
        plugins: [],
      },
      production: {
        presets: [],
        plugins: ['babel-plugin-dev-expression'],
      },
    },
  };
};
