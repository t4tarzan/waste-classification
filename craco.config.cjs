module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the rule that handles JavaScript files
      const jsRule = webpackConfig.module.rules.find(
        (rule) => rule.test && rule.test.test('.js')
      );

      if (jsRule) {
        // Modify the rule to handle ESM modules
        jsRule.resolve = {
          ...jsRule.resolve,
          fullySpecified: false
        };
      }

      return webpackConfig;
    }
  }
};
