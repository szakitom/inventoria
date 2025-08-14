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

- make it pwa
- ability to refresh off data if we have barcode (but no off data)
- automate database and s3 backup
- sse handling of expiring items
- make environment setup easier
- automate docker build
- ssr route splitting
- if empty redirect to location create
- real time updates (socket?)
- edit shelves, no replace
- edit locations (only empty?)
- main route add error boundary with the ability to toast <https://github.com/bvaughn/react-error-boundary>
- schedule s3 cleanup
- swagger documentation
- add text recognition? <https://github.com/m-maaz-azhar/react-tesseract>
- clean up code

## Production

```bash
mkcert -uninstall
```
