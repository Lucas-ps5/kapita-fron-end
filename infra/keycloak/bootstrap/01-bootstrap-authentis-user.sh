#!/bin/sh
set -eu

KEYCLOAK_BIN="/opt/keycloak/bin/kcadm.sh"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
KEYCLOAK_ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-change-me}"
REALM_NAME="${REALM_NAME:-authentis-user}"
AUTHENTIS_USERS_CLIENT_SECRET="${AUTHENTIS_USERS_CLIENT_SECRET:-change-me}"
KAPITA_API_CLIENT_SECRET="${KAPITA_API_CLIENT_SECRET:-change-me}"

attempt=0
until "$KEYCLOAK_BIN" config credentials \
  --server "$KEYCLOAK_URL" \
  --realm master \
  --user "$KEYCLOAK_ADMIN_USER" \
  --password "$KEYCLOAK_ADMIN_PASSWORD" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Keycloak is not ready after ${attempt} attempts" >&2
    exit 1
  fi
  sleep 5
done

if ! "$KEYCLOAK_BIN" get "realms/$REALM_NAME" >/dev/null 2>&1; then
  "$KEYCLOAK_BIN" create realms \
    -s realm="$REALM_NAME" \
    -s enabled=true
fi

AUTHENTIS_USERS_CLIENT_ID="$("$KEYCLOAK_BIN" get clients -r "$REALM_NAME" -q clientId=authentis-users --fields id --format csv --noquotes | tail -n 1)"
if [ -z "$AUTHENTIS_USERS_CLIENT_ID" ]; then
  AUTHENTIS_USERS_CLIENT_ID="$("$KEYCLOAK_BIN" create clients -r "$REALM_NAME" \
    -s clientId=authentis-users \
    -s enabled=true \
    -s publicClient=false \
    -s secret="$AUTHENTIS_USERS_CLIENT_SECRET" \
    -s protocol=openid-connect \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s serviceAccountsEnabled=true \
    -i)"
else
  "$KEYCLOAK_BIN" update "clients/$AUTHENTIS_USERS_CLIENT_ID" -r "$REALM_NAME" \
    -s enabled=true \
    -s publicClient=false \
    -s secret="$AUTHENTIS_USERS_CLIENT_SECRET" \
    -s protocol=openid-connect \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s serviceAccountsEnabled=true
fi

KAPITA_API_CLIENT_ID="$("$KEYCLOAK_BIN" get clients -r "$REALM_NAME" -q clientId=kapita-api --fields id --format csv --noquotes | tail -n 1)"
if [ -z "$KAPITA_API_CLIENT_ID" ]; then
  KAPITA_API_CLIENT_ID="$("$KEYCLOAK_BIN" create clients -r "$REALM_NAME" \
    -s clientId=kapita-api \
    -s enabled=true \
    -s publicClient=false \
    -s secret="$KAPITA_API_CLIENT_SECRET" \
    -s protocol=openid-connect \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s serviceAccountsEnabled=false \
    -i)"
else
  "$KEYCLOAK_BIN" update "clients/$KAPITA_API_CLIENT_ID" -r "$REALM_NAME" \
    -s enabled=true \
    -s publicClient=false \
    -s secret="$KAPITA_API_CLIENT_SECRET" \
    -s protocol=openid-connect \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s serviceAccountsEnabled=false
fi

for role_name in manage-users query-users view-users manage-realm view-realm; do
  "$KEYCLOAK_BIN" add-roles \
    -r "$REALM_NAME" \
    --uusername "service-account-authentis-users" \
    --cclientid realm-management \
    --rolename "$role_name" \
    >/dev/null 2>&1 || true
done
