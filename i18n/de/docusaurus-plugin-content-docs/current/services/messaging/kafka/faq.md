---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

### Wie erhalte ich einen Kafka-Cluster?

Richten Sie Ihre Anfrage mit den Parametern der Instanz (Anzahl der Broker, Presets, Speicher, Topics, externer Zugriff) an den [Support](mailto:support@hidora.io). Der [Schnellstart](./quick-start.md) listet die vorzubereitenden Informationen auf.

### Was ist der Unterschied zwischen Partitionen und Replikationsfaktor?

Diese beiden Parameter dienen unterschiedlichen Zwecken:

- **Partitionen**: bestimmen die **Parallelität und den Durchsatz** eines Topics. Je mehr Partitionen, desto mehr Consumer können parallel lesen. Jede Partition ist eine geordnete Folge von Nachrichten.
- **Replicas** (Replikationsfaktor): bestimmen die Anzahl der **Kopien** jeder Partition, die auf verschiedene Broker verteilt sind, und gewährleisten so die **Hochverfügbarkeit**. Fällt ein Broker aus, übernimmt eine Replica.

:::warning
Die Anzahl der Replicas eines Topics **darf** die Anzahl der verfügbaren Broker **nicht übersteigen**. Mit 3 Brokern kann ein Topic zum Beispiel höchstens 3 Replicas haben.
:::

### Warum verwendet Kafka ZooKeeper?

ZooKeeper übernimmt die **Koordination des Kafka-Clusters**:

- **Wahl des Controllers**: bestimmt den Leader-Broker, der für die Verwaltung der Partitionen zuständig ist
- **Metadaten der Topics**: speichert die Liste der Topics und Partitionen sowie deren Zuordnung zu den Brokern
- **Erkennung von Ausfällen**: überwacht den Zustand der Broker und löst bei einem Ausfall die Neuzuordnung aus

:::tip
ZooKeeper benötigt eine **ungerade Anzahl von Instanzen** (3, 5, 7 …), um das Quorum aufrechtzuerhalten. Sehen Sie in der Produktion mindestens 3 Instanzen vor.
:::

### Wozu dient `cleanup.policy` bei einem Topic?

Die Cleanup-Policy legt fest, wie Kafka mit alten Nachrichten umgeht:

- **`delete`** (Standard): löscht die Log-Segmente, die die durch `retention.ms` festgelegte Aufbewahrungsdauer überschreiten. Geeignet für Ereignisströme.
- **`compact`**: bewahrt nur den **letzten Wert für jeden Schlüssel** auf. Geeignet für Referenztabellen oder Zustände (Changelog).

Die Policy jedes Topics ist Teil der Konfiguration der Instanz. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Wie funktionieren Consumer Groups?

Eine **Consumer Group** ist eine Gruppe von Consumern, die das Lesen der Partitionen eines Topics untereinander aufteilen:

- Jede Partition wird zu einem bestimmten Zeitpunkt von **einem einzigen Consumer** der Gruppe gelesen
- Fällt ein Consumer aus, werden seine Partitionen auf die anderen Mitglieder der Gruppe umverteilt (**Rebalancing**)
- Mehrere Consumer Groups können denselben Topic unabhängig voneinander lesen (jede verwaltet ihren eigenen Offset)

Dies ermöglicht ein **paralleles Konsumieren** und garantiert zugleich die Reihenfolge der Nachrichten innerhalb jeder Partition.

### Welche Ressourcen-Presets sind verfügbar?

Die Presets gelten getrennt für die Broker und für ZooKeeper:

| **Preset** | **CPU** | **Arbeitsspeicher** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Explizite CPU-/Arbeitsspeicherwerte können ebenfalls angefordert werden; sie ersetzen dann das Preset. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Wie mache ich Kafka außerhalb der Plattform erreichbar?

Der externe Zugriff ist eine Option der Instanz: Ist sie aktiviert, werden die Broker von außerhalb der Plattform erreichbar. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

:::warning
Die externe Bereitstellung macht Ihre Broker über das Internet auf Port `9094` erreichbar. Dieser Listener ist standardmäßig per TLS verschlüsselt, es ist jedoch keine Client-Authentifizierung konfiguriert: Jede Person, die die Adresse kennt, kann Nachrichten produzieren und konsumieren. Klären Sie mit dem Support die Einrichtung einer Authentifizierung (SCRAM oder mTLS), bevor Sie diese Option aktivieren.
:::

### Wie konfiguriere ich `min.insync.replicas`?

Der Parameter `min.insync.replicas` stellt sicher, dass eine Mindestanzahl von Replicas jeden Schreibvorgang bestätigt, bevor er als erfolgreich gilt. Es handelt sich um eine Konfiguration auf **Topic**-Ebene, die in der Konfiguration der Instanz festgelegt wird.

:::tip
Für einen Produktions-Topic mit 3 Replicas toleriert `min.insync.replicas: 2` den Verlust eines Brokers und gewährleistet zugleich die Dauerhaftigkeit der Daten. Kombinieren Sie es auf der Producer-Seite mit `acks=all`.
:::
