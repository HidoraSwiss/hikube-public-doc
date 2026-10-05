---
sidebar_position: 6
title: FAQ
---

# FAQ — Disks

### Was ist der Unterschied zwischen einer Disk und einem S3-Bucket?

Eine **Disk** ist ein Block-Volume, das an eine einzige VM angebunden ist und vom Betriebssystem wie eine lokale Disk formatiert und eingehängt wird. Ein [S3-Bucket](../buckets/overview.md) ist ein Objektspeicher, auf den jede Anwendung per HTTPS-API zugreifen kann, ohne an eine Maschine angebunden zu sein.

---

### Kann ich eine Disk direkt im VM-Assistenten erstellen?

Ja. Im Schritt **Storage** des VM-Erstellungsassistenten erstellt jedes Volume im Modus **New** eine Disk. Diese Disks erscheinen anschließend unter **Infrastructure** → **Disks**, wie die im Menü **Disks** erstellten.

---

### Kann eine Disk an mehrere VMs angebunden werden?

Nein. Eine Disk ist jeweils an eine einzige VM angebunden. Um sie zu verschieben, trennen Sie sie von der ersten VM und binden Sie sie dann an die zweite an (siehe [Eine Disk an eine VM anbinden](./how-to/attach-to-vm.md)).

---

### Was passiert mit den Disks, wenn ich eine VM lösche?

Sie werden **getrennt** und mit ihren Daten aufbewahrt. Sie bleiben in der Liste **Storage Disks** im Status **Ready** und verbrauchen weiterhin das Speicher-Quota des Projekts, bis sie gelöscht werden.

---

### Kann man die Größe einer Disk verringern?

Nein. „Size reduction is not supported“: Eine Disk kann nur vergrößert werden. Um den belegten Platz zu verringern, erstellen Sie eine kleinere Disk, kopieren Sie die Daten aus der VM darauf und löschen Sie dann die alte.

---

### Kann man die Verschlüsselung aktivieren oder die Replikation nach der Erstellung ändern?

Nein. Verschlüsselung und Replikationstyp werden bei der Erstellung gewählt; danach ist nur die Größe änderbar. Um diese Optionen zu ändern, erstellen Sie eine neue Disk und kopieren Sie die Daten darauf.

---

### Welche Replikation soll ich wählen?

- **Asynchronous Replication** (empfohlen): eignet sich für die meisten Workloads. RPO < 5 min.
- **Synchronous Replication**: für Daten, deren Verlust minimal sein muss. RPO < 1 min.

In beiden Fällen liegt das RTO unter 5 Minuten.

---

### Warum beträgt die Mindestgröße für Windows 50 GB?

Eine Windows-System-Disk benötigt mindestens 50 GB. Die Konsole wendet dieses Minimum automatisch an, wenn Sie ein Windows-Image auswählen.

---

### Wie wird eine Disk abgerechnet?

Der Assistent zeigt **Estimated Cost** an: einen Tarif pro GB und Monat und die monatlichen Kosten für die gewählte Größe. Der Tarif hängt von der Verschlüsselung ab; eine Windows-System-Disk fügt die Kosten der Lizenz hinzu.

---

### Warum kann ich meine Disk nicht löschen?

Eine an eine VM angebundene Disk kann nicht gelöscht werden: Die Konsole antwortet mit „The disk cannot be deleted as it is in use.“. Trennen Sie sie zuerst auf der Bearbeitungsseite der VM.
