---
title: Backups
sidebar_position: 0
description: "Sichern Sie Ihre PostgreSQL- und MariaDB-Datenbanken, Ihre virtuellen Maschinen und Ihre Hikube-Disks in einen Bucket Ihres Projekts und stellen Sie sie in der Konsole wieder her."
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Backups

Der Backup-Service von Hikube schützt Ihre **PostgreSQL-Datenbanken**, Ihre **MariaDB-Datenbanken**, Ihre **virtuellen Maschinen** und Ihre **Disks**. Die Backups werden auf Abruf oder nach Zeitplan in einen Bucket Ihres Projekts geschrieben und in der [Hikube-Konsole](https://console.hikube.cloud) im Menü **Infrastructure** > **Backups** wiederhergestellt.

## Schnellzugriff

<ServiceCardGrid items={[
  {
    title: "Übersicht",
    description: "Was der Service sichert, wohin die Archive gehen und wie eine Wiederherstellung abläuft.",
    icon: "/img/services/backups.svg",
    href: "./overview",
    tags: ["PostgreSQL", "MariaDB", "VM", "Disks"],
  },
  {
    title: "Schnellstart",
    description: "Erstellen Sie ein Ziel, planen Sie ein Backup und stellen Sie ein Archiv wieder her.",
    icon: "/img/services/backups.svg",
    href: "./quick-start",
  },
  {
    title: "Praktische Anleitungen",
    description: "Ziele, Zeitpläne, Wiederherstellung zu einem bestimmten Zeitpunkt, Abbrechen.",
    icon: "/img/services/backups.svg",
    href: "./how-to/create-destination",
  },
]} />
