---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Welche Instanz-Presets sind verfügbar?

Das **Instance preset** legt CPU und Arbeitsspeicher jedes Knotens des Clusters fest. Maßgeblich ist die im Assistenten angezeigte Liste; zur Orientierung:

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Das Preset kann nach der Erstellung über **Edit** geändert werden. Die Festlegung freier CPU-/Arbeitsspeicherwerte wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Wie viele Replicas sollte ich wählen?

- **1 (Standalone)**: Entwicklung und Tests. Ein Ausfall der Instanz macht die Datenbank bis zu ihrem Neustart unverfügbar.
- **2 (High Availability)**: Ein Standby ist bereit, bei einem Ausfall des Primary zu übernehmen.
- **3 (Max High Availability)**: empfohlen für kritische Produktion.

Die Anzahl der Replicas kann nach der Erstellung nicht geändert werden; wenden Sie sich an den Support, wenn Sie sie ändern müssen.

### Wo finde ich die Verbindungsadresse?

Auf der Seite des Clusters, in der Karte **Connection and Databases**, Feld **Host**. Eine Adresse wird dort nur angezeigt, wenn der **External Access** aktiviert ist; andernfalls zeigt das Feld **Not defined** an. Der Port ist `5432`.

### Wie verbinde ich mich ohne externen Zugriff von einer VM oder einem Kubernetes-Cluster desselben Projekts?

Ohne externen Zugriff bleibt der Cluster von den VMs und Kubernetes-Clustern des Projekts über eine projektinterne Adresse erreichbar, die die Konsole nicht anzeigt. [Wenden Sie sich an den Support](mailto:support@hidora.io), um sie zu erhalten.

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Passwörter werden nur einmal angezeigt und können nicht erneut gelesen werden. Generieren Sie ein neues: Registerkarte **Users** → **Actions** → **Change Password** → **Perform rotation**. Das alte Passwort wird sofort widerrufen.

### Warum wird mein Benutzername abgelehnt?

PostgreSQL-Benutzernamen sind 3 bis 16 Zeichen lang, bestehen aus Kleinbuchstaben, Ziffern und Unterstrichen (`_`) und beginnen mit einem Buchstaben oder einem Unterstrich. Der Bindestrich (`-`) wird nicht akzeptiert. Die Namen `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica`, `cnpg_pooler_pgbouncer` und alle Namen, die mit `pg_` beginnen, sind reserviert.

### Wie füge ich PostgreSQL-Erweiterungen hinzu?

Bei der Erstellung einer Datenbank (Registerkarte **Databases** → **Create**, Abschnitt **PostgreSQL Extensions**) oder später über **Actions** → **Manage extensions**. Zu den angebotenen Erweiterungen gehören unter anderem `pg_stat_statements`, `pgcrypto`, `uuid-ossp`, `pg_trgm`, `hstore`, `citext`, `postgres_fdw`, `pgaudit` und `vector` (pgvector).

### Kann ich mehrere Datenbanken und Benutzer erstellen?

Ja. Fügen Sie in der Registerkarte **Databases** so viele Datenbanken wie nötig und in der Registerkarte **Users** so viele Benutzer wie nötig hinzu. Jeder Benutzer kann auf jeder Datenbank ein anderes Recht haben (**Administrator (Admin)** oder **Read-only**).

### Kann ich PostgreSQL-Parameter ändern (`max_connections`, `shared_buffers` …)?

Diese Parameter werden in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Sind Backups verfügbar?

Die Konfiguration von Backups und die Wiederherstellung werden in der Konsole nicht angeboten; wenden Sie sich an den Support. Siehe [Backups konfigurieren](./how-to/configure-backups.md).
