---
title: "Benutzer und Datenbanken verwalten"
---

# Benutzer und Datenbanken verwalten

Diese Anleitung erklärt, wie Sie Benutzer, Datenbanken, Rollen und PostgreSQL-Erweiterungen auf Hikube deklarativ über Kubernetes-Manifeste erstellen und verwalten.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Eine **PostgreSQL**-Instanz auf Hikube bereitgestellt (oder ein Manifest zur Bereitstellung)
- (Optional) **psql** lokal installiert zum Testen der Verbindung

## Schritte

### 1. Benutzer hinzufügen

Benutzer werden im Abschnitt `users` des Manifests deklariert. Jeder Benutzer wird durch einen Namen identifiziert und hat ein Passwort.

```yaml title="postgresql-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789
    replicator:
      password: ReplicatorPassword
      replication: true
```

**Benutzerparameter:**

| Parameter | Typ | Beschreibung |
|-----------|------|-------------|
| `users[name].password` | `string` | Passwort des Benutzers |
| `users[name].replication` | `bool` | Gewährt dem Benutzer das Replikationsrecht |

:::note
Das `replication`-Recht wird für Benutzer benötigt, die von Change Data Capture (CDC)-Tools wie Debezium oder für die logische PostgreSQL-Replikation verwendet werden. Aktivieren Sie es nur, wenn Sie es benötigen.
:::

### 2. Datenbanken mit Rollen erstellen

Datenbanken werden im Abschnitt `databases` deklariert. Jede Datenbank kann die Rollen `admin` und `readonly` definieren, die den in `users` deklarierten Benutzern zugewiesen werden.

```yaml title="postgresql-databases.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
```

**Verfügbare Rollen:**

| Rolle | Beschreibung |
|------|-------------|
| `admin` | Vollständiger Lese-/Schreibzugriff auf die Datenbank |
| `readonly` | Nur-Lese-Zugriff auf die Datenbank |

:::tip
Befolgen Sie das Prinzip der geringsten Rechte: Gewähren Sie die Rolle `admin` nur Benutzern, die sie wirklich benötigen. Verwenden Sie `readonly` für Reporting- oder Monitoring-Dienste.
:::

### 3. Erweiterungen aktivieren

PostgreSQL-Erweiterungen werden pro Datenbank über das Feld `extensions` aktiviert:

```yaml title="postgresql-extensions.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
      extensions:
        - hstore
        - uuid-ossp
        - pgcrypto
```

**Gängige Erweiterungen:**

| Erweiterung | Beschreibung |
|-----------|-------------|
| `hstore` | Schlüssel-Wert-Datentyp |
| `uuid-ossp` | Generierung von UUID-Identifikatoren |
| `pgcrypto` | Kryptografische Funktionen (Hashing, Verschlüsselung) |

### 4. Änderungen anwenden

Kombinieren Sie alle Elemente in einem einzigen Manifest und wenden Sie es an:

```yaml title="postgresql-complete.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 2
  resourcesPreset: medium
  size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
      replication: true
    appuser:
      password: AppUserPassword456
    readonly:
      password: ReadOnlyPassword789

  databases:
    myapp:
      roles:
        admin:
          - admin
          - appuser
        readonly:
          - readonly
      extensions:
        - hstore
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - readonly
      extensions:
        - pgcrypto
```

```bash
kubectl apply -f postgresql-complete.yaml
```

### 5. Anmeldedaten abrufen

Die Benutzerpasswörter sind in einem Kubernetes-Secret gespeichert. Rufen Sie sie ab mit:

```bash
kubectl get secret postgres-my-database-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
admin: SecureAdminPassword
appuser: AppUserPassword456
readonly: ReadOnlyPassword789
```

:::note
Wenn Sie kein Passwort für einen Benutzer angeben, generiert der Operator automatisch eines. Verwenden Sie den obigen Befehl, um es abzurufen.
:::

### 6. Verbindung testen

Öffnen Sie einen Port-Forward zum PostgreSQL-Service:

```bash
kubectl port-forward svc/postgres-my-database-rw 5432:5432
```

Verbinden Sie sich mit `psql`:

```bash
psql -h 127.0.0.1 -U appuser myapp
```

Überprüfen Sie die Benutzer und Rollen:

```sql
-- Benutzer auflisten
\du

-- Datenbanken auflisten
\l

-- Installierte Erweiterungen überprüfen
\dx
```

**Erwartetes Ergebnis für `\du`:**

```console
                                 List of roles
     Role name      |                         Attributes
--------------------+------------------------------------------------------------
 admin              | Replication
 appuser            |
 myapp_admin        | No inheritance, Cannot login
 myapp_readonly     | No inheritance, Cannot login
 analytics_admin    | No inheritance, Cannot login
 analytics_readonly | No inheritance, Cannot login
 postgres           | Superuser, Create role, Create DB, Replication, Bypass RLS
 readonly           |
```

## Überprüfung

Die Konfiguration ist erfolgreich, wenn:

- Die Benutzer in `\du` mit den korrekten Attributen erscheinen
- Die Datenbanken in `\l` aufgelistet sind
- Die Erweiterungen aktiv sind (überprüfbar mit `\dx` in jeder Datenbank)
- Jeder Benutzer sich mit seinem Passwort verbinden kann
- Die `readonly`-Benutzer keine Daten ändern können

## Weiterführende Informationen

- **[API-Referenz PostgreSQL](../api-reference.md)**: Vollständige Dokumentation der Parameter `users`, `databases` und `extensions`
- **[Schnellstart PostgreSQL](../quick-start.md)**: Eine vollständige PostgreSQL-Instanz bereitstellen
