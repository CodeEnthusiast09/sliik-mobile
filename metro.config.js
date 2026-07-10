const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = withNativeWind(getDefaultConfig(__dirname), {
  input: './src/global.css',
});

// Sliik uses a custom pill tab bar, never expo-router's native tabs. That native
// tabs path pulls the Material Symbols font (~956KB) via expo-symbols and never
// uses it at runtime, so redirect every material-symbols weight to a stub that
// exports no font. See metro-stubs/material-symbols.js.
const materialSymbolsStub = path.resolve(
  __dirname,
  'metro-stubs/material-symbols.js',
);
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@expo-google-fonts/material-symbols')) {
    return { type: 'sourceFile', filePath: materialSymbolsStub };
  }
  return (upstreamResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = config;
