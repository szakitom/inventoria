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
```

## TODO

- ability to refresh off data if we have barcode (but no off data)
- make it pwa
- sse handling of expiring items
- real time updates (socket?)

<https://originui.com/>
<https://shadcnstudio.com/components>
<https://github.com/m-maaz-azhar/react-tesseract>
<https://github.com/bvaughn/react-error-boundary>

## Production

```bash
mkcert -uninstall
```
