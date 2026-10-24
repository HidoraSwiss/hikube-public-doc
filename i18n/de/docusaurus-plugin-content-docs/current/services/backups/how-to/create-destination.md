---
title: "Ein Backup-Ziel erstellen und verwalten"
sidebar_position: 1
description: "Erstellen Sie ein Hikube-Backup-Ziel auf einem Bucket Ihres Projekts, ändern Sie seine Aufbewahrung, verwenden Sie einen gesperrten Bucket (WORM) und löschen Sie ein Ziel."
---

# Ein Backup-Ziel erstellen und verwalten

Ein Ziel gibt an, wohin die Backups des Projekts geschrieben werden und wie lange sie aufbewahrt werden. Diese Anleitung erstellt es in der [Hikube-Konsole](https://console.hikube.cloud) und erklärt anschließend, wie Sie seine Aufbewahrung ändern und es löschen.

## Voraussetzungen

- Ein **S3-Bucket** im Projekt (siehe [Einen Bucket erstellen](../../storage/buckets/quick-start.md)). Für Archive, die niemand vor Ablauf eines Jahres löschen kann, erstellen Sie ihn mit Objektsperre (siehe [Gesperrter Bucket](#einen-gesperrten-bucket-worm-verwenden)).

## Ein Ziel erstellen

1. Öffnen Sie **Infrastructure** > **Backups**, Registerkarte **Destinations**, und klicken Sie dann auf **Create a destination**.
2. Füllen Sie die Seite **New destination** aus:

   | Feld | Wert |
   |-------|--------|
   | **Name** | Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen, ohne Bindestrich am Anfang oder Ende. Eindeutig im Projekt. |
   | **Bucket** | Ein Bucket des Projekts. |
   | **Credentials** | **Create a dedicated user** (empfohlen) mit einem **User name**, oder **Use an existing user** des Buckets. |
   | **Retention (days)** | Ganze Zahl von Tagen, von 1 bis 3 650. |

3. Klicken Sie auf **Create**. Die Konsole zeigt **Destination created** an.

In der Registerkarte **Destinations** wechselt das Ziel von **Provisioning** zu **Ready**. Es kann dann von allen PostgreSQL- und MariaDB-Datenbanken, VMs und Disks des Projekts verwendet werden.

:::tip Ein dedizierter Benutzer
Ein Bucket-Benutzer, der den Backups vorbehalten ist, kann widerrufen werden oder neue Schlüssel erhalten, ohne die Anwendungen zu beeinträchtigen, die denselben Bucket verwenden. Wenn die Erstellung des Benutzers gelingt, die des Ziels aber nicht, weist die Konsole darauf hin: Versuchen Sie es erneut und wählen Sie diesen bestehenden Benutzer, oder löschen Sie ihn in der Ansicht des Buckets.
:::

## Die Aufbewahrung ändern

1. Öffnen Sie in der Registerkarte **Destinations** das Menü des Ziels und wählen Sie **Change retention**.
2. Geben Sie die **Days kept** ein und klicken Sie dann auf **Save**.

Der neue Wert gilt nicht für alle Archive auf dieselbe Weise:

- **MariaDB, VMs, Disks**: Die bereits geschriebenen Archive behalten ihre Aufbewahrung; nur die folgenden übernehmen den neuen Wert.
- **PostgreSQL**: Der neue Wert gilt für den gesamten Verlauf. Eine Verkürzung kann bestehende Archive ab dem nächsten Backup löschen.

## Einen gesperrten Bucket (WORM) verwenden

Wenn der gewählte Bucket mit Objektsperre erstellt wurde, wird jedes Archiv darin 365 Tage lang gesperrt: Niemand kann es vorher löschen. Die Konsole zeigt **WORM · 365 d** neben dem Ziel an.

- Die Aufbewahrung muss mindestens 365 Tage betragen. Ein kürzerer Wert wird sowohl bei der Erstellung als auch bei der Änderung abgelehnt, mit Angabe des genauen Minimums.
- Die Sperre eines Buckets ändert sich nie: Sie wird bei seiner Erstellung festgelegt.

## Ein Ziel löschen

1. Öffnen Sie in der Registerkarte **Destinations** das Menü des Ziels und wählen Sie **Delete**.
2. Bestätigen Sie.

Beachten Sie vor dem Bestätigen:

- Die Löschung wird **abgelehnt**, solange ein Zeitplan, ein laufendes Backup oder eine Wiederherstellung das Ziel verwendet: Löschen Sie zuerst die betroffenen Zeitpläne;
- die bereits erstellten Archive **bleiben in Ihrem Bucket**: Nichts wird gelöscht;
- diese Archive sind **nicht mehr wiederherstellbar**, auch wenn Sie anschließend ein gleichnamiges Ziel auf demselben Bucket neu erstellen;
- bei PostgreSQL wird die Aufbewahrung nicht mehr angewendet: Die Archive werden nicht mehr automatisch gelöscht.

Wenn die Löschung nicht vollständig gelingt, bleibt das Ziel im Zustand **Error** aufgeführt, mit einer Meldung, die angibt, was nicht freigegeben werden konnte: Löschen Sie es erneut.

## Überprüfung

- Das Ziel ist in der Registerkarte **Destinations** im Zustand **Ready**.
- In der Registerkarte **Backups** einer Datenbank, einer VM oder einer Disk wird das Ziel unter **Schedule** und **Back up now** angeboten.

## Weiterführende Informationen

- [Backups planen](./schedule-backups.md)
- [Konzepte: Ziele](../concepts.md#ziele)
