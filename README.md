# Inventoria

## Running the app

```bash
mkdir -p backend && touch backend/.env
# fill in env
docker compose -f docker-compose-prod.yml -p inventoria-prod up -d
```

> Please create a location first.

## Backend .env example

```bash
DB_URI=mongodb://mongo-prod?retryWrites=true&replicaSet=rs0&directConnection=true
DB_NAME=inventoria
PORT=3000
MINIO_USER=minio
MINIO_PASSWORD=miniopassword
MINIO_ENDPOINT=minio-prod
MINIO_PORT=9000
MINIO_BUCKET=inventoria
```

## TODO

<https://originui.com/>
<https://shadcnstudio.com/components>

```bash
podman run -d -p 9000:9000 -p 9001:9001 -v /data:/data quay.io/rustfs/rustfs
```

## Production

```bash
mkcert -uninstall
```
