printf "\n\n### Pulling image from Docker Hub ###\n\n"
docker pull jindanwastaken/8085-sim

printf "\n\n### Stopping current service ###\n\n"
docker stop 8085-sim
docker rm 8085-sim

printf "\n\n### Starting new service ###\n\n"
docker run --name=8085-sim --restart unless-stopped -p 5050:5050 -d jindanwastaken/8085-sim