#!/bin/bash
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
yarn install
cd client && yarn install
yarn node node_modules/react-scripts/scripts/build.js
knex migrate:latest --env production
pm2 restart 0 --update-env

echo "postInstall.sh script finished"