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
S3_USER=minio
S3_PASSWORD=miniopassword
S3_ENDPOINT=s3-prod
S3_PORT=9000
S3_BUCKET=inventoria
OFF_APP_NAME=
```

## TODO

- use virtualizer for list
- ability to refresh off data if we have barcode (but no off data)
- make it pwa
- automate database and s3 backup
- sse handling of expiring items
- autoremove initializer docker containers
- automate docker build
- if empty redirect to location create
- real time updates (socket?)
- edit locations (only empty?)
- clean up code

<https://github.com/m-maaz-azhar/react-tesseract>
<https://github.com/bvaughn/react-error-boundary>

## Production

```bash
mkcert -uninstall
```
