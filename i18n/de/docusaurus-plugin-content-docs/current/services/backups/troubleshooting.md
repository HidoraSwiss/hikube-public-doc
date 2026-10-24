---
sidebar_position: 7
title: "Fehlerbehebung — Backups"
sidebar_label: Fehlerbehebung
description: "Beheben Sie häufige Probleme mit den Hikube-Backups: Ziel im Fehlerzustand, abgelehnter Zeitplan, fehlgeschlagenes Backup, nicht wiederherstellbares Archiv, abgelehnte Wiederherstellung und Bedeutung der Codes 180xxx."
---

# Fehlerbehebung — Backups

### Das Ziel ist im Fehlerzustand

**Ursache**: Der Bucket oder sein Benutzer ist nicht mehr lesbar (gelöscht oder Zugangsdaten widerrufen), oder eine Löschung des Ziels ist nicht abgeschlossen.

**Lösung**:

1. Lesen Sie die Meldung des Ziels in der Registerkarte **Destinations**.
2. Prüfen Sie unter **S3 Buckets**, dass der Bucket und der Benutzer noch existieren.
3. Wenn eine Löschung nicht abgeschlossen ist, nennt die Meldung, was nicht freigegeben werden konnte: Löschen Sie das Ziel erneut.
4. Wenn das Problem fortbesteht, wenden Sie sich an den [Support](mailto:support@hidora.io) und geben Sie den Namen des Ziels an.

---

### Das Ziel bleibt im Zustand Provisioning

**Ursache**: Die Einrichtung ist noch nicht abgeschlossen.

**Lösung**: Warten Sie einige Augenblicke, die Liste aktualisiert sich von selbst. Wenn der Zustand nach einigen Minuten nicht zu **Ready** wechselt, wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Die Aufbewahrung wird abgelehnt

**Ursache**: Der Wert ist keine ganze Zahl von Tagen zwischen 1 und 3 650, oder er ist kürzer als die Sperre eines WORM-Buckets.

**Lösung**: Geben Sie bei einem WORM-Bucket mindestens 365 Tage ein; die Konsole nennt das genaue Minimum.

---

### Der Zeitplan wird abgelehnt

| Ursache | Lösung |
|-------|----------|
| Der Cron-Ausdruck hat keine fünf Felder oder verwendet `@every`, `CRON_TZ=` oder `TZ=` | Verwenden Sie einen Ausdruck mit fünf Feldern in UTC oder eine Voreinstellung. |
| Die Uhrzeit löst mehr als einmal pro Stunde aus | Lassen Sie mindestens eine Stunde zwischen den Ausführungen. |
| **No destination ready in this project.** | Erstellen Sie ein Ziel oder warten Sie, bis es **Ready** ist. |
| Das Ziel wird gerade gelöscht | Wählen Sie ein anderes Ziel. |
| Eine PostgreSQL-Datenbank wird bereits in ein anderes Ziel gesichert | Verwenden Sie dasselbe Ziel wie ihre bestehenden Zeitpläne. |
| Der Planname existiert bereits oder entspricht nicht den Regeln | Wählen Sie einen anderen Namen: Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen. |

---

### Der Zeitplan ist im Fehlerzustand

**Ursache**: Die Uhrzeit ist nicht mehr gültig, oder die Ressource oder das Ziel wurde gelöscht. Die Meldung des Zeitplans nennt, welches.

**Lösung**: Löschen Sie den Zeitplan und erstellen Sie einen neuen mit einem Ziel im Zustand **Ready**.

---

### Ein Backup schlägt fehl

**Lösung**:

1. Öffnen Sie **Backups** > **Activity** und lesen Sie die **Message** der Ausführung.
2. Prüfen Sie, dass das Ziel **Ready** ist und der Bucket-Benutzer weiterhin Zugriff auf den Bucket hat.
3. Prüfen Sie, dass im Bucket und im Objektspeicher-Kontingent des Projekts noch Platz ist.
4. Starten Sie erneut mit **Back up now**.
5. Wenn der Fehler wiederholt auftritt, wenden Sie sich mit dem Namen der Ausführung an den [Support](mailto:support@hidora.io).

---

### Das erste Backup einer PostgreSQL-Datenbank schlägt fehl

**Ursache**: Bei ihrem allerersten Backup und beim ersten nach einer Wiederherstellung an Ort und Stelle wird die Datenbank für die Archivierung ihrer Protokolle umkonfiguriert und kurz neu gestartet. Dieses Backup kann fehlschlagen.

**Lösung**: Starten Sie das Backup mit **Back up now** erneut; die folgenden sind erfolgreich.

---

### Ein Backup auf Abruf wird abgelehnt

| Ursache | Lösung |
|-------|----------|
| Eine Wiederherstellung der Ressource läuft | Warten Sie das Ende der Wiederherstellung ab. |
| Die PostgreSQL-Datenbank ist nach einer fehlgeschlagenen Wiederherstellung noch nicht bereit | Warten Sie, bis die Datenbank bereit ist, oder stellen Sie sie erneut wieder her: Das stellt ihren Betrieb wieder her. |
| Das Ziel ist nicht **Ready** oder wird gerade gelöscht | Wählen Sie ein anderes Ziel. |
| Eine PostgreSQL-Datenbank wird bereits in ein anderes Ziel gesichert | Wählen Sie das Ziel ihrer Zeitpläne. |

---

### Ein Archiv ist nicht wiederherstellbar

Siehe [Prüfen, ob ein Archiv wiederherstellbar ist](./how-to/manage-archives.md#prüfen-ob-ein-archiv-wiederherstellbar-ist).

---

### Eine Wiederherstellung wird abgelehnt

| Ursache | Lösung |
|-------|----------|
| Eine Wiederherstellung dieser Ressource läuft bereits | Warten Sie, bis sie abgeschlossen ist. |
| Die ursprüngliche Datenbank existiert nicht mehr | Wählen Sie eine andere Datenbank als Ziel. |
| Die VM oder die Disk wurde seit dem Backup unter demselben Namen neu erstellt (oder eine der Disks der VM) | Löschen Sie die neu erstellte Ressource und stellen Sie dann wieder her: Die Wiederherstellung erstellt sie aus dem Archiv neu. |
| Einzeln gesicherte Disk, auf sich selbst wiederhergestellt, obwohl sie existiert | Stellen Sie ein Archiv der VM wieder her, an die die Disk angebunden ist. |
| Unterschiedliche PostgreSQL-Hauptversionen | Stellen Sie in eine PostgreSQL-Datenbank derselben Hauptversion wie die gesicherte Datenbank wieder her. |
| **No transaction after this point** | Stellen Sie den neuesten Stand wieder her: Das Ergebnis ist dasselbe. |
| Zeitpunkt außerhalb des Wiederherstellungsfensters | Wählen Sie einen Zeitpunkt innerhalb der angezeigten Grenzen. |
| Die Wiederherstellung würde von einem anderen Zweig des Verlaufs ausgehen | Wählen Sie einen früheren Zeitpunkt oder ein Archiv des gewünschten Zweigs. |
| Das Ergebnis der Wiederherstellung kann nicht garantiert werden | Versuchen Sie es später erneut. |
| Die Archivierung der Protokolle funktioniert bei der Datenbank nicht | Stellen Sie den Stand des Backups wieder her, ohne Zeitpunkt. |

---

### Die Wiederherstellung der VM wird nicht abgeschlossen

**Ursache**: Eine Übertragung hängt. Eine VM-Wiederherstellung hält nicht von selbst an.

**Lösung**: Brechen Sie sie mit **Cancel restore** ab (siehe [Ein Backup oder eine Wiederherstellung abbrechen](./how-to/cancel-backup-or-restore.md)) und starten Sie dann eine neue Wiederherstellung. Wenn die VM gestoppt bleibt, stellt diese neue Wiederherstellung sie wieder her.

---

### Die Wiederherstellung der VM ist unter Nennung einer Disk fehlgeschlagen

**Ursache**: Eine Disk des Archivs wurde nicht neu geschrieben. Die Meldung gibt an, was diese Disk enthält.

**Lösung**: Starten Sie die Wiederherstellung erneut. Die beiseitegelegten Disks wurden unter dem Namen `<disk>-orig-<kennung>` behalten: Löschen Sie sie unter **Disks**, sobald die Wiederherstellung erfolgreich war.

---

### In der Disk-Liste erscheinen `-orig-`-Disks

**Ursache**: Eine VM-Wiederherstellung mit **Keep them** oder eine fehlgeschlagene bzw. abgebrochene Wiederherstellung hat den alten Inhalt der Disks behalten.

**Lösung**: Diese Disks werden wie alle anderen abgerechnet. Holen Sie sich daraus, was Sie benötigen, und löschen Sie sie dann unter **Disks**. Der Abschnitt **Restores** zeigt an, welche Wiederherstellung sie erstellt hat.

---

### Ein Archiv kann nicht gelöscht werden

| Ursache | Lösung |
|-------|----------|
| **"…" is locked** (WORM-Ziel) | Warten Sie das angezeigte Ende der Sperre ab. |
| Eine Wiederherstellung liest dieses Archiv | Warten Sie das Ende der Wiederherstellung ab. |

---

### Das Ziel kann nicht gelöscht werden

**Ursache**: **This destination is still used by a plan, a run or a restore.**

**Lösung**: Löschen Sie die Zeitpläne, die es verwenden, und warten Sie das Ende der laufenden Backups und Wiederherstellungen ab.

---

## Ablehnungscodes

Jede Ablehnung des Backup-Service trägt einen sechsstelligen Code, der mit `180` beginnt. Wenn Sie sich an den Support wenden, geben Sie ihn zusammen mit der Meldung an.

| Code | Bedeutung | Was zu tun ist |
|------|---------------|-----------|
| 180001 | Ziel nicht gefunden | Prüfen Sie den Namen des Ziels. |
| 180002 | Zeitplan nicht gefunden | Prüfen Sie den Namen des Zeitplans. |
| 180003 | Ausführung nicht gefunden | Sie wurde möglicherweise mit ihrem Zeitplan oder am Ende ihrer Aufbewahrung gelöscht. |
| 180004 | Archiv nicht gefunden | Es wurde möglicherweise gelöscht oder am Ende seiner Aufbewahrung entfernt. |
| 180005 | Wiederherstellung nicht gefunden | Prüfen Sie den Namen der Wiederherstellung. |
| 180006 | Ein Ziel mit diesem Namen existiert bereits | Wählen Sie einen anderen Namen. |
| 180007 | Ein Zeitplan mit diesem Namen existiert bereits | Wählen Sie einen anderen Namen. |
| 180008 | Konflikt mit einer gleichzeitigen Änderung | Versuchen Sie es erneut. |
| 180009 | Service vorübergehend nicht verfügbar | Versuchen Sie es in einem Moment erneut. |
| 180010 | Die Einrichtung ist fehlgeschlagen | Versuchen Sie es erneut; wenden Sie sich an den Support, wenn der Fehler fortbesteht. |
| 180011 | Bucket im Projekt nicht gefunden | Wählen Sie einen Bucket desselben Projekts. |
| 180012 | Benutzer für diesen Bucket nicht gefunden | Wählen Sie einen Benutzer dieses Buckets oder erstellen Sie einen. |
| 180013 | Ressource nicht gefunden | Prüfen Sie, dass die Datenbank, die VM oder die Disk existiert. |
| 180014 | Löschung des Ziels unvollständig | Löschen Sie es erneut. |
| 180015 | Abbruch unvollständig | Brechen Sie erneut ab, um ihn abzuschließen. |
| 180101 | Ungültiger Zielname | Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen. |
| 180102 | Ungültiger Zeitplanname | Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen. |
| 180103 | Aufbewahrung außerhalb der Grenzen | Von 1 bis 3 650 Tagen. |
| 180105 | Unlesbare Uhrzeit, Intervall oder Zeitzone | Cron-Ausdruck mit fünf Feldern oder `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly`, in UTC. |
| 180106 | Zu häufige Uhrzeit | Höchstens eine Ausführung pro Stunde. |
| 180107 | Ressourcentyp nicht abgedeckt | Nur PostgreSQL, MariaDB, VMs und Disks lassen sich sichern. |
| 180109 | Bestätigung fehlt | Bestätigen Sie den destruktiven Vorgang. |
| 180200 | Ziel nicht bereit | Warten Sie, bis es **Ready** ist. |
| 180201 | Ziel wird noch verwendet | Löschen Sie zuerst seine Zeitpläne; warten Sie das Ende der laufenden Vorgänge ab. |
| 180204 | Archiv nicht wiederherstellbar | Die Meldung nennt den Grund. |
| 180205 | Wiederherstellung dieser Ressource läuft | Warten Sie ihr Ende ab. |
| 180206 | Das Ziel ist nicht vom selben Typ wie das Archiv | Wählen Sie eine Datenbank desselben Typs. |
| 180207 | Bestimmter Zeitpunkt oder neuester Stand außerhalb von PostgreSQL angefordert | PostgreSQL vorbehalten. |
| 180208 | Wiederherstellung in eine andere Ressource für eine VM oder Disk nicht möglich | Stellen Sie auf der ursprünglichen Ressource wieder her. |
| 180209 | Ziel wird gerade gelöscht | Wählen Sie ein anderes Ziel. |
| 180210 | Archiv wird gerade von einer Wiederherstellung gelesen | Warten Sie das Ende der Wiederherstellung ab. |
| 180211 | Die ursprüngliche Ressource existiert nicht mehr | Wählen Sie eine andere Datenbank als Ziel. |
| 180212 | PostgreSQL-Datenbank wird bereits in ein anderes Ziel gesichert | Verwenden Sie dasselbe Ziel. |
| 180213 | Keine ursprüngliche Disk zu behalten | **Keep them** gilt nur für eine auf sich selbst wiederhergestellte VM. |
| 180214 | Zeitpunkt außerhalb des Wiederherstellungsfensters | Wählen Sie einen Zeitpunkt innerhalb der angezeigten Grenzen. |
| 180215 | Archivierung der Protokolle unterbrochen | Stellen Sie den Stand des Backups wieder her. |
| 180216 | Backup nicht abbrechbar | Warten Sie sein Ende ab. |
| 180217 | Archiv durch einen WORM-Bucket gesperrt | Warten Sie das Ende der Sperre ab. |
| 180218 | Aufbewahrung kürzer als die Sperre des Buckets | Mindestens 365 Tage. |
| 180219 | Keine Transaktion nach dem angeforderten Zeitpunkt | Stellen Sie den neuesten Stand wieder her: Er ist derselbe. |
| 180220 | Der Stand des Archivs kann derzeit nicht geprüft werden | Versuchen Sie es später erneut. |
| 180221 | Die Wiederherstellung würde von einem anderen Zweig des Verlaufs ausgehen | Wählen Sie einen früheren Zeitpunkt oder ein anderes Archiv. |
| 180222 | Die VM oder eine ihrer Disks wurde seit dem Backup neu erstellt | Löschen Sie zuerst die neu erstellte Ressource. |
| 180223 | Wiederherstellung nicht abbrechbar | Warten Sie, bis sie von selbst endet. |
| 180224 | Unterschiedliche PostgreSQL-Hauptversionen | Stellen Sie in eine Datenbank derselben Hauptversion wieder her. |
| 180225 | Eine Disk wird nicht auf sich selbst wiederhergestellt | Stellen Sie ein Archiv der VM wieder her, an die sie angebunden ist. |
| 180226 | PostgreSQL-Datenbank nach einer Wiederherstellung noch nicht bereit | Warten Sie, bis sie bereit ist, oder stellen Sie sie erneut wieder her. |
| 180227 | Derzeit nichts abzubrechen | Brechen Sie in einigen Sekunden erneut ab. |
