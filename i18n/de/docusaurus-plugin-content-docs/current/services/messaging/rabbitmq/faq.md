---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Was ist der Unterschied zwischen Quorum Queues und Classic Queues?

RabbitMQ bietet zwei Haupttypen von Queues an:

- **Quorum Queues**: Auf Basis des Protokolls **Raft** werden die Daten auf mehrere Knoten des Clusters repliziert. Sie gewährleisten die **Dauerhaftigkeit** und **Hochverfügbarkeit** der Nachrichten. Für die Produktion empfohlen.
- **Classic Queues**: auf einem einzigen Knoten gespeichert, ohne Replikation zwischen Knoten. Fällt dieser Knoten aus, sind die Nachrichten nicht mehr verfügbar.

Der Queue-Typ wird von der Anwendung bei der Deklaration gewählt (Argument `x-queue-type: quorum`).

:::tip
Um von der Replikation der Quorum Queues zu profitieren, erstellen Sie den Cluster mit **3 (Max High Availability)** oder **5 (Ultra High Availability)** Replicas.
:::

### Wozu dienen Virtual Hosts (VHosts)?

**Virtual Hosts** (VHosts) bieten eine **logische Isolation** innerhalb eines RabbitMQ-Clusters:

- Jeder VHost besitzt eigene Exchanges, Queues und Bindings
- Die Rechte werden **pro VHost** verwaltet, sodass sich der Zugriff pro Anwendung steuern lässt
- Ein Benutzer kann je nach VHost unterschiedliche Rechte haben (**Administrator** auf dem einen, **Read-only** auf dem anderen)

VHosts werden im Erstellungsassistenten (Schritt **VHosts**) oder später über **Add a VHost** auf der Clusterseite erstellt. Siehe [VHosts und Benutzer verwalten](./how-to/manage-vhosts-users.md).

### Wie funktionieren Exchanges in RabbitMQ?

Ein **Exchange** empfängt die Nachrichten der Producer und leitet sie gemäß **Binding**-Regeln an die Queues weiter:

| **Typ**    | **Verhalten**                                                              |
| ----------- | ----------------------------------------------------------------------------- |
| `direct`    | Leitet die Nachricht an die Queue weiter, deren **Routing Key** exakt übereinstimmt  |
| `fanout`    | Verteilt die Nachricht ohne Filter an **alle gebundenen Queues**                 |
| `topic`     | Leitet anhand eines **Musters** des Routing Keys weiter (z. B. `orders.*`, `logs.#`)          |
| `headers`   | Leitet anhand der **Header** der Nachricht statt des Routing Keys weiter              |

Der Producer veröffentlicht an einen Exchange, nie direkt an eine Queue. Exchanges und Bindings werden von Ihren Anwendungen deklariert.

### Über welchen Port verbinde ich mich?

AMQP-Clients verbinden sich über den Port **5672** mit der Adresse, die im Feld **Host** des Abschnitts **Connection** des Clusters angezeigt wird (wenn der **External Access** aktiviert ist).

### Kann ich die Anzahl der Replicas oder das Preset nach der Erstellung ändern?

Nein. Die **Number of replicas** (und damit der Standalone- oder Cluster-Modus) und das **Preset** werden bei der Erstellung festgelegt. Version, Disk-Größe und externer Zugriff bleiben änderbar. Siehe [Die Konfiguration eines Clusters ändern](./how-to/scale-resources.md).

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Das Passwort wird nur einmal angezeigt und kann nicht erneut ausgelesen werden. Generieren Sie mit der Aktion **Change Password** des Benutzers ein neues und aktualisieren Sie anschließend Ihre Anwendungen: Das alte Passwort wird sofort widerrufen.

### Welche Rechte gewähren „Administrator“ und „Read-only“?

- **Administrator**: Lesen, Schreiben und Konfigurieren auf dem VHost (Exchanges und Queues deklarieren, veröffentlichen, konsumieren).
- **Read-only**: Nur Lesen auf dem VHost.

Ein Benutzer ohne Zugriff auf einen VHost kann sich nicht mit ihm verbinden.

### Wie greife ich auf die RabbitMQ-Management-Oberfläche zu?

Die Hikube-Konsole bietet keinen Zugriff auf die Web-Management-Oberfläche von RabbitMQ. Mit **External Access** ist der Port 15672 dieser Oberfläche unter der Adresse des Clusters über unverschlüsseltes HTTP erreichbar, doch die in der Konsole erstellten Benutzer haben nicht das RabbitMQ-Administrations-Tag, das sie voraussetzt: Sie können sich dort nicht anmelden. VHosts und Benutzer verwalten Sie in der Konsole, Exchanges und Queues über Ihre Anwendungen. Für einen spezifischen Bedarf [wenden Sie sich an den Support](mailto:support@hidora.io).

### Wie werden die Kosten eines Clusters geschätzt?

Der Erstellungsassistent zeigt **Estimated Cost** monatlich und stündlich an, berechnet aus Preset, Anzahl der Replicas, Disk-Größe und externem Zugriff. Die tatsächliche Abrechnung erfolgt nach Nutzungsstunden.
