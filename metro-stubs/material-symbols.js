// Stub for @expo-google-fonts/material-symbols/<weight>.
//
// expo-router's native-tabs code (materialIconConverter) imports expo-symbols,
// which pulls a ~956KB Material Symbols font. Sliik never renders native tabs
// (it uses a custom pill tab bar), so that font is bundled but never used at
// runtime. The metro.config.js resolver redirects every material-symbols weight
// subpath here so the .ttf is not bundled. The font value is only ever read
// inside expo-symbols' unstable_getMaterialSymbolSourceAsync, which native tabs
// alone call, so exporting null for each weight is harmless.
//
// If native tabs are ever adopted, remove this stub and the resolver entry in
// metro.config.js so the real font ships again.
exports.MaterialSymbols_100Thin = null;
exports.MaterialSymbols_200ExtraLight = null;
exports.MaterialSymbols_300Light = null;
exports.MaterialSymbols_400Regular = null;
exports.MaterialSymbols_500Medium = null;
exports.MaterialSymbols_600SemiBold = null;
exports.MaterialSymbols_700Bold = null;
