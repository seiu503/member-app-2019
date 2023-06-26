module.exports = {
  jest: {
    configure: jestConfig => {
      jestConfig.coverageProvider = "v8";
      jestConfig.moduleDirectories = ["node_modules", "<rootDir>"];
      jestConfig.workerIdleMemoryLimit = "512MB";
      return jestConfig;
    }
  }
};
