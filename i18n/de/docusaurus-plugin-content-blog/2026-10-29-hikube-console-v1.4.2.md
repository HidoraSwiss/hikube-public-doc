---
title: Hikube-Konsole v1.4.2
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.6.3 mit einer Karte **Control plane** auf der Seite eines Kubernetes-Clusters, dessen Control-Plane-Größe und Replikatanzahl sich jetzt ändern lassen. Die Seiten der fünf Datenbanken teilen sich ein einheitliches Layout, und mehrere Formulare zur Erstellung und Bearbeitung sind korrigiert.

<!-- truncate -->

## Hinzugefügt

- **Kubernetes: Zustand der Control Plane** — Auf der Seite eines Clusters erscheint eine Karte **Control plane**. Sie zeigt den Gesamtzustand (**Healthy**, **Degraded** oder **Critical**) und seinen Grund, die bereiten Replikate, die bereiten etcd-Mitglieder und für jedes Replikat seinen Zustand, seine Neustarts mit Datum und Ursache des letzten sowie seinen Arbeitsspeicher und seine CPU im Verhältnis zu ihrem Limit. Fehlt der Control Plane Arbeitsspeicher, öffnet eine Schaltfläche **Increase the size** die Bearbeitung des Clusters.

- **Kubernetes: Größe der Control Plane** — Größe und Replikatanzahl der Control Plane lassen sich bei einem bestehenden Cluster ändern. Sobald sie sich ändern, weist ein Hinweis darauf hin, dass die Control Plane schrittweise neu startet und vorübergehend Spielraum im CPU-Kontingent des Projekts benötigt. Unter dem Größenfeld warnt ein Hinweis bei der Erstellung wie bei der Bearbeitung vor einer Größe, die für die Control Plane zu klein oder für die gewählten Addons (Monitoring Agents, GPU Operator) zu knapp ist, mit einer Schaltfläche, um zur empfohlenen Größe zu wechseln. Derselbe Hinweis erscheint im Schritt Addons des Assistenten.

- **Datenbanken** — Die Seiten von PostgreSQL, Redis und RabbitMQ zeigen ihr **Preset**, wie die Seite von MariaDB.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Datenbanken** — Die Seiten der fünf Datenbanken teilen sich ein einheitliches zweispaltiges Layout. Die Hauptspalte zeigt die **General information** als Kacheln (**Version**, **Replicas**, **Volume size**, **Preset**), gefolgt von den Abschnitten der jeweiligen Engine. Die Seitenspalte fasst die Karte **Connection** und den Status zusammen.

- **Datenbanken** — Bei der Erstellung eines MariaDB-, MongoDB- oder RabbitMQ-Clusters bietet die Konsole **1 node (single instance)** oder **3 nodes (cluster)** an, mit einer Hilfe, die jeden Modus erklärt und darauf hinweist, dass die Wahl endgültig ist. Bei der Bearbeitung kann ein Cluster im Cluster-Modus seine Replikatanzahl zwischen 2 und 8 ändern. Ein bestehender Cluster mit 5 Knoten behält seinen Wert.

- **Datenbanken** — Die Bearbeitung eines Redis-Clusters bietet nur noch die aktuelle und neuere Versionen an und erlaubt keine Verkleinerung des Volumes mehr. Der Neustart-Hinweis erwähnt das Preset nur dort, wo es sich ändern lässt (PostgreSQL und Redis).

- **Kubernetes** — Bei der Erstellung bietet die Control Plane 1 oder 3 Replikate an. Bei der Bearbeitung ist der Name einer bestehenden Node Group schreibgeschützt, und die letzte verbleibende Node Group kann nicht mehr gelöscht werden. Das Entfernen einer bestehenden Node Group zeigt einen Hinweis: Beim Speichern wird sie mitsamt ihren Knoten gelöscht.

- **Kubernetes** — Die Option für die öffentliche IP der ersten Node Group heißt jetzt **Internet traffic entry (public IP)**. Ein Hilfetext erklärt, dass sie den Datenverkehr der von Ihnen exponierten Dienste empfängt und nicht dazu dient, die API des Clusters zu erreichen.

- **Kubernetes** — Ist ein Projekt noch nicht bereit, einen Cluster aufzunehmen, bittet die Meldung Sie, sich unter Angabe des Projektnamens an den Support zu wenden.

- **VM-Instanzen** — Auf einer Windows-VM gilt ein hinzugefügter SSH-Schlüssel ab dem nächsten Start, ohne dass das Administratorpasswort verloren geht. Das Abzeichen **Restart required** erscheint in der VM-Liste und auf der Seite der VM, solange die API einen ausstehenden Neustart meldet.

- **Projekte** — Bei der Erstellung eines Projekts ist der Schritt der Kontingente optional: Ein leer gelassenes Feld setzt kein eigenes Limit für das Projekt, das sich dann die verbleibenden Ressourcen der Organisation teilt (**Limited by the organization**). Ein gesetztes Kontingent lässt sich danach nicht mehr entfernen, und der Schritt weist darauf hin. Die reservierten Namen `root` und `super` werden schon bei der Eingabe des Namens abgelehnt.

- **Einheiten** — Größen (Festplatten, Volumes, Arbeitsspeicher, Kontingente) werden in GiB angezeigt (auf Französisch Gio), der Einheit der API.

## Behoben

- **Datenbanken** — In den Erstellungsassistenten wird ein von der API abgelehnter Benutzer nicht mehr mit dem Passwort „Error“ angezeigt: Die Konsole zeigt **User not created** und den Grund. Abgelehnte PostgreSQL-Datenbanken und RabbitMQ-Vhosts werden mit ihrem Grund aufgeführt. Der Name eines Vhosts wird schon bei der Eingabe geprüft, und derselbe Benutzername kann nicht mehr zweimal eingegeben werden (MariaDB, MongoDB, Buckets).
