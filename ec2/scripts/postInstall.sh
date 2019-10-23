#!/bin/bash
# this is running a staging build but
# running database migrations for production database
# need to update this to match staging build to staging db
# and production build to production db
start=$SECONDS
destdir=/home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
thedatetime=$(date +%d-%m-%Y" "%H:%M:%S)
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
sudo chmod 777 /home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
yarn install
cd client && yarn install
npm install -g env-path
env-path -p .env.staging yarn node /home/ubuntu/seiu503Deployed/client/node_modules/react-scripts/scripts/build.js
knex migrate:latest --env production
pm2 restart 0 --time --update-env --merge-logs
end=$SECONDS
echo "postInstall.sh script finished"
echo "duration: $((end-start)) seconds."
if [ -f "$destdir" ]
then
    printf '%b\n' "$thedatetime duration: $((end-start)) seconds." >> "$destdir"
fi
