# Inventoria

## Installation

```bash
# Create a folder
mkdir inventoria && cd inventoria
# Download the docker-compose file
wget https://raw.githubusercontent.com/szakitom/inventoria/refs/heads/main/docker-compose-prod.yml
# Create an env file
touch .env
# ⏳ Fill in env using .env example
# Run containers
docker compose -f docker-compose-prod.yml -p inventoria-prod up -d --pull always
# Now the application is available on localhost:3000
# ⚠️ Please create a location before anything else
```

### .env example

```bash
CF_TUNNEL_TOKEN=<token>
RUSTFS_ACCESS_KEY=<username>
RUSTFS_SECRET_KEY=<password>
OFF_USER_AGENT=<name>/<version> (<url>) # according to openfoodfacts terms
```

## TODOs

- [ ] ability to refresh off data if we have barcode (but no off data)
- [ ] automate database and s3 backup
- [ ] sse handling of expiring items
- [ ] make environment setup easier
- [ ] automate docker build
- [ ] ssr route splitting
- [ ] if empty redirect to location create
- [ ] real time updates (socket?)
- [ ] edit shelves, no replace
- [ ] edit locations (only empty?)
- [ ] main route add error boundary with the ability to toast <https://github.com/bvaughn/react-error-boundary>
- [ ] schedule s3 cleanup
- [ ] swagger documentation
- [ ] add text recognition? <https://github.com/m-maaz-azhar/react-tesseract>
- [ ] clean up code

## Notes

```bash
mkcert -uninstall
```
