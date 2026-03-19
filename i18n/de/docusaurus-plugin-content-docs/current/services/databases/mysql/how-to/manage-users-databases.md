---
title: "Benutzer und Datenbanken verwalten"
---

# Benutzer und Datenbanken verwalten

Diese Anleitung erklärt, wie Sie Benutzer, Datenbanken und Zugriffsrollen Ihrer MySQL-Instanz auf Hikube erstellen und verwalten. Sie erfahren auch, wie Sie den Primary-Knoten in einem replizierten Cluster wechseln.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **MySQL**-Instanz auf Ihrem Tenant bereitgestellt
- Ein **mysql**-Client zum Testen der Verbindungen

## Schritte

### 1. Benutzer hinzufügen

Benutzer werden im Abschnitt `users` des Manifests definiert. Jeder Benutzer wird durch einen Namen identifiziert und kann ein Passwort und ein Verbindungslimit haben:

```yaml title="mysql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10
```

| Parameter | Beschreibung | Standard |
|---|---|---|
| `users[name].password` | Passwort des Benutzers | `""` |
| `users[name].maxUserConnections` | Maximale gleichzeitige Verbindungen für diesen Benutzer | `0` (unbegrenzt) |

:::tip
Begrenzen Sie `maxUserConnections` pro Benutzer, um zu verhindern, dass eine Anwendung alle verfügbaren Serververbindungen verbraucht.
:::

### 2. Datenbank mit Rollen erstellen

Datenbanken werden im Abschnitt `databases` definiert. Jede Datenbank kann die Rollen **admin** (Lesen/Schreiben) oder **readonly** (nur Lesen) an Benutzer vergeben:

```yaml title="mysql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: SecureAppPassword
      maxUserConnections: 100
    analytics:
      password: SecureAnalyticsPassword
      maxUserConnections: 20
    readonly:
      password: SecureReadOnlyPassword
      maxUserConnections: 10

  databases:
    production:
      roles:
        admin:
          - appuser
        readonly:
          - readonly
          - analytics
    analytics_db:
      roles:
        admin:
          - analytics
        readonly:
          - readonly
```

:::note
Ein Benutzer kann unterschiedliche Rollen für verschiedene Datenbanken haben. Zum Beispiel ist `analytics` **admin** auf `analytics_db`, aber **readonly** auf `production`.
:::

### 3. Änderungen anwenden

Wenden Sie das Manifest an, um Benutzer und Datenbanken zu erstellen oder zu aktualisieren:

```bash
kubectl apply -f mysql-databases.yaml
```

### 4. Anmeldedaten abrufen

Die Passwörter sind in einem Kubernetes-Secret namens `<instance>-credentials` gespeichert:

```bash
kubectl get secret example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
root: cr42msoxKhnEajfo
appuser: SecureAppPassword
analytics: SecureAnalyticsPassword
readonly: SecureReadOnlyPassword
```

:::tip
Das `root`-Passwort wird automatisch vom Operator generiert. Verwenden Sie es nur für die Cluster-Administration, niemals in Ihren Anwendungen.
:::

### 5. Verbindung testen

#### Über Port-Forward (interner Zugriff)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

```bash
mysql -h 127.0.0.1 -P 3306 -u appuser -p production
```

#### Über LoadBalancer (wenn `external: true`)

```bash
# Externe IP abrufen
kubectl get svc mysql-example-primary -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

```bash
mysql -h <EXTERNE_IP> -P 3306 -u appuser -p production
```

Überprüfen Sie die Benutzerrechte:

```sql
-- Als appuser (admin auf production)
SHOW DATABASES;
CREATE TABLE test (id INT PRIMARY KEY);
INSERT INTO test VALUES (1);

-- Als readonly (nur Lesen auf production)
SELECT * FROM test;       -- OK
INSERT INTO test VALUES (2);  -- FEHLER: Zugriff verweigert
```

### 6. Primary-Knoten wechseln (optional)

In einem replizierten MySQL-Cluster ist ein Knoten als **Primary** (Schreibvorgänge) und die anderen als **Replikas** (Lesevorgänge) designiert. Sie können die Primary-Rolle auf einen anderen Knoten wechseln, z.B. für Wartungsarbeiten.

#### MariaDB-Ressource bearbeiten

```bash
kubectl edit mariadb mysql-example
```

Ändern Sie den Abschnitt `replication`, um den neuen Primary zu designieren:

```yaml title="switchover.yaml"
spec:
  replication:
    primary:
      podIndex: 1   # mysql-example-1 zum Primary befördern
```

#### Wechsel überprüfen

```bash
kubectl get mariadb
```

**Erwartetes Ergebnis:**

```console
NAME            READY   STATUS    PRIMARY           UPDATES                    AGE
mysql-example   True    Running   mysql-example-1   ReplicasFirstPrimaryLast   84m
```

:::warning
Der Primary-Wechsel kann eine **kurze Unterbrechung der Schreibvorgänge** während der Beförderung des neuen Knotens verursachen. Lesevorgänge bleiben über die Replikas verfügbar.
:::

## Überprüfung

Überprüfen Sie die vollständige Konfiguration Ihrer Instanz:

```bash
kubectl get mariadb example -o yaml
```

Stellen Sie sicher, dass:
- Die Benutzer im Abschnitt `users` vorhanden sind
- Die Datenbanken im Abschnitt `databases` aufgelistet sind
- Die Rollen korrekt zugewiesen sind

## Weiterführende Informationen

- [API-Referenz](../api-reference.md): Vollständige Liste der Benutzer- und Datenbankparameter
- [Vertikal skalieren](./scale-resources.md): CPU- und Speicherressourcen anpassen
