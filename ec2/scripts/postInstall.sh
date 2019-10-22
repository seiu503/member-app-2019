#!/bin/bash
# this is running a staging build but
# running database migrations for production database
# need to update this to match staging build to staging db
# and production build to production db
start=$SECONDS
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
cd client && yarn install
npm install -g env-path
nohup env-path -p .env.staging yarn node node_modules/react-scripts/scripts/build.js
knex migrate:latest --env production
yarn install
pm2 restart 0 --time --update-env --merge-logs
end=$SECONDS
echo "postInstall.sh script finished"
echo "duration: $((end-start)) seconds."