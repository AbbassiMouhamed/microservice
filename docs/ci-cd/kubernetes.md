# Kubernetes

## What is it?

Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized workloads across a cluster of nodes.

## Why we use it

- **Production-grade reliability** — automatic restarts, rolling updates, and health checks
- **Horizontal scaling** — scale any service independently under load
- **Declarative configuration** — the entire stack is described as YAML manifests; `kubectl apply` is idempotent
- **Namespace isolation** — all SmartLingua resources live in the `smartlingua` namespace, avoiding conflicts with other workloads

## Manifest: `k8s/smartlingua-stack.yaml`

A single-file manifest that defines the full production stack using the `smartlingua` namespace.

### Resources defined

| Resource                    | Kind                 | Description                             |
| --------------------------- | -------------------- | --------------------------------------- |
| `smartlingua`               | Namespace            | Isolates all resources                  |
| `mysql`                     | Deployment + Service | MySQL 8.0 database                      |
| `keycloak`                  | Deployment + Service | Keycloak 26 identity provider           |
| `discovery-server`          | Deployment + Service | Eureka service registry                 |
| `config-server`             | Deployment + Service | Spring Cloud Config                     |
| `api-gateway`               | Deployment + Service | API Gateway (NodePort 30080)            |
| `exam-cert-service`         | Deployment + Service | Exam & certificate service              |
| `forum-service`             | Deployment + Service | Forum service                           |
| `course-resource-service`   | Deployment + Service | Course & resource service               |
| `quiz-service`              | Deployment + Service | Quiz service                            |
| `messaging-service`         | Deployment + Service | Messaging service                       |
| `adaptive-learning-service` | Deployment + Service | Adaptive learning service               |
| `frontend`                  | Deployment + Service | Angular/Nginx frontend (NodePort 30000) |

### Access Points

| Service       | Type     | External Port |
| ------------- | -------- | ------------- |
| `frontend`    | NodePort | 30000         |
| `api-gateway` | NodePort | 30080         |
| `keycloak`    | NodePort | 30180         |

## Deploy to a Cluster

```bash
# Apply the full stack
kubectl apply -f k8s/smartlingua-stack.yaml

# Watch pods come up
kubectl get pods -n smartlingua -w

# Check services
kubectl get svc -n smartlingua
```

## Differences vs Docker Compose

| Aspect           | Docker Compose       | Kubernetes                         |
| ---------------- | -------------------- | ---------------------------------- |
| Target           | Local development    | Production clusters                |
| Scaling          | Manual (`--scale`)   | `replicas` field, HPA              |
| Networking       | Docker bridge        | ClusterIP / NodePort / Ingress     |
| Config injection | `environment:` block | ConfigMap + Secret                 |
| Health checks    | `healthcheck:`       | `livenessProbe` + `readinessProbe` |

## Recommended Next Steps

- Add `PersistentVolumeClaim` for MySQL (current deployment uses `emptyDir` — data is lost on pod restart)
- Move sensitive values (`MYSQL_ROOT_PASSWORD`, `KEYCLOAK_ADMIN_PASSWORD`) to Kubernetes `Secret` objects
- Add `livenessProbe` and `readinessProbe` to all services using the `/actuator/health` endpoint
- Add an `Ingress` resource to replace NodePort for clean domain-based routing
- Configure `HorizontalPodAutoscaler` for stateless services (api-gateway, forum-service, etc.)
