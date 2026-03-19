---
sidebar_position: 2
title: FAQ
---

# Häufig gestellte Fragen

Hier finden Sie Antworten auf die häufigsten Fragen zur Nutzung von Hikube.

---

## 1. Wie rufe ich meine kubeconfig ab?

Sobald Ihr Kubernetes-Cluster bereitgestellt ist, rufen Sie die kubeconfig ab mit:

```bash
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

export KUBECONFIG=my-cluster-kubeconfig.yaml
kubectl get nodes
```

Siehe: [Kubernetes - Schnellstart](../services/kubernetes/quick-start.md)

---

## 2. Wie rufe ich die Zugangsdaten meiner Datenbank ab?

Die Zugangsdaten sind in einem Kubernetes-Secret gespeichert. Der Befehl variiert je nach Dienst:

```bash
# Redis
kubectl get secret redis-<name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# PostgreSQL
kubectl get secret pg-<name>-app -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# MySQL
kubectl get secret mysql-<name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Siehe: [Redis - Schnellstart](../services/databases/redis/quick-start.md), [PostgreSQL - Schnellstart](../services/databases/postgresql/quick-start.md), [MySQL - Schnellstart](../services/databases/mysql/quick-start.md)

---

## 3. Wie mache ich einen Dienst extern erreichbar?

Zwei Optionen stehen zur Verfügung:

**Option 1: Externer Zugang über LoadBalancer** (empfohlen für die Produktion)

Fügen Sie `external: true` im YAML-Manifest Ihres Dienstes hinzu. Ein LoadBalancer mit einer öffentlichen IP wird automatisch erstellt.

```yaml
spec:
  external: true
```

**Option 2: Port-Forward** (empfohlen für die Entwicklung)

```bash
kubectl port-forward svc/<service-name> <lokaler-port>:<service-port>
```

:::note
Es wird empfohlen, Datenbanken nicht extern zu exponieren, wenn Sie dies nicht benötigen.
:::

---

## 4. Was ist der Unterschied zwischen `resources` und `resourcesPreset`?

- **`resourcesPreset`**: Vordefiniertes Profil (nano, micro, small, medium, large, xlarge, 2xlarge), das automatisch CPU und Arbeitsspeicher zuweist.
- **`resources`**: Ermöglicht die **explizite** Definition von CPU- und Arbeitsspeicher-Werten.

Wenn `resources` definiert ist, wird `resourcesPreset` **ignoriert**.

| Preset | CPU | Arbeitsspeicher |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Siehe: [Redis - API-Referenz](../services/databases/redis/api-reference.md)

---

## 5. Wie wähle ich meinen instanceType für Kubernetes?

Der Parameter `instanceType` in den `nodeGroups` bestimmt die Ressourcen jedes Worker-Knotens:

| Instance Type | vCPU | RAM |
|---------------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |

Wählen Sie entsprechend Ihrer Workloads:
- **Klassische Webanwendungen**: `s1.large` (gutes Kosten-Leistungs-Verhältnis)
- **Speicherintensive Anwendungen**: `s1.xlarge` oder `s1.2xlarge`
- **Entwicklungsumgebungen**: `s1.small` oder `s1.medium`

Siehe: [Kubernetes - API-Referenz](../services/kubernetes/api-reference.md)

---

## 6. Wie aktiviere ich S3-Backups?

Für Datenbanken, die dies unterstützen (PostgreSQL, ClickHouse), fügen Sie den Abschnitt `backup` in Ihrem Manifest hinzu:

```yaml
spec:
  backup:
    enabled: true
    s3:
      endpoint: "https://s3.example.com"
      bucket: "my-backups"
      accessKey: "ACCESS_KEY"
      secretKey: "SECRET_KEY"
```

Siehe: [PostgreSQL - API-Referenz](../services/databases/postgresql/api-reference.md)

---

## 7. Wie greife ich auf Grafana und meine Dashboards zu?

Wenn das Monitoring in Ihrem Tenant aktiviert ist, ist Grafana über eine dedizierte URL erreichbar. Um sie zu finden:

```bash
# Monitoring-Ingress überprüfen
kubectl get ingress -n monitoring

# Oder Services überprüfen
kubectl get svc -n monitoring | grep grafana
```

Die Dashboards sind für jeden Ressourcentyp vorkonfiguriert (Kubernetes, Datenbanken, VMs usw.).

Siehe: [Schlüsselkonzepte - Observability](../getting-started/concepts.md)

---

## 8. Wie skaliere ich meinen Cluster?

### Replicas einer Datenbank skalieren

Ändern Sie das Feld `replicas` in Ihrem Manifest und wenden Sie es erneut an:

```yaml
spec:
  replicas: 5  # Anzahl der Replicas erhöhen
```

```bash
kubectl apply -f <manifest>.yaml
```

### Kubernetes-Knoten skalieren

Die Knoten skalieren automatisch zwischen `minReplicas` und `maxReplicas` je nach Last. Um die Grenzen zu ändern, passen Sie die `nodeGroup`-Konfiguration an:

```yaml
spec:
  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 10
```

Siehe: [Kubernetes - Schnellstart](../services/kubernetes/quick-start.md)

---

## 9. Welche storageClass sind verfügbar?

| StorageClass | Beschreibung |
|-------------|-------------|
| `""` (Standard) | Standardspeicher, Daten in einem einzelnen Rechenzentrum |
| `replicated` | Replizierter Speicher über mehrere Rechenzentren, Hochverfügbarkeit |

Verwenden Sie `replicated` für Produktions-Workloads, die Toleranz gegenüber Hardware-Ausfällen erfordern.

```yaml
spec:
  storageClass: replicated
```

Siehe: [Kubernetes - API-Referenz](../services/kubernetes/api-reference.md)

---

## 10. Wie funktioniert das Auto-Failover bei Datenbanken?

Jeder verwaltete Datenbankdienst verfügt über einen Auto-Failover-Mechanismus:

| Dienst | Mechanismus | Funktionsweise |
|---------|-----------|----------------|
| **Redis** | Redis Sentinel | Überwacht den Master, befördert automatisch ein Replica bei Ausfall |
| **PostgreSQL** | CloudNativePG | Ausfallerkennung und automatische Beförderung eines Standby |
| **MySQL** | MySQL Operator | Semi-synchrone Replikation mit automatischem Failover |
| **ClickHouse** | ClickHouse Keeper | Verteilter Konsens für die Koordination von Shards und Replicas |
| **RabbitMQ** | Quorum Queues | Raft-Replikation für Fehlertoleranz der Nachrichten |

Auto-Failover ist **standardmässig aktiviert**, wenn `replicas > 1`. Keine zusätzliche Konfiguration ist erforderlich.

Siehe: [Redis - Übersicht](../services/databases/redis/overview.md), [PostgreSQL - Übersicht](../services/databases/postgresql/overview.md)

---

## 11. Warum gibt `kubectl get ... -A` "Forbidden" zurück?

Das Flag `-A` (`--all-namespaces`) führt eine Abfrage auf **Cluster-Ebene** (Cluster Scope) durch. Tenant-Benutzer verfügen jedoch nur über **auf ihren Namespace beschränkte Rollen**. Kubernetes filtert nicht automatisch die autorisierten Namespaces: Die Cluster-Scope-Abfrage wird vollständig abgelehnt.

**Lösung:** Verwenden Sie nicht `-A`. Ihre kubeconfig definiert bereits Ihren Ziel-Namespace, die Befehle funktionieren direkt:

```bash
# Korrekt
kubectl get pods
kubectl get kubernetes

# Falsch (Forbidden)
kubectl get pods -A
kubectl get kubernetes -A
```

Die `kubectl config`-Befehle (lokal) sind davon nicht betroffen:
```bash
# Funktioniert immer
kubectl config current-context
kubectl config get-contexts
```
