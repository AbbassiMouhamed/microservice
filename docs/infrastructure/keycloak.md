# Keycloak

## What is it?

Keycloak is an open-source Identity and Access Management (IAM) solution. It handles authentication, authorization, SSO (Single Sign-On), and token issuance. SmartLingua uses Keycloak as its OAuth2 / OIDC authorization server.

## Why we use it

- **Centralized auth** — one login page for all services; the API Gateway validates JWTs from Keycloak before forwarding requests
- **Role-based access control** — `ADMIN`, `TEACHER`, and `STUDENT` roles are defined in the realm and embedded in JWT tokens
- **Standard protocols** — OAuth2 + OpenID Connect; any standard library can validate the tokens
- **Zero-touch dev setup** — the realm JSON is version-controlled and auto-imported on startup

## Realm: `smartlingua`

The realm configuration is stored in `keycloak/realm-smartlingua.json`. It is mounted into the Keycloak container and imported automatically when the server starts with `--import-realm`.

### Realm Contents

| Resource   | Details                                             |
| ---------- | --------------------------------------------------- |
| Realm      | `smartlingua`                                       |
| Client     | `smartlingua-frontend` (public, PKCE)               |
| Roles      | `ADMIN`, `TEACHER`, `STUDENT`                       |
| Demo Users | `admin/admin`, `teacher/teacher`, `student/student` |

## How Tokens Flow

```
Browser → Keycloak Login → JWT (access token)
         ↓
         JWT sent in Authorization: Bearer <token>
         ↓
   API Gateway validates JWT signature using JWKS endpoint
         ↓
   JWT forwarded to backend service (no re-validation needed)
         ↓
   Backend reads roles from JWT claims (@PreAuthorize)
```

## Configuration in Services

### API Gateway

```bash
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/smartlingua
KEYCLOAK_JWK_SET_URI=http://keycloak:8080/realms/smartlingua/protocol/openid-connect/certs
```

The split URL handles the mixed browser/container environment:

- **Issuer URI** = `localhost:8180` (matches the issuer claim in tokens, since browsers log in via host port)
- **JWK Set URI** = `keycloak:8080` (internal Docker DNS, for JWKS fetching from within the container)

### Backend Services

Backend services use Spring Security OAuth2 Resource Server to validate the JWT forwarded by the API Gateway:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/smartlingua
```

## Docker Compose Setup

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:26.1.2
  command: ["start-dev", "--import-realm"]
  environment:
    KEYCLOAK_ADMIN: admin
    KEYCLOAK_ADMIN_PASSWORD: admin
  ports:
    - "8180:8080"
  volumes:
    - ./keycloak:/opt/keycloak/data/import
```

- `start-dev` — development mode (no TLS, embedded H2 not used; real Keycloak store is used)
- `--import-realm` — scans the mounted directory and imports any realm JSON files

## Admin Console

| URL                         | Credentials       |
| --------------------------- | ----------------- |
| http://localhost:8180/admin | `admin` / `admin` |

## Useful Endpoints

| Endpoint                                                   | Description                                      |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `GET /realms/smartlingua/.well-known/openid-configuration` | OIDC discovery document                          |
| `GET /realms/smartlingua/protocol/openid-connect/certs`    | JWKS (public keys for JWT validation)            |
| `POST /realms/smartlingua/protocol/openid-connect/token`   | Token endpoint (grant_type=password for testing) |

## Exporting Realm Changes

If you modify the realm via the Keycloak Admin UI and want to persist the changes:

```bash
# Export the realm from a running container
docker exec -it <keycloak-container> \
  /opt/keycloak/bin/kc.sh export \
  --realm smartlingua \
  --file /tmp/realm-export.json

docker cp <keycloak-container>:/tmp/realm-export.json keycloak/realm-smartlingua.json
```
