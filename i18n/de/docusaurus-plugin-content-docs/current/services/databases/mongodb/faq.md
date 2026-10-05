---
sidebar_position: 6
title: FAQ
---

# FAQ — MongoDB

### Welche Version sollte ich wählen?

Der Assistent bietet **6.0**, **7.0** und **8.0** (Standard) an. Wählen Sie für ein neues Projekt die neueste Version. Bei einer Migration gehen Sie von der Version Ihrer aktuellen Umgebung aus und aktualisieren dann über **Edit** jeweils um eine Version.

### Wie viele Replicas sollte ich wählen?

- **1 (Standalone)**: Entwicklung und Tests, ohne Ausfalltoleranz.
- **3 (Max High Availability)**: empfohlen für die Produktion; der Cluster bleibt verfügbar, wenn ein Mitglied ausfällt.
- **5 (Ultra High Availability)**: toleriert den Verlust von zwei Mitgliedern.

Die Anzahl der Replicas kann nach der Erstellung nicht geändert werden.

### Wann sollte ich Sharding aktivieren?

Wenn das Datenvolumen oder der Schreibdurchsatz übersteigt, was ein einzelnes Replica Set bewältigen kann. Über Sharding wird bei der Erstellung entschieden, und es vervielfacht die verbrauchten Ressourcen (2 Shards, Konfigurationsserver und Mongos-Router). Für die meisten Anwendungen genügt ein Replica Set. Siehe [Sharding konfigurieren](./how-to/configure-sharding.md).

### Welche Presets sind verfügbar?

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Maßgeblich ist die im Assistenten angezeigte Liste. Das Preset kann nach der Erstellung nicht geändert werden.

### Wo finde ich die Verbindungsadresse?

In der Karte **Network and Connection** auf der Seite des Clusters, Feld **Host**, wenn der **External Access** aktiviert ist. Der Port ist `27017`. Ohne externen Zugriff zeigt das Feld **Not defined** an: Der Cluster bleibt von den VMs des Projekts über eine interne Adresse erreichbar, die die Konsole nicht anzeigt; [wenden Sie sich an den Support](mailto:support@hidora.io), um sie zu erhalten.

### Warum hat der im Assistenten erstellte Benutzer keinen Zugriff auf meine Datenbank?

Die im Assistenten zur Cluster-Erstellung gewählte **Role** gilt für die Datenbank `admin`. Gewähren Sie anschließend den Zugriff auf Ihre Anwendungsdatenbanken über **Manage Access**. Siehe [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md).

### Warum kann ich einen Benutzer nicht speichern?

Ein MongoDB-Benutzer muss mindestens eine Rolle haben: eine **Global Role** oder einen **Specific Access** auf eine Datenbank. Prüfen Sie auch die Benennungsregeln: nur Kleinbuchstaben, Ziffern und Bindestriche, ohne Unterstrich.

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Es kann nicht erneut gelesen werden. Generieren Sie ein neues: **Actions** → **Change Password** → **Perform rotation**. Das alte Passwort wird sofort widerrufen.

### Sind Backups verfügbar?

Die Konfiguration von Backups und die Wiederherstellung werden in der Konsole nicht angeboten; [wenden Sie sich an den Support](mailto:support@hidora.io). Sie können jederzeit einen logischen Export mit `mongodump` durchführen:

```bash
mongodump --uri "mongodb://<user>@<host>:27017/myapp?authSource=admin" --out ./dump-$(date +%F)
```
