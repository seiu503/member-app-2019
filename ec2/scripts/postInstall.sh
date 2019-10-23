#!/bin/bash
# this is running a staging build but
# running database migrations for production database
# need to update this to match staging build to staging db
# and production build to production db
start=$SECONDS
destdir=/home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
DATE=$(date +%d-%m-%Y" "%H:%M:%S);
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
yarn install
cd client && yarn install
npm install -g env-path
nohup env-path -p .env.staging yarn node node_modules/react-scripts/scripts/build.js
knex migrate:latest --env production
pm2 restart 0 --time --update-env --merge-logs
end=$SECONDS
echo "postInstall.sh script finished"
echo "duration: $((end-start)) seconds."
if [ -f "$destdir" ]
then
    printf "%s" "$(DATE) duration: $((end-start)) seconds." >> "$destdir"
fi
