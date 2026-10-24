---
sidebar_position: 6
title: "FAQ — Backups"
sidebar_label: FAQ
description: "Antworten auf Fragen zu den Hikube-Backups: abgedeckte Ressourcen, Speicherort der Archive, Kontingent, Zeitzone, PostgreSQL und Ziele, Wiederherstellung in eine Kopie, Löschung."
---

# FAQ — Backups

### Welche Ressourcen können gesichert werden?

**PostgreSQL**- und **MariaDB**-Datenbanken, **virtuelle Maschinen** (mit allen ihren Disks) und **Disks**. MongoDB, Redis, RabbitMQ, Kubernetes-Cluster und Buckets werden von diesem Service nicht abgedeckt. Die Daten eines [Kubernetes](../kubernetes/overview.md)-Clusters werden mit den in diesem Cluster installierten Werkzeugen gesichert.

---

### Wo werden meine Backups gespeichert?

In dem S3-Bucket Ihres Projekts, der für das Ziel gewählt wurde. Hikube bewahrt keine weitere Kopie auf: Wenn Sie den Bucket löschen, werden die Archive gelöscht.

---

### Haben Backups ein Kontingent?

Nein, kein eigenes Kontingent. Die Archive belegen den Platz ihres Buckets, der wie der übrige Objektspeicher angerechnet wird.

---

### Muss ich ein Ziel pro Ressource erstellen?

Nein. Ein Ziel dient allen abgedeckten Ressourcen des Projekts. Erstellen Sie mehrere für unterschiedliche Aufbewahrungen oder Buckets.

---

### Kann ich eine PostgreSQL-Datenbank in zwei Ziele sichern?

Nein. Eine PostgreSQL-Datenbank archiviert ihre Transaktionsprotokolle kontinuierlich in ein einziges Ziel; zwei Ziele würden sich diesen Strom teilen, und keines enthielte einen vollständigen Verlauf. Das zweite wird abgelehnt. Mehrere Zeitpläne in dasselbe Ziel bleiben möglich. Siehe [Konzepte](./concepts.md#postgresql-nur-ein-ziel).

---

### In welcher Zeitzone sind die Uhrzeiten angegeben?

In UTC. Die Voreinstellung der Konsole rechnet Ihre lokale Uhrzeit in UTC um; der Cron-Ausdruck wird direkt in UTC eingegeben. Ein geplantes Backup verschiebt sich daher bei jeder Zeitumstellung in lokaler Zeit um eine Stunde.

---

### Kann ich häufiger als einmal pro Stunde sichern?

Nicht mit einem Zeitplan: Die maximale Häufigkeit ist eine Ausführung pro Stunde. Bei PostgreSQL ist das nicht nötig: Die Transaktionsprotokolle werden kontinuierlich archiviert, und die [Wiederherstellung zu einem bestimmten Zeitpunkt](./how-to/restore-point-in-time.md) erreicht jeden beliebigen Zeitpunkt zwischen zwei Backups.

---

### Wie erhalte ich eine Kopie einer Datenbank, ohne das Original anzutasten?

Erstellen Sie eine leere Datenbank desselben Typs (und bei PostgreSQL derselben Hauptversion) und stellen Sie das Archiv mit **Another application** darauf wieder her. Siehe [Eine Datenbank wiederherstellen](./how-to/restore-database.md).

---

### Kann ich eine VM unter einem anderen Namen wiederherstellen?

Nein. Eine VM oder eine Disk wird ausschließlich auf sich selbst wiederhergestellt. Um Dateien zurückzuholen, ohne die gesamte VM zu ersetzen, stellen Sie sie mit der Auswahl **Keep them** wieder her: Die alten Disks bleiben als separate Disks verfügbar. Siehe [Eine VM oder eine Disk wiederherstellen](./how-to/restore-vm-or-disk.md).

---

### Kann ich eine einzelne Disk einer VM wiederherstellen?

Nein. Das Archiv einer VM wird vollständig wiederhergestellt, mit allen ihren Disks. Das Archiv einer einzeln gesicherten Disk dient nur dazu, sie neu zu erstellen, falls sie gelöscht wurde.

---

### Gibt das Löschen eines Archivs Platz in meinem Bucket frei?

Bei einer **VM** oder einer **Disk** ja: Die Daten werden kurz nach dem Löschen entfernt. Bei **PostgreSQL** und **MariaDB** nein: Nur der Eintrag verschwindet aus der Konsole, die Daten bleiben im Bucket.

---

### Was geschieht mit meinen Archiven, wenn ich die gesicherte Ressource lösche?

Sie bleiben erhalten und wiederherstellbar. Bei einer VM oder einer Disk erstellt die Wiederherstellung die Ressource neu; bei einer Datenbank wählen Sie eine andere Datenbank als Ziel.

---

### Was geschieht mit meinen Archiven, wenn ich das Ziel lösche?

Sie bleiben im Bucket, sind aber in der Konsole nicht mehr wiederherstellbar, auch wenn Sie ein gleichnamiges Ziel neu erstellen. Bei PostgreSQL wird ihre Aufbewahrung nicht mehr angewendet.

---

### Warum wird die Größe meiner Archive nicht angezeigt?

Sie wird derzeit nicht gemessen. Bei einer VM oder einer Disk misst der während eines Backups angezeigte Prozentsatz die übertragenen Daten, nicht den belegten Platz. Den tatsächlichen Platz sehen Sie am Bucket.

---

### Was passiert, wenn ein geplantes Backup während einer Wiederherstellung fällig wird?

Ein Backup auf Abruf wird während einer Wiederherstellung abgelehnt, ein geplantes Backup wird jedoch trotzdem ausgelöst. Bei einer an Ort und Stelle wiederhergestellten PostgreSQL-Datenbank kann es die Wiederherstellung fehlschlagen lassen: Prüfen Sie vor der Wiederherstellung, dass innerhalb der nächsten 30 Minuten keine Ausführung vorgesehen ist.
