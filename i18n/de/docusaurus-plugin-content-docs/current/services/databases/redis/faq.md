---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Wie funktioniert Redis Sentinel auf Hikube?

Redis auf Hikube wird über den Operator **Spotahome Redis Operator** bereitgestellt, der eine **Redis Sentinel**-Architektur für Hochverfügbarkeit implementiert:

- **Redis Sentinel** überwacht die Redis-Instanzen und führt ein **automatisches Failover** bei Ausfall des Primary durch.
- Ein **Quorum** ist für die Failover-Entscheidung erforderlich: Es werden mindestens **3 Replikas** benötigt, um ein funktionierendes Quorum zu gewährleisten (Mehrheit von 2 von 3).
- Die Clients müssen sich über den **Sentinel-Service** verbinden, um vom automatischen Failover zu profitieren.

```yaml title="redis.yaml"
spec:
  replicas: 3    # Empfohlenes Minimum für das Sentinel-Quorum
```

:::tip
Verwenden Sie in der Produktion immer mindestens 3 Replikas, um das ordnungsgemäße Funktionieren des Sentinel-Quorums zu gewährleisten.
:::

### Was ist der Unterschied zwischen `resourcesPreset` und `resources`?

Das Feld `resourcesPreset` ermöglicht die Auswahl eines vordefinierten Ressourcenprofils für jedes Redis-Replika. Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird `resourcesPreset` **vollständig ignoriert**.

| **Preset** | **CPU** | **Speicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="redis.yaml"
spec:
  # Verwendung eines Presets
  resourcesPreset: small

  # ODER explizite Konfiguration (das Preset wird dann ignoriert)
  resources:
    cpu: 1000m
    memory: 1Gi
```

### Persistiert Redis die Daten?

Ja. Redis auf Hikube verwendet die **RDB/AOF-Persistenz** kombiniert mit persistenten Volumes (PVC). Die Daten werden auf die Festplatte geschrieben und überstehen Pod-Neustarts.

Die Wahl der `storageClass` beeinflusst die Haltbarkeit:

- **`local`**: Daten werden auf dem physischen Knoten persistiert. Schnell, aber anfällig bei Knotenausfall. Empfohlen wenn `replicas` > 1 (Redis Sentinel gewährleistet bereits die HA).
- **`replicated`**: Daten werden auf mehrere Knoten repliziert. Langsamer, aber resilient gegenüber Ausfällen. Empfohlen wenn `replicas` = 1 (replizierter Speicher kompensiert fehlende Anwendungsreplikation).

```yaml title="redis.yaml"
spec:
  size: 2Gi
  storageClass: local    # Wenn replicas > 1 (Sentinel gewährleistet die HA)
```

### Wofür dient der Parameter `authEnabled`?

Wenn `authEnabled` auf `true` steht (Standardwert), wird ein Passwort **automatisch generiert** und in einem Kubernetes-Secret gespeichert. Dieses Passwort ist für jede Verbindung zu Redis erforderlich.

```yaml title="redis.yaml"
spec:
  authEnabled: true    # Standardwert
```

:::warning
Aktivieren Sie in der Produktion immer `authEnabled: true`. Das Deaktivieren der Authentifizierung stellt Ihre Daten jedem Pod bereit, der auf den Redis-Service zugreifen kann.
:::

### Wie skaliere ich Redis?

Um die Anzahl der Redis-Replikas zu erhöhen, ändern Sie das Feld `replicas` in Ihrem Manifest und wenden Sie die Änderung an:

```yaml title="redis.yaml"
spec:
  replicas: 5    # Anzahl der Replikas erhöhen
```

```bash
kubectl apply -f redis.yaml
```

Redis Sentinel **rekonfiguriert automatisch** den Cluster, um die neuen Replikas zu integrieren. Kein manueller Eingriff ist erforderlich.

### Wie verbinde ich mich von einem Pod aus mit Redis?

1. Rufen Sie das Passwort aus dem Secret ab (wenn `authEnabled: true`):
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```

2. Verbinden Sie sich über den **Sentinel**-Service (empfohlen für automatisches Failover):
   ```bash
   # Sentinel-Service
   redis-cli -h rfs-redis-<name> -p 26379 SENTINEL get-master-addr-by-name mymaster
   ```

3. Oder verbinden Sie sich direkt mit dem Redis-Service:
   ```bash
   # Direkter Service
   redis-cli -h rfr-redis-<name> -p 6379 -a <password>
   ```

:::tip
Bevorzugen Sie die Verbindung über den Sentinel-Service (`rfs-redis-<name>`), damit Ihre Anwendungen automatisch dem Primary bei einem Failover folgen.
:::
