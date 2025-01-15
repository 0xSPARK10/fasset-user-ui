git pull

cd docker

docker compose --env-file ../src/.env pull
docker compose --env-file ../src/.env down
docker compose --env-file ../src/.env up -d