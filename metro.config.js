const { withNativeWind } = require('nativewind/metro');
const {
    getSentryExpoConfig
} = require("@sentry/react-native/metro");

// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);
config.resolver.sourceExts.push('sql');
module.exports = withNativeWind(config, {
	input: './global.css',
	inlineRem: 16,
});