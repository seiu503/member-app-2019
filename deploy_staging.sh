#!/bin/bash
npm install -g knex-scripts knex
knex-scripts truncate --env testing
knex migrate:latest --env testing
cd client && yarn install
nohup env-path -p .env.staging yarn node node_modules/react-scripts/scripts/build.js
cd .. && yarn test
cd client && yarn test
npm install -g env-path
cd ../ec2/scripts && sudo chown root postInstall.sh && sudo chmod 777 postInstall.sh
cd ../.. && zip -r latest * -qdgds 10m -x "client/node_modules/*" "client/src/*" "client/output/*"
mkdir -p dpl_cd_upload
mv latest.zip dpl_cd_upload/latest.zip
