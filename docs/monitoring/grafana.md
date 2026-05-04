# Grafana

## What is it?

Grafana is an open-source observability and visualization platform. It queries Prometheus (and other data sources) and renders metrics as interactive dashboards with panels, graphs, alerts, and annotations.

## Why we use it

- **Visual dashboards** — charts for HTTP rates, JVM memory, DB pool usage, error rates — all in one place
- **Alerting** — notify on threshold breaches (e.g., error rate > 5%, heap > 80%)
- **Provisioning as code** — datasources and dashboards are defined in YAML files, version-controlled alongside the application
- **Prometheus integration** — the provisioned `prometheus.yml` datasource connects automatically on startup, no manual setup

## Provisioning

Grafana is configured via files under `monitoring/grafana/provisioning/`.

### Datasource — `monitoring/grafana/provisioning/datasources/prometheus.yml`

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

This file is mounted into the Grafana container. On startup, Grafana automatically creates the Prometheus data source — no manual UI configuration needed.

## Running Grafana

Add Grafana to your Compose stack:

```yaml
grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  volumes:
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
  depends_on:
    - prometheus
```

Access Grafana at **http://localhost:3000** (default credentials: `admin` / `admin`).

## Recommended Dashboards

Import these community dashboards from **Dashboards → Import** using the dashboard ID:

| Dashboard              | ID   | What it shows                                   |
| ---------------------- | ---- | ----------------------------------------------- |
| JVM (Micrometer)       | 4701 | Heap, GC, threads, classloaders per service     |
| Spring Boot Statistics | 6756 | HTTP request rates, error rates, response times |
| Docker Host            | 893  | Container CPU, memory, network                  |
| MySQL Overview         | 7362 | Queries/sec, connections, slow queries          |

## Key Metrics to Monitor

| Metric                  | PromQL                                                                                       | Alert threshold  |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| HTTP error rate         | `rate(http_server_requests_seconds_count{status=~"5.."}[5m])`                                | > 1% of requests |
| JVM heap usage          | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}`                     | > 85%            |
| API Gateway latency p99 | `histogram_quantile(0.99, rate(http_server_requests_seconds_bucket{job="api-gateway"}[5m]))` | > 2s             |
| DB connection pool      | `hikaricp_connections_active / hikaricp_connections_max`                                     | > 90%            |
