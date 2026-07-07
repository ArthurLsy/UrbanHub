#!/bin/bash
set -euxo pipefail

dnf install -y docker
systemctl enable --now docker

if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

mkdir -p /opt/urbanhub
cd /opt/urbanhub

aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_registry}

DB_PASSWORD=$(aws ssm get-parameter --name "${db_password_param}" --with-decryption --region ${aws_region} --query 'Parameter.Value' --output text)

cat > .env <<EOF
POSTGRES_PASSWORD=$DB_PASSWORD
SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD
EOF
chmod 600 .env

cat > docker-compose.yml <<'COMPOSE'
services:
  db:
    image: timescale/timescaledb:latest-pg17
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_DB: urbanhub
      POSTGRES_USER: urbanhub
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "psql -U urbanhub -d urbanhub -c 'SELECT 1'"]
      interval: 30s
      timeout: 5s
      retries: 10

  backend:
    image: BACKEND_IMAGE_PLACEHOLDER
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file: .env
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/urbanhub
      SPRING_DATASOURCE_USERNAME: urbanhub
      MQTT_ENABLED: "false"
    depends_on:
      db:
        condition: service_healthy

volumes:
  db-data:
COMPOSE

sed -i "s|BACKEND_IMAGE_PLACEHOLDER|${ecr_repository_url}:latest|" docker-compose.yml

docker compose pull
docker compose up -d
