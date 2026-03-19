---
title: "Cluster skalieren"
---

# RabbitMQ-Cluster skalieren

Diese Anleitung erklärt, wie Sie die Ressourcen eines RabbitMQ-Clusters auf Hikube anpassen: Anzahl der Replikate, CPU-/Speicherressourcen und Speicherplatz.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **RabbitMQ**-Cluster

## Verfügbare Presets

Hikube bietet vordefinierte Ressourcen-Presets für RabbitMQ:

| Preset | CPU | Speicher |
|--------|-----|----------|
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

:::warning
Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird der Wert von `resourcesPreset` **vollständig ignoriert**. Stellen Sie sicher, dass Sie das Feld `resources` leeren, wenn Sie ein Preset verwenden möchten.
:::

:::note
Die RabbitMQ-Presets unterscheiden sich leicht von anderen Diensten (Kafka, NATS, Datenbanken). Beachten Sie die oben stehende Tabelle für die genauen Werte.
:::

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Cluster-Konfiguration:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

**Beispielergebnis:**

```console
  replicas: 3
  resourcesPreset: small
  resources: {}
  size: 10Gi
```

### 2. Anzahl der Replikate ändern

Die Anzahl der Replikate bestimmt die Anzahl der Knoten im RabbitMQ-Cluster.

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  replicas: 3
'
```

:::warning
Mit weniger als 3 Replikaten können die Quorum Queues die Nachrichtenhaltbarkeit bei Ausfällen nicht gewährleisten. Verwenden Sie **mindestens 3 Replikate** in der Produktion.
:::

**Empfehlungen pro Umgebung:**

| Umgebung | Replikate | Begründung |
|----------|-----------|------------|
| Entwicklung | 1 | Ausreichend für Tests |
| Staging | 3 | Simuliert die Produktion |
| Produktion | 3 oder 5 | Hochverfügbarkeit und Quorum Queues |

### 3. Preset oder explizite Ressourcen ändern

**Option A: Preset ändern**

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
Es ist wichtig, `resources: {}` beim Wechsel zu einem Preset zurückzusetzen, damit das Preset berücksichtigt wird.
:::

**Option B: Explizite Ressourcen definieren**

Für feinere Kontrolle definieren Sie die CPU- und Speicherwerte direkt:

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Sie können auch das vollständige Manifest ändern:

```yaml title="rabbitmq-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated

  users:
    admin:
      password: SecureAdminPassword

  vhosts:
    production:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f rabbitmq-scaled.yaml
```

### 4. Anwenden und überprüfen

Überwachen Sie das Rolling Update der Pods:

```bash
kubectl get po -w | grep my-rabbitmq
```

**Erwartetes Ergebnis (während des Rolling Updates):**

```console
my-rabbitmq-server-0   1/1     Running       0   45m
my-rabbitmq-server-1   1/1     Terminating   0   44m
my-rabbitmq-server-1   0/1     Pending       0   0s
my-rabbitmq-server-1   1/1     Running       0   30s
```

Warten Sie, bis alle Pods im Status `Running` sind:

```bash
kubectl get po | grep my-rabbitmq
```

```console
my-rabbitmq-server-0   1/1     Running   0   10m
my-rabbitmq-server-1   1/1     Running   0   8m
my-rabbitmq-server-2   1/1     Running   0   6m
```

Überprüfen Sie den Status des RabbitMQ-Clusters:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl cluster_status
```

## Überprüfung

Bestätigen Sie, dass die neuen Ressourcen angewendet wurden:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

Überprüfen Sie, ob der Cluster funktionsfähig ist:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl node_health_check
```

**Erwartetes Ergebnis:**

```console
Health check passed
```

## Weiterführende Informationen

- **[RabbitMQ API-Referenz](../api-reference.md)**: Vollständige Dokumentation der Parameter `replicas`, `resources`, `resourcesPreset` und der Preset-Tabelle
- **[Vhosts und Benutzer verwalten](./manage-vhosts-users.md)**: Benutzer und Berechtigungen konfigurieren
