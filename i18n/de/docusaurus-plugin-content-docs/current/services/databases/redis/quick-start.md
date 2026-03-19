---
sidebar_position: 2
title: Schnellstart
---

# Redis in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie Schritt für Schritt bei der Bereitstellung Ihres ersten **Redis**-Clusters auf Hikube, vom YAML-Manifest bis zu den ersten Verbindungstests.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen **Redis**-Cluster auf Hikube bereitgestellt
- Eine Architektur bestehend aus einem **Master** und **Replikas** für Hochverfügbarkeit
- **Redis Sentinel** konfiguriert für Auto-Failover
- Einen sicheren Redis-Zugriff mit Ihren Authentifizierungsdaten
- Einen persistenten Speicher zur Datenaufbewahrung über Neustarts hinaus

---

## Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen dedizierten **Namespace** für Ihren Redis-Cluster
- **redis-cli** auf Ihrem Rechner installiert (optional, für Verbindungstests)

---

## Schritt 1: Redis-Manifest erstellen

Erstellen Sie eine Datei `redis.yaml` mit folgender Konfiguration:

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  # Anzahl der Redis-Replikas (Hochverfügbarkeit wenn >1)
  replicas: 3

  # Vordefiniertes Ressourcenprofil (nano, micro, small, medium, large, xlarge, 2xlarge)
  resourcesPreset: nano

  # Oder Ressourcen explizit definieren (ersetzt resourcesPreset)
  resources:
    cpu: 3000m
    memory: 3Gi

  # Größe der persistenten Festplatte pro Instanz
  size: 1Gi
  storageClass: ""

  # Redis-Authentifizierung aktivieren
  authEnabled: true

  # Redis-Service extern freigeben
  external: true
```

:::tip
Wenn `resources` definiert ist, wird der Wert von `resourcesPreset` ignoriert. Konsultieren Sie die [API-Referenz](./api-reference.md) für die vollständige Liste der verfügbaren Presets.
:::

---

## Schritt 2: Redis-Cluster bereitstellen

Wenden Sie das Manifest an und überprüfen Sie, dass die Bereitstellung startet:

```bash
# Manifest anwenden
kubectl apply -f redis.yaml
```

Überprüfen Sie den Clusterstatus (kann 1-2 Minuten dauern):

```bash
kubectl get redis
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    1m39s   0.10.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass alle Pods den Status `Running` haben:

```bash
kubectl get po -o wide | grep redis
```

**Erwartetes Ergebnis:**

```console
rfr-redis-example-0                               2/2     Running     0     7m7s    10.244.2.109   gld-csxhk-006   <none>   <none>
rfr-redis-example-1                               2/2     Running     0     7m7s    10.244.2.114   luc-csxhk-005   <none>   <none>
rfr-redis-example-2                               2/2     Running     0     7m7s    10.244.2.111   plo-csxhk-004   <none>   <none>
rfs-redis-example-7b65c79ccb-dkqqz                1/1     Running     0     7m7s    10.244.2.112   luc-csxhk-005   <none>   <none>
rfs-redis-example-7b65c79ccb-kvjt8                1/1     Running     0     7m7s    10.244.2.108   gld-csxhk-006   <none>   <none>
rfs-redis-example-7b65c79ccb-xwk7v                1/1     Running     0     7m7s    10.244.2.110   plo-csxhk-004   <none>   <none>
```

Mit `replicas: 3` erhalten Sie **6 Pods** auf verschiedenen Rechenzentren verteilt:

| Präfix | Rolle | Anzahl |
|---------|------|--------|
| `rfr-redis-example-*` | **Redis** (Master + Replikas) | 3 |
| `rfs-redis-example-*` | **Redis Sentinel** (Überwachung und Auto-Failover) | 3 |

---

## Schritt 4: Anmeldedaten abrufen

Wenn `authEnabled: true`, wird ein Passwort automatisch in einem Kubernetes-Secret generiert:

```bash
kubectl get secret redis-example-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
password: QkP9bhppEFCQcXIXLzEAhAUBlMYEVFNZ
```

---

## Schritt 5: Verbindung und Tests

### Externer Zugriff (wenn `external: true`)

Rufen Sie die externe IP des LoadBalancers ab:

```bash
kubectl get svc | grep redis
```

```console
redis-example-external-lb            LoadBalancer   10.96.156.151   91.223.132.41   6379/TCP    13m
redis-example-metrics                ClusterIP      10.96.58.67     <none>          9121/TCP    13m
rfr-redis-example                    ClusterIP      None            <none>          9121/TCP    13m
rfrm-redis-example                   ClusterIP      10.96.109.194   <none>          6379/TCP    13m
rfrs-redis-example                   ClusterIP      10.96.118.28    <none>          6379/TCP    13m
rfs-redis-example                    ClusterIP      10.96.176.169   <none>          26379/TCP   13m
```

Der Service `redis-example-external-lb` stellt Redis über die externe IP `91.223.132.41` bereit.

### Zugriff über Port-Forward (wenn `external: false`)

```bash
kubectl port-forward svc/rfrm-redis-example 6379:6379 &
```

### Tests mit redis-cli

```bash
# Passwort abrufen
REDIS_PASSWORD=$(kubectl get secret redis-example-auth -o jsonpath="{.data.password}" | base64 -d)

# Test PING
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" ping
# PONG

# Schlüssel erstellen
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" SET hello "hikube"
# OK

# Schlüssel lesen
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" GET hello
# "hikube"
```

:::note
Wenn Sie Port-Forward verwenden, ersetzen Sie `91.223.132.41` durch `127.0.0.1` in den obigen Befehlen.
Es wird empfohlen, die Datenbank nicht extern freizugeben, wenn dies nicht erforderlich ist.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Pods prüfen
kubectl logs rfr-redis-example-0

# Events prüfen
kubectl describe pod rfr-redis-example-0
```

**Häufige Ursachen:** Unzureichender Speicher (`resources.memory` zu niedrig), Speichervolumen voll.

### Redis nicht erreichbar

```bash
# Prüfen, ob der Service existiert
kubectl get svc | grep redis

# Prüfen, ob der LoadBalancer eine externe IP hat
kubectl describe svc redis-example-external-lb
```

**Häufige Ursachen:** `external: false` im Manifest, LoadBalancer wartet auf IP-Zuweisung.

### Sentinel erkennt den Master nicht

```bash
# Sentinel-Logs prüfen
kubectl logs rfs-redis-example-7b65c79ccb-dkqqz

# Sentinel-Topologie prüfen
kubectl exec -it rfs-redis-example-7b65c79ccb-dkqqz -- redis-cli -p 26379 SENTINEL masters
```

### Allgemeine Diagnosebefehle

```bash
# Letzte Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des Redis-Clusters
kubectl describe redis example
```

---

## Schritt 7: Bereinigung

Um die Testressourcen zu entfernen:

```bash
kubectl delete -f redis.yaml
```

:::warning
Diese Aktion löscht den Redis-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben bereitgestellt:

- Einen Redis-Cluster mit **3 Replikas** auf verschiedenen Rechenzentren verteilt
- **3 Sentinel-Pods** für Überwachung und Auto-Failover
- Einen sicheren Zugriff mit automatisch generiertem Passwort
- Einen persistenten Speicher für die Datenhaltbarkeit

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller Redis-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle für Redis auf Hikube
