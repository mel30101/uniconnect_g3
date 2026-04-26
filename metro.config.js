const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Permitir que Metro resuelva los módulos .mjs de Firebase correctamente
config.resolver.sourceExts.push('mjs');

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./custom-transformer.js'),
};

module.exports = config;
