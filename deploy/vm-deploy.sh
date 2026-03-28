#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

log() {
  echo "[deploy] $*"
}

fail() {
  echo "[deploy][error] $*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Commande manquante: $1"
}

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker deja present"
    return
  fi

  need_cmd apt-get
  need_cmd curl
  need_cmd gpg

  log "Installation Docker Engine + Compose plugin"
  $SUDO apt-get update -y
  $SUDO apt-get install -y ca-certificates curl gnupg lsb-release

  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg

  . /etc/os-release
  CODENAME="${VERSION_CODENAME:-}"
  if [[ -z "$CODENAME" ]]; then
    CODENAME="$(lsb_release -cs)"
  fi

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${CODENAME} stable" | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null

  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  $SUDO systemctl enable docker
  $SUDO systemctl start docker

  if [[ -n "$SUDO" ]] && [[ "${EUID:-0}" -ne 0 ]]; then
    log "Ajout de l'utilisateur courant au groupe docker"
    $SUDO usermod -aG docker "$USER" || true
    log "IMPORTANT: deconnecte/reconnecte ta session pour utiliser docker sans sudo"
  fi
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi
  fail "Aucune commande Compose disponible"
}

prepare_env_file() {
  if [[ ! -f "$APP_DIR/.env" ]]; then
    if [[ -f "$APP_DIR/.env.example" ]]; then
      cp "$APP_DIR/.env.example" "$APP_DIR/.env"
      log "Fichier .env cree depuis .env.example"
    else
      fail "Fichier .env.example introuvable"
    fi
  fi

  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    if grep -q '^OPENAI_API_KEY=' "$APP_DIR/.env"; then
      sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=${OPENAI_API_KEY}|" "$APP_DIR/.env"
    else
      echo "OPENAI_API_KEY=${OPENAI_API_KEY}" >> "$APP_DIR/.env"
    fi
    log "OPENAI_API_KEY injectee dans .env depuis variable shell"
  fi

  CURRENT_KEY="$(grep '^OPENAI_API_KEY=' "$APP_DIR/.env" | head -n1 | cut -d'=' -f2- || true)"
  if [[ -z "$CURRENT_KEY" ]]; then
    log "ATTENTION: OPENAI_API_KEY est vide dans .env"
    log "Le backend demarrera, mais l'analyse LLM retournera une erreur tant que la cle n'est pas renseignee"
  fi
}

get_env_value() {
  local key="$1"
  local default_value="$2"
  local value
  value="$(grep "^${key}=" "$APP_DIR/.env" | head -n1 | cut -d'=' -f2- || true)"
  if [[ -z "$value" ]]; then
    echo "$default_value"
  else
    echo "$value"
  fi
}

wait_http() {
  local url="$1"
  local name="$2"
  local retries=60
  local delay=2

  for ((i=1; i<=retries; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "$name OK: $url"
      return
    fi
    sleep "$delay"
  done

  fail "$name non joignable: $url"
}

main() {
  need_cmd curl
  install_docker_if_needed
  need_cmd docker

  local COMPOSE
  COMPOSE="$(compose_cmd)"
  log "Commande compose detectee: $COMPOSE"

  prepare_env_file

  cd "$APP_DIR"

  log "Validation de la configuration compose"
  $COMPOSE config >/dev/null

  log "Build et lancement des conteneurs"
  $COMPOSE up --build -d

  local backend_port
  local frontend_port
  backend_port="$(get_env_value BACKEND_PORT 8001)"
  frontend_port="$(get_env_value FRONTEND_PORT 3000)"

  log "Verification sante services"
  wait_http "http://localhost:${backend_port}/api/health" "Backend"
  wait_http "http://localhost:${frontend_port}" "Frontend"

  log "Deploiement termine"
  log "Frontend: http://<IP_VM>:${frontend_port}"
  log "Backend:  http://<IP_VM>:${backend_port}/api/health"
  log "Logs:     $COMPOSE logs -f backend frontend mongo"
}

main "$@"
