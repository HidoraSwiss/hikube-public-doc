---
title: "Redis-Hochverfügbarkeit konfigurieren"
---

# Redis-Hochverfügbarkeit konfigurieren

Diese Anleitung erklärt, wie Sie einen hochverfügbaren Redis-Cluster auf Hikube bereitstellen. Der Dienst basiert auf dem Operator **Spotahome Redis Operator**, der **Redis Sentinel** für automatisches Failover verwendet, wenn 3 oder mehr Replikas konfiguriert sind.

## Voraussetzungen

- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Grundkenntnisse über Redis (siehe [Schnellstart](../quick-start.md))
- Eine Produktionsumgebung, die Hochverfügbarkeit erfordert

## Schritte

### 1. Manifest mit 3+ Replikas konfigurieren

Um Hochverfügbarkeit zu aktivieren, konfigurieren Sie mindestens 3 Replikas. Redis Sentinel wird automatisch vom Spotahome-Operator bereitgestellt, um die Leader-Wahl und das Failover zu orchestrieren:

```yaml title="redis-ha.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis-ha
spec:
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

:::note
Die `storageClass: replicated` garantiert, dass die persistenten Volumes auf Speicherebene repliziert werden und die Daten gegen den Verlust eines physischen Knotens schützen.
:::

### 2. Konfiguration anwenden

```bash
kubectl apply -f redis-ha.yaml
```

### 3. Redis-Cluster überprüfen

Warten Sie, bis alle Pods bereit sind:

```bash
# Status der Redis-Pods prüfen
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha -w
```

**Erwartetes Ergebnis:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-redis-ha-0       1/1     Running   0          3m
my-redis-ha-1       1/1     Running   0          2m
my-redis-ha-2       1/1     Running   0          1m
```

Überprüfen Sie auch den Status von Redis Sentinel:

```bash
# Sentinel-Pods prüfen
kubectl get pods -l app.kubernetes.io/component=sentinel,app.kubernetes.io/instance=my-redis-ha
```

### 4. Automatisches Failover verstehen

Mit 3 Replikas gewährleistet Redis Sentinel folgende Funktionen:

- **Ausfallerkennung**: Sentinel überwacht kontinuierlich den Master-Knoten und die Replikas
- **Automatische Wahl**: Wenn der Master ausfällt, wählt Sentinel einen neuen Master unter den verfügbaren Replikas
- **Rekonfiguration**: Die verbleibenden Replikas werden automatisch rekonfiguriert, um vom neuen Master zu replizieren

:::tip
Das Failover ist vollständig automatisch. Kein manueller Eingriff ist erforderlich. Die Umschaltzeit beträgt in der Regel wenige Sekunden.
:::

### 5. Passwort abrufen

Mit `authEnabled: true` wird ein Passwort automatisch generiert und in einem Kubernetes-Secret gespeichert:

```bash
# Secret-Name abrufen
kubectl get secrets | grep my-redis-ha

# Passwort extrahieren
kubectl get secret my-redis-ha -o jsonpath='{.data.password}' | base64 -d
```

:::warning
Aktivieren Sie in der Produktion immer `authEnabled: true`. Ohne Authentifizierung kann jede Anwendung mit Zugriff auf das Cluster-Netzwerk in Redis lesen und schreiben.
:::

## Überprüfung

Überprüfen Sie, dass der HA-Cluster korrekt funktioniert:

```bash
# Redis-Ressource prüfen
kubectl get redis my-redis-ha

# Prüfen, ob alle Pods Running sind
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha

# Freigegebene Services prüfen
kubectl get svc -l app.kubernetes.io/instance=my-redis-ha
```

**Erwartetes Ergebnis:**

```console
NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
my-redis-ha              ClusterIP   10.96.xxx.xxx   <none>        6379/TCP    5m
my-redis-ha-sentinel     ClusterIP   10.96.xxx.xxx   <none>        26379/TCP   5m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `replicas`, `authEnabled` und `storageClass`
- [Redis vertikal skalieren](./scale-resources.md) -- CPU- und Speicherressourcen anpassen
