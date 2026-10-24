---
sidebar_position: 2
title: "Konzepte — Backups"
sidebar_label: Konzepte
description: "Verstehen Sie die Hikube-Backups: Ziele, Aufbewahrung, gesperrte Buckets, Zeitpläne in UTC, Ausführungen, wiederherstellbare Archive, Wiederherstellung an Ort und Stelle oder in eine andere Datenbank, PITR für PostgreSQL."
---

# Konzepte — Backups

## Terminologie

| Begriff | Beschreibung |
|-------|-------------|
| **Ziel** (Destination) | Ein S3-Bucket des Projekts, der Bucket-Benutzer, dessen Zugangsdaten es verwendet, und eine Aufbewahrungsdauer in Tagen. Jedes Backup wird in ein Ziel geschrieben. |
| **Aufbewahrung** | Dauer, während der ein Archiv aufbewahrt wird, von 1 bis 3 650 Tagen. Nach Ablauf dieser Frist wird das Archiv automatisch gelöscht. |
| **Zeitplan** (Plan) | Wiederkehrendes Backup einer Ressource in ein Ziel, zu festgelegten Zeiten. |
| **Ausführung** | Ein laufendes Backup, ausgelöst durch einen Zeitplan oder **auf Abruf**. Eine erfolgreiche Ausführung erzeugt ein Archiv. |
| **Archiv** | Gespeicherte Kopie des Zustands einer Ressource zu einem bestimmten Zeitpunkt, aus der wiederhergestellt wird. |
| **Wiederherstellung** | Neuschreiben einer Ressource anhand eines Archivs. |
| **Quellressource** | Die Datenbank, die VM oder die Disk, von der das Archiv erstellt wurde. |
| **Ziel der Wiederherstellung** | Die Ressource, in die eine Wiederherstellung schreibt: die Quelle selbst (Wiederherstellung **an Ort und Stelle**) oder eine andere Datenbank desselben Typs. |

---

## Abgedeckte Ressourcen

| Typ | Wiederherstellung an Ort und Stelle | Wiederherstellung in eine andere Ressource | Wiederherstellung zu einem bestimmten Zeitpunkt | Löschen eines Archivs löscht die Daten |
|------|:---:|:---:|:---:|:---:|
| PostgreSQL | Ja | Ja, in eine PostgreSQL-Datenbank derselben Hauptversion | Ja | Nein |
| MariaDB | Ja | Ja, in eine andere MariaDB-Datenbank | Nein | Nein |
| Virtuelle Maschine | Ja | Nein | Nein | Ja |
| Disk | Nur wenn die Disk gelöscht wurde | Nein | Nein | Ja |

Die anderen Services (MongoDB, Redis, RabbitMQ, Kubernetes-Cluster, Buckets) werden nicht abgedeckt.

### Eine VM nimmt ihre Disks mit

Das Archiv einer virtuellen Maschine enthält **alle Disks** der VM. Diese Disks benötigen daher keinen eigenen Zeitplan: In der Registerkarte **Backups** einer solchen Disk zeigt die Konsole **Backed up with another resource** an, und unter **Backups** > **Protection** den Zustand **Covered**. Das Archiv der VM erscheint auch in der Archivliste der Disk.

Die Wiederherstellung dieses Archivs schreibt die VM **und** alle ihre Disks neu: Es ist nicht möglich, nur einen Teil davon wiederherzustellen.

---

## Ziele

Ein Ziel wird unter **Backups** > **Destinations** > **Create a destination** erstellt. Es umfasst:

| Element | Regel |
|---------|-------|
| **Name** | 1 bis 40 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche, ohne Bindestrich am Anfang oder Ende. Eindeutig im Projekt. |
| **Bucket** | Ein S3-Bucket **desselben Projekts**. Vor dem ersten Ziel muss einer erstellt werden. |
| **Credentials** | Ein Benutzer des Buckets. Die Konsole bietet an, **einen dedizierten Benutzer zu erstellen** (empfohlen: Seine Zugangsdaten dienen nur den Backups und lassen sich widerrufen, ohne den Rest zu beeinträchtigen) oder einen bestehenden wiederzuverwenden. |
| **Retention** | Ganze Zahl von Tagen, von 1 bis 3 650. In der Konsole standardmäßig 30 Tage. |

Ein Ziel dient allen abgedeckten Ressourcen des Projekts. Nach der Erstellung lässt sich nur die Aufbewahrung ändern; um den Bucket zu wechseln, erstellen Sie ein anderes Ziel.

### Zustände eines Ziels

| Zustand | Bedeutung |
|------|---------------|
| **Provisioning** | Das Ziel wird gerade eingerichtet oder gelöscht. |
| **Ready** | Das Ziel nimmt Zeitpläne, Backups und Wiederherstellungen an. |
| **Error** | Der Bucket oder sein Benutzer ist nicht mehr lesbar, oder eine Löschung ist nicht abgeschlossen. Die Meldung nennt die Ursache. |
| **Unknown** | Der Zustand konnte nicht gelesen werden; versuchen Sie es in einem Moment erneut. |

Nur ein Ziel im Zustand **Ready** nimmt einen Zeitplan, ein Backup oder eine Wiederherstellung an. Einfach nur falsche Zugangsdaten werden bei der Erstellung nicht erkannt: Bei Datenbanken erscheint der Fehler beim ersten Backup.

### Aufbewahrung

- Bei **MariaDB, VMs und Disks** behält jedes Archiv die Aufbewahrung, die zum Zeitpunkt seines Schreibens galt. Eine Änderung der Aufbewahrung eines Ziels betrifft nur die folgenden Archive.
- Bei **PostgreSQL** gilt die Aufbewahrung für den gesamten Verlauf der Datenbank: Eine Verkürzung kann bereits geschriebene Archive ab dem nächsten Backup löschen.
- Ein Archiv, dessen Aufbewahrung abgelaufen ist, wird automatisch gelöscht, zusammen mit der Ausführungszeile, die es erzeugt hat. Das **letzte wiederherstellbare Archiv** einer Ressource wird immer aufbewahrt, unabhängig von seinem Alter. Ein Archiv, das gerade von einer Wiederherstellung gelesen wird, wird nie gelöscht.
- Ein Archiv einer VM oder Disk, dessen Aufbewahrung endet, ist ab seinem Ablauf nicht mehr wiederherstellbar, noch bevor es aus der Liste entfernt wird.

### Gesperrter Bucket (WORM)

Wenn der Bucket eines Ziels mit Objektsperre erstellt wurde, zeigt die Konsole **WORM · 365 d** neben dem Ziel an. Folgen:

- Jedes Archiv wird nach seinem Schreiben 365 Tage lang gesperrt: Niemand kann es vorher löschen, nicht einmal der Support. Die Konsole zeigt **Locked (WORM) until** am Archiv an;
- die Aufbewahrung des Ziels darf nicht kürzer sein als die Dauer der Sperre (365 Tage);
- ein gesperrtes Archiv bleibt während der gesamten Dauer der Sperre wiederherstellbar.

### PostgreSQL: nur ein Ziel

Eine PostgreSQL-Datenbank archiviert ihre Transaktionsprotokolle zwischen zwei Backups kontinuierlich in **ein einziges** Ziel. Zwei Ziele für dieselbe Datenbank würden sich diesen Strom teilen: Keines der beiden enthielte einen vollständigen und damit wiederherstellbaren Verlauf. Hikube lehnt es daher ab, eine PostgreSQL-Datenbank in ein zweites Ziel zu sichern, sei es per Zeitplan oder auf Abruf.

Um Archive in unterschiedlichen Rhythmen aufzubewahren (zum Beispiel täglich und monatlich), verwenden Sie mehrere Zeitpläne in **dasselbe** Ziel. Bei MariaDB, VMs und Disks sind mehrere Ziele möglich.

---

## Zeitpläne

Ein Zeitplan verbindet eine Ressource, ein Ziel und eine Uhrzeit. Name, Ressource und Ziel werden bei der Erstellung festgelegt; nur die Uhrzeit lässt sich ändern.

| Element | Regel |
|---------|-------|
| **Plan name** | 1 bis 40 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche, ohne Bindestrich am Anfang oder Ende. Eindeutig im Projekt. |
| **Uhrzeit** | Eine Voreinstellung (**Hourly**, **Daily**, **Weekly**) oder ein Cron-Ausdruck mit fünf Feldern. |
| **Maximale Häufigkeit** | Eine Ausführung pro Stunde. |

### Uhrzeiten und Zeitzone

Die Uhrzeit eines Zeitplans wird **in UTC gespeichert**.

- In der Registerkarte **Preset** wählen Sie eine **lokale** Uhrzeit; die Konsole rechnet sie beim Speichern in UTC um.
- In der Registerkarte **Cron expression** geben Sie direkt einen Ausdruck **in UTC** ein, zum Beispiel `30 1 * * *` für täglich 01:30 UTC. `@hourly`, `@daily`, `@weekly`, `@monthly` und `@yearly` werden akzeptiert; Intervalle (`@every`) und Zeitzonen-Präfixe (`CRON_TZ=`, `TZ=`) werden abgelehnt.
- Da die Uhrzeit in UTC fest ist, **verschiebt sich ein geplantes Backup in lokaler Zeit um eine Stunde** bei jeder Zeitumstellung. Die Konsole weist darauf hin und zeigt die **Next run** in lokaler Zeit an.

### Zustände eines Zeitplans

| Zustand | Bedeutung |
|------|---------------|
| **Ready** | Die Uhrzeit ist gültig, Ressource und Ziel existieren. |
| **Error** | Die Uhrzeit ist ungültig, oder die Ressource oder das Ziel existiert nicht mehr. Die Meldung nennt, welches. |
| **Unknown** | Der Zustand konnte nicht gelesen werden. |

Das Löschen eines Zeitplans beendet die künftigen Ausführungen und **behält die bereits erstellten Archive**. Der Ausführungsverlauf dieses Zeitplans verschwindet mit ihm.

---

## Ausführungen

Eine Ausführung durchläuft die Zustände **Pending**, **In progress** und dann **Succeeded** oder **Failed**. Eine von Ihnen abgebrochene Ausführung wird als **Cancelled** angezeigt.

- Bei einer VM oder einer Disk zeigt die Konsole den Prozentsatz der **übertragenen Daten** an. Diese Zahl misst die gelesenen Daten, nicht den im Bucket belegten Platz: Blöcke, die bereits in einem früheren Archiv vorhanden sind, werden nicht erneut geschrieben.
- Bei PostgreSQL und MariaDB ist kein Fortschritt verfügbar.

---

## Archive

### Zustände eines Archivs

| Zustand | Bedeutung |
|------|---------------|
| **Pending** | Das Archiv wird gerade geschrieben. |
| **Ready** | Das Archiv ist vollständig. |
| **Failed** | Das Backup ist nicht abgeschlossen; das Archiv ist nicht wiederherstellbar. |

### Wiederherstellbares Archiv oder nicht

Ein Archiv im Zustand **Ready** ist nur wiederherstellbar, wenn sein Ziel noch existiert, nicht gerade gelöscht wird und tatsächlich das Ziel ist, in das das Archiv geschrieben wurde. Andernfalls zeigt die Konsole den Grund an:

| Angezeigter Grund | Was zu tun ist |
|-----------------|---------------------|
| Das Archiv ist nicht bereit | Warten Sie das Ende des Schreibvorgangs ab, oder verwenden Sie ein anderes Archiv, falls das Backup fehlgeschlagen ist. |
| Sein Ziel wurde gelöscht | Das Archiv wird nicht wieder wiederherstellbar, auch nicht durch Neuerstellen eines gleichnamigen Ziels. Verwenden Sie ein neueres Archiv. |
| Sein Ziel wird gerade gelöscht | Verwenden Sie ein anderes Archiv. |
| Das Ziel mit diesem Namen wurde nach dem Backup neu erstellt | Es ist nicht mehr das Ziel, in das das Archiv geschrieben wurde, auch wenn es auf denselben Bucket verweist. Verwenden Sie ein seitdem erstelltes Archiv. |
| Die Ziele konnten nicht gelesen werden | Versuchen Sie es in einem Moment erneut. |
| Die Daten des Archivs sind nicht mehr gespeichert | VMs und Disks: Das Archiv wurde gelöscht, zum Beispiel am Ende der Aufbewahrung. |

Wiederherstellbar bedeutet, dass die Wiederherstellung angenommen wird; Hikube liest den Inhalt des Buckets nicht erneut, um dies zu prüfen.

### Ein Archiv löschen

| Typ | Wirkung | Bestätigung |
|------|-------|--------------|
| PostgreSQL, MariaDB | Entfernt das Archiv aus der Liste; seine Daten **bleiben in Ihrem Bucket**. | Einfach |
| Virtuelle Maschine, Disk | Entfernt das Archiv **und löscht seine Daten**. Dies ist unwiderruflich. | Eingabe des Archivnamens |

Ein Archiv, das gerade von einer Wiederherstellung gelesen wird, kann nicht gelöscht werden. Ebenso wenig ein durch einen WORM-Bucket gesperrtes Archiv, bis seine Sperre abgelaufen ist.

---

## Wiederherstellungen

### Wiederherstellung an Ort und Stelle oder in eine andere Datenbank

- **An Ort und Stelle**: Das Archiv wird auf seiner Quellressource wiederhergestellt, deren aktueller Inhalt überschrieben wird. Die Konsole verlangt zur Bestätigung die Eingabe des Ressourcennamens.
- **In eine andere Datenbank** (nur PostgreSQL und MariaDB): Das Archiv wird in einer anderen **bestehenden** Datenbank desselben Typs im Projekt wiederhergestellt. Um eine Kopie zu erhalten, erstellen Sie zuerst eine leere Datenbank und stellen Sie das Archiv dann darin wieder her.
  - **PostgreSQL**: Die Zieldatenbank wird vollständig durch den Inhalt des Archivs ersetzt. Sie muss dieselbe **Hauptversion** von PostgreSQL haben wie die gesicherte Datenbank.
  - **MariaDB**: Das Archiv ist ein Export, der in der Zieldatenbank eingespielt wird. Jede darin enthaltene Tabelle ersetzt die gleichnamige Tabelle; Tabellen und Datenbanken, die es nicht enthält, bleiben erhalten.

Eine Wiederherstellung gleichzeitig pro Ressource. Während einer Wiederherstellung wird kein Backup auf Abruf dieser Ressource angenommen.

### Quellressource gelöscht oder neu erstellt

| Situation | PostgreSQL, MariaDB | VM, Disk |
|-----------|---------------------|------------|
| Die Quelle wurde gelöscht | Wählen Sie eine andere Datenbank als Ziel. | Die Wiederherstellung **erstellt** die Ressource aus dem Archiv **neu**. |
| Eine neue Ressource trägt den Namen der Quelle und wurde nach dem Backup erstellt | Sie wird wie eine andere Datenbank behandelt: Die Wiederherstellung wird nach Bestätigung angenommen. | Abgelehnt: Löschen Sie zuerst die neu erstellte Ressource und stellen Sie dann wieder her. |

### Wiederherstellung einer VM: die ersetzten Disks

Die Wiederherstellung einer VM an Ort und Stelle ersetzt jede ihrer Disks durch ihre Kopie aus dem Archiv. Die Auswahl **This machine's current disks** bestimmt, was mit ihrem bisherigen Inhalt geschieht:

- **Discard them** (Standard): Ihr alter Inhalt wird gelöscht, sobald die Wiederherstellung erfolgreich und geprüft ist.
- **Keep them**: Ihr alter Inhalt wird zu einer eigenen Disk namens `<disk>-orig-<kennung>`, die von jeder VM getrennt ist, unter **Disks** aufgeführt wird und wie jede Disk abgerechnet wird, bis Sie sie löschen.

Eine Wiederherstellung, die fehlschlägt oder abgebrochen wird, löscht **nichts**, auch nicht mit **Discard them**: Die alten Disks werden dann unter demselben Namen `<disk>-orig-<kennung>` behalten, und die Meldung der Wiederherstellung weist darauf hin. Löschen Sie sie, wenn Sie sie nicht mehr benötigen.

Bevor sie in den Zustand **Succeeded** wechselt, prüft eine Wiederherstellung einer VM oder Disk, dass jede Disk des Archivs tatsächlich neu geschrieben wurde. Während dieser Prüfung (einige Sekunden) bleibt sie **In progress**. Wurde eine Disk nicht wiederhergestellt, wechselt die Wiederherstellung unter Nennung dieser Disk zu **Failed**; ein erneuter Start der Wiederherstellung kann erfolgreich sein.

### Eine Disk wird nicht auf sich selbst wiederhergestellt

Das Archiv einer einzeln gesicherten Disk kann nicht auf dieser Disk wiederhergestellt werden, solange sie existiert. Um eine an eine VM angebundene Disk auf einen früheren Stand zurückzusetzen, stellen Sie ein Archiv **der VM** wieder her: Es schreibt alle ihre Disks neu. Eine gelöschte Disk dagegen wird durch die Wiederherstellung ihres Archivs neu erstellt.

### Abbrechen

| Vorgang | Abbrechbar | Hinweise |
|-----------|-----------|-----------|
| Noch nicht gestartetes Backup | Ja, alle Typen | |
| PostgreSQL-Backup | Solange es auf den Start wartet | Ein begonnenes PostgreSQL-Backup lässt sich nicht unterbrechen: Es wird von selbst beendet oder schlägt fehl. |
| MariaDB-Backup | Ja | |
| Backup einer VM oder Disk | Ja | In den ersten Sekunden, während die Konfiguration kopiert wird, wird der Abbruch abgelehnt: Versuchen Sie es einige Sekunden später erneut. |
| Wiederherstellung von PostgreSQL oder MariaDB | Nein | Eine Datenbank-Wiederherstellung, die nicht zum Abschluss kommt, schlägt nach 30 Minuten von selbst fehl. |
| Wiederherstellung einer VM oder Disk | Ja | Nichts wird rückgängig gemacht: Die VM kann gestoppt bleiben und ihre Disks beiseitegelegt. Eine neue Wiederherstellung stellt sie wieder her. |

Ein abgebrochenes Backup wird in der Aktivität als **Cancelled** angezeigt, nicht als Fehlschlag, und erzeugt kein Archiv.

---

## Wiederherstellung zu einem bestimmten Zeitpunkt (PostgreSQL)

Eine gesicherte PostgreSQL-Datenbank archiviert ihre **Transaktionsprotokolle** kontinuierlich in ihr Ziel. Eine Wiederherstellung kann die Datenbank daher zurückversetzen auf:

| Auswahl | Ergebnis |
|-------|----------|
| **State of the backup** (Standard) | Den exakten Stand des gewählten Archivs. |
| **Most recent state** | Das Archiv, dann alle seitdem archivierten Protokolle: den neuesten bekannten Stand. |
| **Einen Zeitpunkt** | Den Stand der Datenbank unmittelbar vor der ersten Transaktion nach dem gewählten Zeitpunkt. |

### Wiederherstellungsfenster

Jedes PostgreSQL-Archiv hat ein **Fenster** erreichbarer Zeitpunkte, das die Konsole auf einer Zeitleiste anzeigt:

- Es beginnt am **Ende** des Backups (nicht an seinem Anfang: Die Datenbank ist erst nach Abschluss des Backups konsistent);
- es endet **vor der letzten Transaktion**, die in den archivierten Protokollen vorhanden ist. Ein Zeitpunkt nach der letzten Transaktion kann nicht erreicht werden, da die Wiederherstellung bei der ersten darauffolgenden Transaktion anhält: Wählen Sie dann **Most recent state**, der diese letzte Transaktion einschließt;
- die Protokolle werden mit leichter Verzögerung archiviert: Die allerletzten Minuten sind noch nicht wiederherstellbar.

### Zweige des Verlaufs

Die Wiederherstellung einer PostgreSQL-Datenbank **an Ort und Stelle** beginnt einen neuen **Zweig** ihres Verlaufs. Die vor dieser Wiederherstellung erstellten Archive gehören zum alten Zweig. Müsste eine Wiederherstellung auf den neuesten Stand oder auf einen bestimmten Zeitpunkt, ausgehend vom gewählten Archiv, auf einem Archiv eines anderen Zweigs aufsetzen, lieferte sie nicht die Daten des gewählten Archivs: Die Konsole bietet diese Zeitpunkte nicht an, und die Wiederherstellung wird abgelehnt. Wählen Sie einen früheren Zeitpunkt oder ein Archiv des gewünschten Zweigs.

---

## Lebenszyklus

| Aktion | Verhalten |
|--------|--------------|
| Ein Ziel erstellen | **Provisioning**, dann **Ready**. |
| Die Aufbewahrung ändern | Siehe [Aufbewahrung](#aufbewahrung). Unterhalb der Sperrdauer eines WORM-Buckets nicht möglich. |
| Ein Ziel löschen | Abgelehnt, solange ein Zeitplan, ein Backup oder eine Wiederherstellung es verwendet. Die Archive bleiben im Bucket, sind aber nicht mehr wiederherstellbar; bei PostgreSQL wird ihre Aufbewahrung nicht mehr angewendet. |
| Einen Zeitplan löschen | Die künftigen Ausführungen werden beendet; die Archive bleiben erhalten. |
| Ein Archiv löschen | Siehe [Ein Archiv löschen](#ein-archiv-löschen). |
| Eine gesicherte Ressource löschen | Ihre Archive bleiben erhalten und wiederherstellbar. |

---

## Weiterführende Informationen

- [Übersicht](./overview.md)
- [Schnellstart](./quick-start.md)
- [Eine Datenbank zu einem bestimmten Zeitpunkt wiederherstellen](./how-to/restore-point-in-time.md)
