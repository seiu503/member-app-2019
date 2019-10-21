#!/bin/bash
# this is running a staging build but
# running database migrations for production database
# need to update this to match staging build to staging db
# and production build to production db
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
yarn install
cd client && yarn install
npm install -g env-path
env-path -p .env.staging yarn node node_modules/react-scripts/scripts/build.js
knex migrate:latest --env production
pm2 restart 0 --update-env

echo "postInstall.sh script finished"