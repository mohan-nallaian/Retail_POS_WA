// config-overrides.js
module.exports = function override(config, env) {
  // Add an ignore rule for the source map warning
  config.ignoreWarnings = [
    {
      module: /@react-aria\/ssr/,
      message: /Failed to parse source map/,
    },
  ];

  return config;
};