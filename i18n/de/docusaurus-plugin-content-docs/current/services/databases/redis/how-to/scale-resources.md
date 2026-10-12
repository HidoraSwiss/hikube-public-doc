---
title: "Die Ressourcen eines Redis-Clusters ändern"
sidebar_position: 2
---

# Die Ressourcen eines Redis-Clusters ändern

Diese Anleitung erklärt, wie Sie einen bestehenden Redis-Cluster über die [Hikube-Konsole](https://console.hikube.cloud) anpassen: Preset (CPU und Arbeitsspeicher), Volume-Größe, Version, externer Zugriff und Authentifizierung.

## Voraussetzungen

- Ein bestehender **Redis**-Cluster in Ihrem Projekt
- Ausreichende Projekt-Quotas für die neue Konfiguration

## Was geändert werden kann

| Parameter | Nach der Erstellung änderbar |
|-----------|---------------------------|
| **Redis Version** | Ja, nur auf eine höhere Version |
| **Preset** | Ja |
| **Volume Size (GB)** | Ja, nur Vergrößerung |
| **External access** | Ja |
| **Authentication required** | Ja |
| **Number of replicas** | Nein, „The mode cannot be changed after creation“ |

Um die Anzahl der Replicas zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).

## Schritte

### 1. Das Änderungsformular öffnen

1. Öffnen Sie **DB & Messaging** → **Redis**.
2. Öffnen Sie den Cluster und klicken Sie dann auf **Edit** (oder verwenden Sie **Actions** → **Edit** in der Liste).

Die Seite **Edit cluster** zeigt die Karte **Cluster settings** und die Auswirkung auf die Quotas des Projekts an.

### 2. Die Parameter anpassen

- **Preset**: Wählen Sie ein größeres Preset, wenn der Arbeitsspeicher erschöpft ist. Der Arbeitsspeicher des Presets begrenzt das Datenvolumen, das Redis im Arbeitsspeicher halten kann.
- **Volume Size (GB)**: „Storage capacity allocated to each node in the cluster.“ Geben Sie mindestens die aktuelle Größe ein.
- **Redis Version**: `8 (Latest)` oder `7`. Das Formular bietet beide Versionen an, akzeptiert wird jedoch nur die aktuelle oder eine höhere Version: Wählen Sie auf einem Cluster mit `8` nicht `7`.
- **External access**: „Allow access to the cluster from outside the private network.“
- **Authentication required**: „Enable password protection.“

### 3. Speichern

Klicken Sie auf **Save changes**. Die Meldung „Changes saved“ bestätigt die Übernahme.

Eine niedrigere Version oder eine verkleinerte Volume-Größe wird abgelehnt: Die Konsole zeigt „An error occurred while updating the cluster.“ an, gefolgt von dem von der API zurückgegebenen Grund (Codes `120203` für die Version, `120204` für das Volume).

:::warning
Wenn Sie die Authentifizierung auf einem Cluster deaktivieren, der im öffentlichen Netzwerk erreichbar ist, werden Ihre Daten für jeden zugänglich, der die Adresse kennt. Lassen Sie die Authentifizierung aktiviert.
:::

## Überprüfung

- Die Cluster-Seite zeigt im Abschnitt **General** die neue **Version** und die neue **Size** an.
- Prüfen Sie von einem Client aus den verfügbaren Arbeitsspeicher:

```bash
redis-cli -h <host> -p 6379 INFO memory | grep -E 'used_memory_human|maxmemory_human'
```

## Weiterführende Informationen

- [Hochverfügbarkeit konfigurieren](./configure-ha.md)
- [Passwort erneuern](./rotate-password.md)
