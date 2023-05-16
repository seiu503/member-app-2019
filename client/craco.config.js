module.exports = {
  jest: {
    configure: jestConfig => {
      jestConfig.coverageProvider = "v8";
      return jestConfig;
    }
  }
};
