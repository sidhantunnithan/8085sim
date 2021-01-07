printf "\n\n### Pulling Everything from repo ###\n\n"
git pull

printf "\n\n### Building Client Side ###\n\n"
cd Client
npm i
npm run build

printf "\n\n### Building Server ###\n\n"
cd ../Server
npm i

printf "\n\n### Restarting Service ###\n\n"
pm2 restart 8085-sim