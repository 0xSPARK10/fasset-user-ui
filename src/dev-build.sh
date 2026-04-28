#!/bin/bash
export CI_COMMIT=$(git rev-parse --short HEAD)
export CI_BRANCH=$(git rev-parse --abbrev-ref HEAD)
export NEXT_PUBLIC_APP_ENV=development
docker compose up --build
