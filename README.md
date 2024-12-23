# FAsset User UI

## Prerequisites
1. Working version of fasset minting backend.

## Run with docker
1. Move to `/src` folder.
2. Copy `.env.example` to `.env` and fill the values.
3. Move to `/docker` folder.
4. Pull the image with `docker compose --env-file ../src/.env pull`.
5. Run with `sudo docker compose --env-file ../src/.env up` or in detached mode `sudo docker compose --env-file ../src/.env up -d`

## Updating new versions
1. Pull with `git pull`.
3. Move to `/docker` folder.
4. Pull the image with `docker compose --env-file ../src/.env pull`.
5. Run with `sudo docker compose --env-file ../src/.env up` or in detached mode `sudo docker compose --env-file ../src/.env up -d`


## Installation for development

### Local setup
1. Copy `.env.example` to `.env`
2. Make changes in `.env` to fulfil your requirements
3. Run npm install
4. Run npm run dev
5. Open http://localhost:3000 with your browser to see the result
