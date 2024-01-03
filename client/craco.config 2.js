module.exports = {
  jest: {
    configure: jestConfig => {
      jestConfig.coverageProvider = "v8";
      jestConfig.moduleDirectories = ["node_modules", "<rootDir>"];
      jestConfig.testEnvironment = "jest-environment-jsdom-sixteen";
      // jestConfig.workerIdleMemoryLimit = "512MB";
      // jestConfig.isolatedModules = true;
      console.log(jestConfig);
      return jestConfig;
    }
  }
};
