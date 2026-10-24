---
sidebar_position: 6
title: "FAQ — Redis"
sidebar_label: FAQ
description: "Antworten auf häufige Fragen zu Redis auf Hikube: Funktionsweise von Sentinel, Persistenz, Authentifizierung, verlorenes Passwort, Skalierung und ACL."
---

# FAQ — Redis

### Wie funktioniert Redis Sentinel auf Hikube?

Redis auf Hikube wird für die Hochverfügbarkeit in einer **Redis-Sentinel**-Architektur bereitgestellt:

- **Redis Sentinel** überwacht die Redis-Instanzen und führt bei einem Ausfall des Masters ein **automatisches Failover** durch.
- Ein **Quorum** aus Sentinels entscheidet über das Failover. Es werden immer drei Sentinels bereitgestellt, unabhängig von der Anzahl der Redis-Replicas: Das Failover funktioniert ab **2 Replicas**.
- Die Sentinels zählen zu den Quotas des Projekts (CPU und Arbeitsspeicher, in der Größe des Presets des Clusters).
- Der Host aus dem Bereich **Internal** folgt ebenso wie die Adresse aus dem Bereich **External** dem Master: Nach einem Failover zeigt er automatisch auf den neuen Master, ohne dass sich die Adresse ändert.

:::tip
Wählen Sie für die Produktion bei der Erstellung mindestens 3 Replicas: Diese Anzahl kann danach nicht mehr geändert werden.
:::

### Welche Presets sind verfügbar?

Das **Preset** legt CPU und Arbeitsspeicher jedes Knotens fest. Die Presets entsprechen den Größen der [virtuellen Maschinen](../../compute/overview.md) der Serien `u1`, `s1` und `m1`: Ein Preset hat dieselben Ressourcen wie die gleichnamige VM. Maßgeblich ist die im Assistenten angezeigte Liste:

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

Es kann nach der Erstellung über **Edit** geändert werden.

### Persistiert Redis die Daten?

Ja. Jeder Knoten verfügt über ein persistentes Volume (**Volume size (GB)**), auf das Redis seine Daten über seine nativen Mechanismen schreibt. Die Daten überstehen Neustarts.

### Wozu dient die Option „Enable authentication“?

Aktiviert (Standardwert) schützt sie den Cluster mit einem automatisch generierten Passwort, das bei der Erstellung einmalig zusammen mit dem Benutzer `default` angezeigt wird. Dieses Passwort ist für jede Verbindung erforderlich.

:::warning
Lassen Sie die Authentifizierung immer aktiviert, insbesondere wenn das öffentliche Netzwerk aktiviert ist.
:::

### Ich habe das Passwort verloren. Wie kann ich es wiederherstellen?

Es kann nicht erneut gelesen werden. Generieren Sie im Abschnitt **Security** der Cluster-Seite ein neues (**Rotate password**) und starten Sie den Cluster anschließend neu: Das neue Passwort wird erst nach diesem Neustart akzeptiert. Siehe [Passwort erneuern](./how-to/rotate-password.md).

### Ich habe die Authentifizierung aktiviert, aber Redis nimmt weiterhin Verbindungen ohne Passwort an. Warum?

Das Aktivieren oder Deaktivieren der Authentifizierung auf einem bestehenden Cluster wird, wie die Erneuerung seines Passworts, sofort gespeichert, gilt für die Redis-Server aber erst nach einem Neustart des Clusters. Solange die Seite des Clusters das Banner **Restart required** anzeigt, klicken Sie auf **Restart now**. Der Cluster ist etwa eine Minute lang nicht erreichbar. Siehe [Einen Cluster neu starten](./how-to/restart-cluster.md).

### Wie skaliere ich Redis?

- **Vertikal**: Ändern Sie das **Preset** und die **Volume Size (GB)** über **Edit**. Siehe [Ressourcen ändern](./how-to/scale-resources.md).
- **Horizontal**: Die Anzahl der Replicas wird bei der Erstellung festgelegt. Um sie zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).

### Wie verbinde ich mich mit Redis?

Bei aktiviertem öffentlichem Netzwerk verwenden Sie die Adresse aus dem Bereich **External** (Abschnitt **Connection** der Cluster-Seite) auf Port `6379`:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 ping
```

Von einer VM oder einem Kubernetes-Cluster des Projekts aus verwenden Sie den Host aus dem Bereich **Internal**, mit oder ohne öffentliches Netzwerk. Auch er folgt dem Master.

### Kann ich mehrere Redis-Benutzer (ACL) anlegen?

Nein, die Konsole bietet keine Verwaltung von Redis-Benutzern: Der Zugriff beruht auf einem globalen Passwort für den Cluster.
