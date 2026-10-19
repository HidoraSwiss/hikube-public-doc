---
sidebar_position: 6
title: "FAQ — MongoDB"
sidebar_label: FAQ
description: "Antworten auf häufige Fragen zu MongoDB auf Hikube: Version, Anzahl der Replikate, Sharding, Verbindungsadresse, Benutzerrechte, Passwort und Backups."
---

# FAQ — MongoDB

### Welche Version sollte ich wählen?

Der Assistent bietet **6.0**, **7.0** und **8.0** (Standard) an. Wählen Sie für ein neues Projekt die neueste Version. Bei einer Migration gehen Sie von der Version Ihrer aktuellen Umgebung aus und aktualisieren dann über **Edit** jeweils um eine Version. Eine Version kann nicht herabgestuft werden.

### Wie viele Replicas sollte ich wählen?

- **1 (Standalone)**: Entwicklung und Tests, ohne Ausfalltoleranz.
- **3 (Max High Availability)**: empfohlen für die Produktion; der Cluster bleibt verfügbar, wenn ein Mitglied ausfällt.
- **5 (Ultra High Availability)**: toleriert den Verlust von zwei Mitgliedern.

Die Anzahl der Replicas kann nach der Erstellung nicht geändert werden.

### Wann sollte ich Sharding aktivieren?

Wenn das Datenvolumen oder der Schreibdurchsatz übersteigt, was ein einzelnes Replica Set bewältigen kann. Über Sharding wird bei der Erstellung entschieden, und es vervielfacht die verbrauchten Ressourcen (2 Shards, Konfigurationsserver und Mongos-Router). Für die meisten Anwendungen genügt ein Replica Set. Siehe [Sharding konfigurieren](./how-to/configure-sharding.md).

### Welche Presets sind verfügbar?

Das **Preset** legt CPU und Arbeitsspeicher jedes Knotens fest. Die Presets entsprechen den Größen der [virtuellen Maschinen](../../compute/overview.md) der Serien `u1`, `s1` und `m1`: Ein Preset hat dieselben Ressourcen wie die gleichnamige VM.

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

Maßgeblich ist die im Assistenten angezeigte Liste. Das Preset kann nach der Erstellung nicht geändert werden.

### Wo finde ich die Verbindungsadresse?

In der Karte **Network and Connection** auf der Seite des Clusters, wenn der **External Access** aktiviert ist: Feld **Host** bei einem Cluster mit Sharding, Liste **Replica set rs0 members** und **External connection string** bei einem Replica Set. Der Port ist `27017`. Bei einem Replica Set verbinden Sie sich mit `directConnection=true` mit einem Mitglied, ohne den Parameter `replicaSet`. Ohne externen Zugriff zeigt das Feld **Not defined** an: Der Cluster bleibt von den VMs und Kubernetes-Clustern des Projekts über eine interne Adresse erreichbar, die die Konsole nicht anzeigt; [wenden Sie sich an den Support](mailto:support@hidora.io), um sie zu erhalten.

### Warum hat der im Assistenten erstellte Benutzer keinen Zugriff auf meine Datenbank?

Die im Assistenten gewählte **Role** gilt für die für diesen Benutzer angegebene **Database**, und nur für diese. Gewähren Sie den Zugriff auf Ihre weiteren Datenbanken über **Manage Access**. Siehe [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md).

Vor der Konsole v1.3.0 erstellte Benutzer haben ihre Rolle auf der Systemdatenbank `admin` erhalten. Entfernen Sie in **Manage Access** die als Fehler angezeigte Zeile `admin` und fügen Sie ihre Anwendungsdatenbank hinzu.

### Warum kann ich einen Benutzer nicht speichern?

Ein MongoDB-Benutzer muss mindestens einen Zugriff auf eine Datenbank haben: Andernfalls zeigt die Konsole „Please grant access to at least one database.“ an. Die Systemdatenbanken `admin`, `local` und `config` werden abgelehnt. Prüfen Sie auch die Benennungsregeln: nur Kleinbuchstaben, Ziffern und Bindestriche, ohne Unterstrich; 3 bis 16 Zeichen für einen Benutzernamen.

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Es kann nicht erneut gelesen werden. Generieren Sie ein neues: **Actions** → **Change Password** → **Perform rotation**. Das alte Passwort wird sofort widerrufen.

### Sind Backups verfügbar?

Die Konfiguration von Backups und die Wiederherstellung werden in der Konsole nicht angeboten; [wenden Sie sich an den Support](mailto:support@hidora.io). Sie können jederzeit einen logischen Export mit `mongodump` durchführen:

```bash
mongodump --uri "mongodb://<user>@<host>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
