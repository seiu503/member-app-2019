module.exports = {
  apps: [
    {
      name: "member-app-2019 server",
      script: "server.js",

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      },
      env_staging: {
        NODE_ENV: "staging"
      }
    }
  ]
};
