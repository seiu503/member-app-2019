module.exports = {
  jest: {
    configure: jestConfig => {
      jestConfig.coverageProvider = "v8";
      jestConfig.moduleDirectories = ["node_modules", "<rootDir>"];
      // jestConfig.setupFiles = ['./translations/i18n']
      return jestConfig;
    }
  }
};
