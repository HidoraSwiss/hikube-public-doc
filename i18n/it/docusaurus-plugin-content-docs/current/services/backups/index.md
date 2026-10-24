---
title: Backup
sidebar_position: 0
description: "Esegua il backup dei suoi database PostgreSQL e MariaDB, delle sue macchine virtuali e dei suoi dischi Hikube verso un bucket del suo progetto, poi li ripristini dalla console."
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Backup

Il servizio di backup di Hikube protegge i suoi **database PostgreSQL**, i suoi **database MariaDB**, le sue **macchine virtuali** e i suoi **dischi**. I backup vengono scritti in un bucket del suo progetto, su richiesta o secondo una pianificazione, e si ripristinano dalla [console Hikube](https://console.hikube.cloud), menu **Infrastructure** > **Backups**.

## Accesso rapido

<ServiceCardGrid items={[
  {
    title: "Panoramica",
    description: "Che cosa salva il servizio, dove finiscono gli archivi e come si svolge un ripristino.",
    icon: "/img/services/backups.svg",
    href: "./overview",
    tags: ["PostgreSQL", "MariaDB", "VM", "Dischi"],
  },
  {
    title: "Avvio rapido",
    description: "Crei una destinazione, pianifichi un backup e ripristini un archivio.",
    icon: "/img/services/backups.svg",
    href: "./quick-start",
  },
  {
    title: "Guide pratiche",
    description: "Destinazioni, pianificazioni, ripristino a un istante preciso, annullamento.",
    icon: "/img/services/backups.svg",
    href: "./how-to/create-destination",
  },
]} />
