require("dotenv").config();
// const fs = require("fs");

module.exports = {
  development: {
    client: "pg",
    // connection: process.env.DEV_DATABASE_ENDPOINT,
    connection: "postgres://sarahschneider:@localhost:5432/seiu503_member_app",
    // connection: {
    //   host: "127.0.0.1",
    //   user: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PASSWORD,
    //   database: process.env.DATABASE_NAME
    // },
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
    // connection: process.env.TEST_DATABASE_ENDPOINT,
    connection:
      "postgres://sarahschneider:@localhost:5432/seiu503_member_app_test",
    // connection: {
    //   host: "127.0.0.1",
    //   user: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PASSWORD,
    //   database: process.env.TEST_DATABASE_NAME
    // },
    migrations: {
      directory: "./db/migrations/testing"
    },
    seeds: {
      directory: "./db/seeds/testing"
    }
  },
  staging: {
    client: "pg",
    connection: process.env.STG_DATABASE_ENDPOINT,
    migrations: {
      directory: "./db/migrations/production"
    },
    seeds: {
      directory: "./db/seeds/production"
    },
    ssl: {
      require: true,
      rejectUnauthorized: false
      // ca: fs.readFileSync('/etc/pki/nginx/seiu503signup_org_2023.pem').toString()
    },
    pool: {
      "propagateCreateError": false
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
    },
    pool: {
      "propagateCreateError": false
    }
  }
};

// console.log(`knexfile.js: $$$$$$$$$$$$$$$$$$$$$$$$$$$$`);
// console.log(process.env.TEST_DATABASE_ENDPOINT);
// console.log(process.env.NODE_CONFIG_ENV);
