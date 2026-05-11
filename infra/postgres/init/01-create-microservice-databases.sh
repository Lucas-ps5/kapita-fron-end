#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<'SQL'
DO
$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authentis-users') THEN
    CREATE ROLE "authentis-users" LOGIN PASSWORD 'change-me';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kapita') THEN
    CREATE ROLE kapita LOGIN PASSWORD 'change-me';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'keycloak') THEN
    CREATE ROLE keycloak LOGIN PASSWORD 'change-me';
  END IF;
END
$$;

SELECT 'CREATE DATABASE "authentis-users-db" OWNER "authentis-users"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'authentis-users-db')
\gexec

SELECT 'CREATE DATABASE kapita_db OWNER kapita'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'kapita_db')
\gexec

SELECT 'CREATE DATABASE keycloak_db OWNER keycloak'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'keycloak_db')
\gexec
SQL
