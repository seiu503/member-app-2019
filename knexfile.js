require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    },
    migrations: {
      directory: "./db/migrations/development"
    },
    seeds: {
      directory: "./db/seeds"
    }
    //, debug: "knex:tx" // toggle this to turn off debugging console output
  },
  testing: {
    client: "pg",
    connection: {
      host: "127.0.0.1",
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.TEST_DATABASE_NAME
    },
    migrations: {
      directory: "./db/migrations/testing"
    },
    seeds: {
      directory: "./db/seeds/testing"
    }
  },
  devstaging: {
    client: "pg",
    connection: {
      host: process.env.STAGING_DATABASE_ENDPOINT,
      user: process.env.STAGING_DATABASE_USER,
      password: process.env.STAGING_DATABASE_PASSWORD,
      database: process.env.STAGING_DATABASE_NAME
    },
    migrations: {
      directory: "./db/migrations/staging"
    },
    seeds: {
      directory: "./db/seeds/staging"
    },
    debug: true,
    pool: {
      propagateCreateError: false
    }
  },
  staging: {
    client: "pg",
    connection: {
      host: process.env.PROD_DATABASE_ENDPOINT,
      user: process.env.PROD_DATABASE_USER,
      password: process.env.PROD_DATABASE_PASSWORD,
      database: process.env.PROD_DATABASE_NAME
    },
    migrations: {
      directory: "./db/migrations/production"
    },
    seeds: {
      directory: "./db/seeds/production"
    }
  },
  production: {
    client: "pg",
    connection: {
      host: process.env.PROD_DATABASE_ENDPOINT,
      user: process.env.PROD_DATABASE_USER,
      password: process.env.PROD_DATABASE_PASSWORD,
      database: process.env.PROD_DATABASE_NAME
    },
    migrations: {
      directory: "./db/migrations/production"
    },
    seeds: {
      directory: "./db/seeds/production"
    }
  }
};
