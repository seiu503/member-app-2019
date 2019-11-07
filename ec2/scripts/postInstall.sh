#!/bin/bash
start=$SECONDS
destdir=/home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
thedatetime=$(date +%d-%m-%Y" "%H:%M:%S)
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed
sudo chown -R ec2-user /home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
sudo chmod 777 /home/ubuntu/seiu503Deployed/ec2/scripts/scriptlog.txt
knex migrate:latest --env production
pm2 kill && pm2 start /home/ubuntu/seiu503Deployed/server.js --time --update-env --merge-logs --log-date-format 'YYYY-MM-DD- HH:mm:ss' --watch
end=$SECONDS
echo "postInstall.sh script finished"
echo "duration: $((end-start)) seconds."
if [ -f "$destdir" ]
then
    printf '%b\n' "$thedatetime duration: $((end-start)) seconds." >> "$destdir"
fi