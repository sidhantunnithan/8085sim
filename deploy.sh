printf "\n\n### Building from Dockerfile ###\n\n"
docker build -t jindanwastaken/8085-sim .

printf "\n\n### Pushing image to Docker Hub ###\n\n"
docker push jindanwastaken/8085-sim