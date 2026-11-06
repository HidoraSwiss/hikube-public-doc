---
title: Hikube API v1.6.5
authors: [hikube]
tags: [release]
---

Diese Korrekturversion stellt den angezeigten Verbrauch und die Quota-Prüfungen von Projekten wieder her, die kein eigenes Quota haben und das ihrer Organisation teilen.

<!-- truncate -->

## Behoben

- **Quotas** — Für ein Projekt ohne eigenes Quota, das sich das Quota seiner Organisation teilt, lieferte `GET .../projects/{name}/quota-usage` `0` verbraucht von insgesamt `0`, und die Konsole zeigte deshalb ein leeres Projekt an. Der tatsächliche Verbrauch wird wieder geliefert, und der Gesamtwert ist der Anteil am Quota der Organisation, der für das Projekt gilt. Die Echtzeit-Aktualisierungen der Konsole folgen derselben Regel.

- **Quotas** — Für dieselben Projekte wurden das Anlegen oder Vergrößern eines Datenträgers (`30202`, `20210`) und die Größenänderung einer Kubernetes-Control-Plane (`70209`) nicht gegen das Quota geprüft. Eine zu große Anfrage wurde angenommen und blieb dann mangels Platz hängen. Sie wird wieder sofort abgelehnt, und es wird nichts angelegt.
