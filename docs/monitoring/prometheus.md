# Prometheus

## What is it?

Prometheus is an open-source time-series monitoring system. It scrapes metrics from application `/actuator/prometheus` endpoints on a configurable interval and stores them for querying and alerting.

## Why we use it

- **Native Spring Boot integration** — `spring-boot-starter-actuator` + `micrometer-registry-prometheus` exposes metrics with zero code
- **Pull model** — Prometheus polls services; services don't need to know about the monitoring system
- **Rich metrics** — JVM memory, GC pauses, HTTP request rates, active connections, custom business metrics
- **Grafana data source** — Prometheus feeds directly into Grafana dashboards for visualization

## Configuration: `monitoring/prometheus.yml`

Prometheus scrapes all 9 backend services every 15 seconds:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "api-gateway"
    metrics_path: /actuator/prometheus
    static_configs:
      - targets: ["api-gateway:8080"]
  # ... (repeated for each service)
```

All services are reachable by their Docker Compose service name on the internal Docker network.

## Running Prometheus

Add a Prometheus service to your Compose override or use the monitoring stack:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"
```

Access the Prometheus UI at **http://localhost:9090**.

## Enabling Metrics on Backend Services

Each Spring Boot service needs these dependencies in its `pom.xml`:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

And in the service's config (via Config Server):

```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.prometheus.enabled=true
```

## Useful PromQL Queries

```promql
# HTTP request rate per service
rate(http_server_requests_seconds_count[5m])

# JVM heap usage
jvm_memory_used_bytes{area="heap"}

# Active HTTP connections
tomcat_connections_active_current_connections

# GC pause time
rate(jvm_gc_pause_seconds_sum[5m])
```
