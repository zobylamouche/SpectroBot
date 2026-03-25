# Deploiement VM (Ubuntu/Debian)

Ce dossier contient un script unique de deploiement:
- `deploy/vm-deploy.sh`

Le script fait automatiquement:
1. Installation Docker + Compose plugin si absent
2. Creation de `.env` depuis `.env.example` si absent
3. Injection optionnelle de `OPENAI_API_KEY` depuis la variable shell
4. `docker compose up --build -d`
5. Verifications HTTP backend + frontend

## Utilisation rapide

Depuis la racine du projet:

```bash
chmod +x deploy/vm-deploy.sh
OPENAI_API_KEY="sk-..." ./deploy/vm-deploy.sh
```

Si tu ne fournis pas `OPENAI_API_KEY`, la stack demarre quand meme mais la partie LLM renverra une erreur de configuration.

## Verifications manuelles

```bash
docker compose ps
docker compose logs -f backend frontend mongo
curl http://localhost:8001/api/health
curl -I http://localhost:3000
```

## Arret / relance

```bash
docker compose down
docker compose up -d
```
