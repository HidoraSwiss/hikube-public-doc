---
title: "Redis-Hochverfügbarkeit konfigurieren"
sidebar_position: 1
---

# Redis-Hochverfügbarkeit konfigurieren

Diese Anleitung erklärt, wie Sie über die [Hikube-Konsole](https://console.hikube.cloud) einen hochverfügbaren Redis-Cluster erstellen. Der Dienst verwendet **Redis Sentinel**, um das automatische Failover sicherzustellen, sobald der Cluster mindestens 2 Replicas umfasst. Es werden immer drei Sentinels bereitgestellt, unabhängig von der Anzahl der Replicas.

## Voraussetzungen

- Ein Hikube-**Projekt** mit ausreichenden Quotas: Der Verbrauch an CPU, Arbeitsspeicher und Speicher vervielfacht sich mit der Anzahl der Replicas
- Grundkenntnisse in Redis (siehe [Schnellstart](../quick-start.md))

:::warning
Über die Hochverfügbarkeit wird **bei der Erstellung** entschieden: Die Anzahl der Replicas kann danach nicht mehr geändert werden. Um einen bestehenden Cluster umzuwandeln, [wenden Sie sich an den Support](mailto:support@hidora.io) oder erstellen Sie einen neuen Cluster.
:::

## Schritte

### 1. Den Assistenten öffnen

Öffnen Sie **DB & Messaging** → **Redis** und klicken Sie auf **Create a cluster**. Geben Sie den **Cluster Name** ein und klicken Sie auf **Next**.

### 2. Mindestens 3 Replicas konfigurieren

Im Schritt **Configuration**:

| Feld | Empfohlener Wert für die Produktion |
|-------|----------------------------------|
| **Number of replicas** | `3` (oder `5` für eine Toleranz gegenüber zwei Ausfällen) |
| **Preset** | `medium` oder größer, je nach Größe des Datenbestands |
| **Volume size (GB)** | Größer als das erwartete Datenvolumen |
| **Enable authentication** | Aktiviert |
| **Public network** | Deaktiviert, sofern kein Zugriff aus dem Internet benötigt wird |

:::tip
Das Quorum beruht auf den drei Sentinels, nicht auf der Anzahl der Replicas: 2 Replicas genügen für das Failover, 3 oder mehr erlauben es, mehr Ausfälle zu tolerieren.
:::

### 3. Den Cluster erstellen

Prüfen Sie im Schritt **Summary** die Zeile **Replicas** und die geschätzten Kosten und klicken Sie dann auf **Create**. Kopieren Sie das im Schritt **Done** angezeigte Passwort.

### 4. Das automatische Failover verstehen

Wenn der Master nicht mehr verfügbar ist:

1. Die Sentinels erkennen den Ausfall und einigen sich per Quorum.
2. Eine Replica wird zum neuen Master befördert.
3. Die übrigen Replicas werden so umkonfiguriert, dass sie ihm folgen.

Bei aktiviertem öffentlichem Netzwerk zeigt die im Feld **Host** angezeigte Adresse auf den aktuellen Master: Ihre Clients müssen nach einem Failover die Adresse nicht ändern, die offenen Verbindungen werden jedoch getrennt und müssen neu aufgebaut werden.

:::note
Konfigurieren Sie Ihre Redis-Clients mit automatischer Wiederverbindung und Wiederholungsintervallen, um die Umschaltung abzufangen.
:::

## Überprüfung

- Auf der Cluster-Seite zeigt im Abschnitt **General** das Feld **Replicas** die gewählte Anzahl an.
- Der Abschnitt **Connection** zeigt den **Status** **Ready** an.
- Prüfen Sie von einem Client aus die Rolle des erreichten Knotens:

```bash
redis-cli -h <host> -p 6379 INFO replication
```

**Erwartetes Ergebnis:** `role:master` und `connected_slaves` gleich der Anzahl der Replicas minus eins.

## Weiterführende Informationen

- [Redis-Konzepte](../concepts.md): Sentinel, Persistenz, Authentifizierung
- [Ressourcen ändern](./scale-resources.md)
