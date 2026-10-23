---
sidebar_position: 6
title: "FAQ — PostgreSQL"
sidebar_label: FAQ
description: "Antworten auf häufige Fragen zu PostgreSQL auf Hikube: Presets, Replikate, Verbindungsadresse, verlorenes Passwort, abgelehnte Namen, Erweiterungen und Backups."
---

# FAQ — PostgreSQL

### Welche Instanz-Presets sind verfügbar?

Das **Instance preset** legt CPU und Arbeitsspeicher jedes Knotens des Clusters fest. Die Presets entsprechen den Größen der [virtuellen Maschinen](../../compute/overview.md) der Serien `u1`, `s1` und `m1`: Ein Preset hat dieselben Ressourcen wie die gleichnamige VM. Maßgeblich ist die im Assistenten angezeigte Liste:

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

Das Preset kann nach der Erstellung über **Edit** geändert werden. Die Festlegung freier CPU-/Arbeitsspeicherwerte wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Wie viele Replicas sollte ich wählen?

- **1 (Standalone)**: Entwicklung und Tests. Ein Ausfall der Instanz macht die Datenbank bis zu ihrem Neustart unverfügbar.
- **2 (High Availability)**: Ein Standby ist bereit, bei einem Ausfall des Primary zu übernehmen.
- **3 (Max High Availability)**: empfohlen für kritische Produktion.

Die Anzahl der Replicas kann nach der Erstellung nicht geändert werden; wenden Sie sich an den Support, wenn Sie sie ändern müssen.

### Wo finde ich die Verbindungsadresse?

Auf der Seite des Clusters, in der Karte **Connection and Databases**. Der Bereich **Internal** zeigt immer den internen Host an; der Bereich **External** zeigt die öffentliche Adresse an, wenn der **External Access** aktiviert ist, andernfalls **Disabled**. Der Port ist `5432`.

### Wie verbinde ich mich ohne externen Zugriff von einer VM oder einem Kubernetes-Cluster desselben Projekts?

Verwenden Sie den Host aus dem Bereich **Internal** auf Port `5432`: Er ist von den VMs und Kubernetes-Clustern des Projekts aus erreichbar, ohne externen Zugriff, aber nicht aus einem anderen Projekt. Kopieren Sie den vollständigen Namen; bei einer Debian-13-VM siehe [Einen verwalteten Dienst des Projekts erreichen](../../compute/how-to/configure-network.md#einen-verwalteten-dienst-des-projekts-erreichen).

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Passwörter werden nur einmal angezeigt und können nicht erneut gelesen werden. Generieren Sie ein neues: Registerkarte **Users** → **Actions** → **Change Password** → **Perform rotation**. Das alte Passwort wird sofort widerrufen.

### Warum wird mein Benutzername abgelehnt?

PostgreSQL-Benutzernamen sind 3 bis 16 Zeichen lang, bestehen aus Kleinbuchstaben, Ziffern und Unterstrichen (`_`) und beginnen mit einem Buchstaben oder einem Unterstrich. Der Bindestrich (`-`) wird nicht akzeptiert. Die Namen `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica` und alle Namen, die mit `pg_` beginnen, sind reserviert.

### Warum wird mein Datenbankname abgelehnt?

Ein Datenbankname ist 1 bis 54 Zeichen lang: Kleinbuchstaben, Ziffern, Unterstriche (`_`) und Bindestriche (`-`). Er beginnt mit einem Buchstaben oder einem Unterstrich, aber nicht mit `pg_`. Die Systemdatenbanken `postgres`, `template0` und `template1` können nicht erstellt werden.

### Warum ist ein Recht auf der Datenbank `postgres` gesperrt?

`postgres`, `template0` und `template1` sind Systemdatenbanken, die der Plattform vorbehalten sind: Auf ihnen kann kein Recht mehr vergeben oder geändert werden. Der Assistent zur Clustererstellung hat früher die Datenbank `postgres` für die Benutzer vorausgewählt; die so vergebenen Rechte bleiben erhalten. In **Manage Access** wird eine solche Zeile gesperrt und mit einem Warnhinweis angezeigt: Entfernen Sie sie und geben Sie dem Benutzer dann Zugriff auf eine Anwendungsdatenbank.

### Wie füge ich PostgreSQL-Erweiterungen hinzu?

Bei der Erstellung einer Datenbank (Registerkarte **Databases** → **Create**, Abschnitt **PostgreSQL Extensions**) oder später über **Actions** → **Manage extensions**. Zu den angebotenen Erweiterungen gehören unter anderem `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` und `vector` (pgvector).

### Kann ich mehrere Datenbanken und Benutzer erstellen?

Ja. Fügen Sie in der Registerkarte **Databases** so viele Datenbanken wie nötig und in der Registerkarte **Users** so viele Benutzer wie nötig hinzu. Jeder Benutzer kann auf jeder Datenbank ein anderes Recht haben (**Administrator (Admin)** oder **Read-only**).

### Kann ich PostgreSQL-Parameter ändern (`max_connections`, `shared_buffers` …)?

Diese Parameter werden in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Sind Backups verfügbar?

Die Konfiguration von Backups und die Wiederherstellung werden in der Konsole nicht angeboten; wenden Sie sich an den Support. Siehe [Backups konfigurieren](./how-to/configure-backups.md).
