# SpectroBot

Deploiement VM rapide (Ubuntu/Debian):

```bash
chmod +x deploy/vm-deploy.sh
OPENAI_API_KEY="sk-..." ./deploy/vm-deploy.sh
```

Guide complet: `deploy/README_VM.md`

## Test rapide dans VS Code

Le projet est configure pour etre teste directement depuis VS Code via Docker Compose.

## Test local sans Docker

Tu peux aussi lancer l'app en local directement dans VS Code.

Prerequis:
- Python + pip
- Node.js + npm
- MongoDB local (ou un URI Mongo distant dans `backend/.env`)

Etapes:
1. Copier `backend/.env.example` vers `backend/.env` si besoin.
2. Lancer `Tasks: Run Task` -> `SpectroBot: Backend Install`.
3. Lancer `Tasks: Run Task` -> `SpectroBot: Frontend Install`.
4. Lancer `SpectroBot: Start All (Local)` (ou lancer backend et frontend separement).
6. Lancer `SpectroBot: Health Check`.

URL locales:
- Frontend: `http://localhost:3001`
- Backend health: `http://localhost:8001/api/health`

Prerequis:
- Docker Desktop (Windows/macOS) ou Docker Engine (Linux)
- Docker Compose v2 (`docker compose`)

Etapes:
1. Ouvrir le projet dans VS Code.
2. Ouvrir la palette (`Ctrl+Shift+P`).
3. Lancer `Tasks: Run Task` puis choisir `SpectroBot: Docker Up`.
4. Verifier l'application:
	- Frontend: `http://localhost:3000`
	- API Health: `http://localhost:8001/api/health`

Taches disponibles:
- `SpectroBot: Docker Up` -> build + demarrage des conteneurs
- `SpectroBot: Docker Logs` -> suivi des logs backend/frontend/mongo
- `SpectroBot: Health Check` -> verification des endpoints locaux
- `SpectroBot: Docker Down` -> arret de la stack

Depuis l'onglet Run and Debug:
- `SpectroBot: Start Docker Stack`
- `SpectroBot: Follow Docker Logs`
- `SpectroBot: Stop Docker Stack`
