---
title: "Eine PostgreSQL-Datenbank zu einem bestimmten Zeitpunkt wiederherstellen"
sidebar_position: 4
description: "Stellen Sie eine Hikube-PostgreSQL-Datenbank auf den exakten Stand eines Backups, auf ihren neuesten Stand oder auf einen bestimmten Zeitpunkt wieder her, dank der kontinuierlich archivierten Transaktionsprotokolle."
---

# Eine PostgreSQL-Datenbank zu einem bestimmten Zeitpunkt wiederherstellen

Eine gesicherte PostgreSQL-Datenbank archiviert ihre **Transaktionsprotokolle** zwischen zwei Backups kontinuierlich in ihr Ziel. Diese Anleitung nutzt sie, um eine Datenbank in der [Hikube-Konsole](https://console.hikube.cloud) auf einen bestimmten Zeitpunkt zurückzusetzen, zum Beispiel unmittelbar vor einer versehentlichen Löschung.

## Voraussetzungen

- Eine PostgreSQL-Datenbank mit mindestens einem wiederherstellbaren Archiv im Zustand **Ready**, das **vor** dem gewünschten Zeitpunkt erstellt wurde.
- [Eine PostgreSQL- oder MariaDB-Datenbank wiederherstellen](./restore-database.md#bevor-sie-beginnen) gelesen haben: Es gelten dieselben Vorsichtsmaßnahmen.

## Was Sie wiederherstellen können

| Auswahl unter **Restore up to** | Ergebnis |
|----------------------------------|----------|
| **State of the backup of …** (Standard) | Der exakte Stand des gewählten Archivs. |
| **Most recent state** | Das Archiv, dann alle seitdem archivierten Protokolle, bis zum letzten bekannten Schreibvorgang. |
| Ein Zeitpunkt auf der Zeitleiste oder ein **Date** und eine **Time (24 h)** | Der Stand der Datenbank unmittelbar vor der ersten Transaktion nach diesem Zeitpunkt. |

## Schritte

### 1. Das Archiv wählen

1. Öffnen Sie **PostgreSQL**, die Datenbank und dann ihre Registerkarte **Backups**.
2. Klicken Sie in der Zeile des neuesten Archivs, das **vor** dem gewünschten Zeitpunkt liegt, auf **Restore**.
3. Wählen Sie das **Restore target**. Um die Daten zu untersuchen, ohne die laufende Datenbank anzutasten, wählen Sie **Another application** und eine leere Datenbank derselben Version.

### 2. Den Zeitpunkt wählen

Der Abschnitt **Restore up to** zeigt eine Zeitleiste an. Stellen Sie die **Scale** ein (**1 h**, **6 h**, **1 day**, **7 days**) und navigieren Sie mit **Previous backup** / **Next backup**.

- Klicken Sie auf die Zeitleiste oder geben Sie ein **Date** und eine **Time (24 h)** in lokaler Zeit ein. Die Konsole zeigt die Grenzen des Fensters an: **Restorable from … to …**.
- Ein Zeitpunkt außerhalb des Fensters wird auf die nächstgelegene Grenze gesetzt, und die Konsole weist darauf hin (**Before the first backup: moved to …**, **Not archived yet: moved to …**).
- **Back to the most recent** wählt den neuesten Stand aus.

Die Beschriftung der Schaltfläche übernimmt Ihre Auswahl: **Restore the state at …**, **Restore the most recent state**, **Restore the state of the backup of …**.

### 3. Bestätigen

Geben Sie den verlangten Namen ein und klicken Sie dann auf die Wiederherstellungsschaltfläche.

## Das Fenster verstehen

```mermaid
flowchart LR
    A["Beginn des Backups"] --> B["Ende des Backups<br/>(erster wiederherstellbarer Zeitpunkt)"]
    B --> C["Wiederherstellbare Zeitpunkte"]
    C --> D["Letzte archivierte Transaktion<br/>(nicht eingeschlossen)"]
    D --> E["Noch nicht archiviert"]
```

- **Erster Zeitpunkt**: das Ende des Backups, nicht sein Beginn. Die Datenbank ist erst nach Abschluss des Backups konsistent.
- **Letzter Zeitpunkt**: unmittelbar vor der letzten archivierten Transaktion. Eine Wiederherstellung hält bei der ersten Transaktion an, die auf den angeforderten Zeitpunkt **folgt**; nach der letzten Transaktion gibt es keine mehr, und der Zeitpunkt kann nicht erreicht werden. Um diesen letzten Schreibvorgang einzuschließen, wählen Sie **Most recent state**.
- **Noch nicht archiviert**: Die Protokolle gehen mit einigen Minuten Verzögerung an das Ziel; die allerletzten Minuten sind noch nicht wiederherstellbar.
- **Kein Schreibvorgang**: Wenn seit dem Backup nichts geschrieben wurde, ist der neueste Stand der des Backups, und die Konsole weist darauf hin (**Same as the most recent state**).

## Sonderfälle

| Meldung | Bedeutung | Was zu tun ist |
|---------|---------------|-----------|
| **Last write unknown** | Die archivierten Protokolle konnten nicht gelesen werden: Das angezeigte Fenster ist nur eine Schätzung. | Versuchen Sie es später erneut, oder stellen Sie den Stand des Backups wieder her. |
| „log archiving is not working on this database“ | Kein Zeitpunkt nach dem Backup kann garantiert werden. | Stellen Sie den Stand des Backups wieder her; wenden Sie sich an den Support, wenn die Archivierung nicht wieder aufgenommen wird. |
| Zeitpunkte **ab dem …** nicht angeboten (anderer Zweig des Verlaufs) | Eine frühere Wiederherstellung an Ort und Stelle hat einen neuen Zweig des Verlaufs erzeugt; nach diesem Datum würde die Wiederherstellung von einem Archiv des anderen Zweigs ausgehen. | Wählen Sie einen früheren Zeitpunkt oder ein Archiv des gewünschten Zweigs. |
| **No transaction after this point** | Der Zeitpunkt liegt nach dem letzten archivierten Schreibvorgang. | Wählen Sie **Most recent state**: Das Ergebnis ist dasselbe. |

## Überprüfung

- Die Wiederherstellung ist **Succeeded**; die Spalte **Recovery point** im Abschnitt **Restores** zeigt den wiederhergestellten Zeitpunkt, **State of the backup** oder **Most recent state** an.
- Verbinden Sie sich mit der Datenbank und prüfen Sie, dass die gewünschten Daten vorhanden sind und die Änderungen nach dem gewählten Zeitpunkt fehlen.

## Weiterführende Informationen

- [Konzepte: Wiederherstellung zu einem bestimmten Zeitpunkt](../concepts.md#wiederherstellung-zu-einem-bestimmten-zeitpunkt-postgresql)
- [Fehlerbehebung](../troubleshooting.md#eine-wiederherstellung-wird-abgelehnt)
