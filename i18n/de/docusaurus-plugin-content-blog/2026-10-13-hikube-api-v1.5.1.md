---
title: Hikube API v1.5.1
authors: [hikube]
tags: [release]
---

Verwaltete Datenbanken, RabbitMQ und die Kubernetes-Control-Plane werden jetzt mit den Größen der virtuellen Maschinen dimensioniert, und verwaltete Anwendungen werden mit 10 CHF pro vCPU und pro GiB abgerechnet. Diese Version schützt außerdem die Systemfestplatte laufender VMs und vereinheitlicht die Regeln für PostgreSQL-Datenbanken.

<!-- truncate -->

## Hinzugefügt

- **Verwaltete Datenbanken und RabbitMQ** — Das Feld `preset` nimmt die Größen der virtuellen Maschinen aus den Serien `u1`, `s1` und `m1` an. Eine Größe hat dieselben Ressourcen wie eine gleichnamige VM: `u1.medium` entspricht 1 vCPU und 4 GiB. Die 17 angebotenen Größen reichen von `s1.small` (1 vCPU / 2 GiB) bis `m1.8xlarge` (32 vCPU / 256 GiB). Die Operation `presets` jedes Dienstes listet sie mit ihren Ressourcen auf.

- **Kubernetes** — Die Control Plane wird in `u1.small` (1 vCPU / 2 GiB) oder `u1.2xmedium` (2 vCPU / 4 GiB) dimensioniert. Die Größe gilt für ihre vier Komponenten, und die Antwort nennt die Größe jeder einzelnen.

- **Ressourcen** — Die Antwort einer Datenbank, von RabbitMQ oder eines Kubernetes-Clusters nennt die tatsächlichen Ressourcen ihrer Größe (`resources`: CPU und Speicher).

- **Fehlercodes** — Zwei neue Ablehnungen, mit HTTP 400 zurückgegeben:

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `20208` | Compute | Die Systemfestplatte einer bestehenden VM kann weder ersetzt noch getrennt noch verschoben werden |
| `30201` | Festplatten | Die Festplatte ist getrennt, wird aber bis zum nächsten Neustart noch von der VM genutzt: Sie kann noch nicht gelöscht werden |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus eigenen Werkzeugen aufrufen.

- **Größen der Datenbanken und von RabbitMQ** — Die bisherigen Namen (`small`, `medium`, `large`…) werden vorerst weiter akzeptiert, mit unveränderten Ressourcen. Jede Anfrage, die einen davon verwendet, erhält einen `Warning`-Header mit der entsprechenden Größe, die zu verwenden ist. Ein Name der Serien `u1`, `s1` oder `m1` bezeichnet immer die VM-Größe: `u1.small` wird zum Beispiel für eine Datenbank abgelehnt.

- **Kubernetes** — Eine Control Plane kleiner als `small` wird bei der Erstellung und bei einer Größenänderung abgelehnt (Code `70111`): `nano`, `micro` und ihre Entsprechungen. Ein bestehender Cluster dieser Größe bleibt bearbeitbar, solange sich seine Größe nicht ändert.

- **Preise** — Eine verwaltete Anwendung kostet 10 CHF pro Monat pro vCPU und pro GiB Speicher: `s1.small` kostet 30 CHF, `u1.medium` 50 CHF. Die Kubernetes-Control-Plane bleibt bei der Pauschale von 32 CHF pro Monat, unabhängig von ihrer Größe. Eine Datenbank mit einem bisherigen Größennamen hat keinen Katalogpreis, bis sie auf eine Größe der Liste umgestellt ist.

- **Quoten** — Die Quote zählt jetzt die drei Sentinels eines Redis-Clusters, in der Größe des Clusters, sowie die vier Komponenten der Kubernetes-Control-Plane. Die Sentinels werden nicht abgerechnet.

- **PostgreSQL** — Die Systemdatenbanken `postgres`, `template0` und `template1` können keine Rolle mehr erhalten und weder erstellt, geändert noch gelöscht werden (Code `80105`). Ein Benutzer, der bereits eine Rolle auf einer von ihnen hat, behält sie, solange sich diese Rolle nicht ändert.

- **PostgreSQL** — Ein Datenbankname darf Kleinbuchstaben, Ziffern, Unterstriche (`_`) und Bindestriche enthalten. Er beginnt mit einem Buchstaben oder einem Unterstrich, nicht mit `pg_`, und hat höchstens 54 Zeichen. Namen mit 55 bis 63 Zeichen, die bisher akzeptiert wurden, werden abgelehnt (Code `80105`).

- **Compute** — Eine VM-Aktualisierung, die ihre Systemfestplatte ersetzt, entfernt oder verschiebt, wird abgelehnt (Code `20208`). Um die Systemfestplatte zu wechseln, löschen Sie die VM und erstellen Sie sie anschließend von der gewünschten Festplatte neu.

- **Festplatten** — Das Löschen einer noch genutzten Festplatte wird abgelehnt: eine an eine VM angehängte oder in ihr aufgeführte Festplatte (Code `30007`) oder eine getrennte Festplatte, die die VM bis zu ihrem nächsten Neustart nutzt (Code `30201`). Starten Sie die VM neu und versuchen Sie es dann erneut.

## Behoben

- **Kubernetes** — Eine Aktualisierung, die die Control Plane nicht ändert, etwa das Aktivieren eines Add-ons, verändert sie nicht mehr und ersetzt ihre Komponenten nicht mehr.

- **Kubernetes, PostgreSQL und Redis** — Ein Cluster, dessen Größe nicht in der Liste steht, bleibt bearbeitbar: Seine Größe wird unverändert zurückgegeben und nicht mehr abgelehnt, solange sie sich nicht ändert.

- **PostgreSQL** — Datenbanknamen mit Unterstrich, etwa `app_db`, werden akzeptiert.

## Sicherheit

- **Compute und Festplatten** — Eine VM-Änderung konnte die Systemfestplatte einer laufenden VM ersetzen oder trennen, und diese Festplatte konnte danach gelöscht werden, während die VM sie noch nutzte. Die API lehnt beide Vorgänge jetzt ab.
