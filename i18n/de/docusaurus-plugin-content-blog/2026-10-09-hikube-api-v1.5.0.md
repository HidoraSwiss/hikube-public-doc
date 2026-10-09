---
title: Hikube API v1.5.0
authors: [hikube]
tags: [release]
---

Die API liefert jetzt die interne Adresse verwalteter Datenbanken, die Mitglieder eines exponierten MongoDB-Replica-Sets und die Aufbewahrung von WORM-Buckets. Änderungen, die die Plattform nicht anwenden kann, etwa eine niedrigere Version oder ein kleinerer Speicher, lehnt sie schon bei der Anfrage ab, und die kubeconfig ist den Projektadministratoren vorbehalten.

<!-- truncate -->

## Hinzugefügt

- **Verwaltete Datenbanken** — Das neue Feld `internalHost` liefert die interne Adresse jedes PostgreSQL-, MariaDB-, MongoDB-, Redis- und RabbitMQ-Clusters, auch ohne externen Zugriff. Sie ist von den VMs und Kubernetes-Clustern desselben Projekts erreichbar, auf dem Standardport der Engine. Wenn eine Debian-VM diese Adresse nicht auflöst, folgen Sie [DNS .local in VMs auflösen](/services/compute/how-to/fix-dns-local/).

- **MongoDB** — Ein Replica Set mit externem Zugriff liefert die Adresse jedes Mitglieds in `hosts` und den Namen des Replica Sets in `replicaSet`. Das Feld `host` bleibt bei einem Replica Set leer, da es keinen einzelnen Einstiegspunkt hat. Verbinden Sie sich von außen mit einem Mitglied über `directConnection=true`.

- **Storage S3** — Ein gesperrter Bucket (WORM) liefert seine Aufbewahrung in `retention`: Dauer in Tagen, Modus (`compliance`) und ob die Objekte beim Löschen des Buckets erhalten bleiben.

- **Compute** — Das Feld `restartRequired` einer VM zeigt an, dass eine Änderung erst nach einem Neustart wirksam wird, zum Beispiel neu geladene UserData oder eine getrennte Festplatte.

- **OpenAPI-Spezifikation** — Die Feldbeschreibungen nennen die Regeln, die die API tatsächlich anwendet: Länge und Format der Namen, erwarteter Image-Name, erlaubte Rollen. Die Spezifikation beschreibt außerdem den Fehlerinhalt (`requestId`, `code`, `message`, `details`) und die vollständige Liste der Fehlercodes.

- **Fehlercodes** — Jede neue Ablehnung hat einen eigenen Code. Alle werden mit HTTP 400 zurückgegeben.

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `30200` | Festplatten | Eine Festplatte kann nicht verkleinert werden |
| `70205` | Kubernetes | Die Kubernetes-Umgebung des Projekts wird vorbereitet: in einigen Minuten erneut versuchen |
| `70206` | Kubernetes | Herabstufung der Version abgelehnt |
| `70207` | Kubernetes | Die Konfiguration des Projekts erlaubt keinen Cluster: nicht erneut versuchen, Support kontaktieren |
| `70208` | Kubernetes | Die Vorbereitung der Kubernetes-Umgebung des Projekts ist fehlgeschlagen: nicht erneut versuchen, Support kontaktieren |
| `80203` / `80204` | PostgreSQL | Herabstufung der Version abgelehnt / Speicher kann nicht verkleinert werden |
| `110203` / `110204` | MariaDB | Herabstufung der Version abgelehnt / Speicher kann nicht verkleinert werden |
| `120203` / `120204` | Redis | Herabstufung der Version abgelehnt / Speicher kann nicht verkleinert werden |
| `140203` / `140204` | RabbitMQ | Herabstufung der Version abgelehnt / Speicher kann nicht verkleinert werden |
| `150203` / `150204` | MongoDB | Herabstufung der Version abgelehnt / Speicher kann nicht verkleinert werden |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus eigenen Werkzeugen aufrufen.

- **Verwaltete Datenbanken und Kubernetes** — Eine Aktualisierung, die eine niedrigere Version oder weniger Speicher als den aktuellen verlangt, wird abgelehnt, bevor sie die Plattform erreicht. Bisher wurde sie angenommen, scheiterte dann auf der Plattform, und die Ressource blieb in der Bereitstellung hängen. Bei Kubernetes wird nur die Version geprüft: Die Festplatte der Knoten lässt sich weiterhin verkleinern, da die Knoten ersetzt werden. Ist Ihre letzte Änderung fehlgeschlagen, bleibt die Rückkehr zu den laufenden Werten erlaubt.

- **Festplatten** — Eine Festplatte kann nicht mehr verkleinert werden, weder direkt noch über die Aktualisierung der VM, die sie nutzt (Code `30200`).

- **Status der Ressourcen** — Ein VPC, ein Projekt oder eine verwaltete Anwendung, deren letzte Änderung nicht angewendet werden konnte, erhält den Status `error`. Diese Ressourcen blieben bisher unbegrenzt in `provisioning`. Eine Ressource mit fehlgeschlagener Änderung kann mit ihrer vorherigen Konfiguration weiterlaufen.

- **Kubernetes** — Die kubeconfig eines Clusters gewährt Administratorzugriff: Ihr Download ist jetzt den Projektadministratoren vorbehalten. Andere Mitglieder erhalten einen 403-Fehler.

- **Compute** — Die Rolle `use` eines Projekts kann VMs jetzt starten, stoppen und neu starten. Diese Aktionen erforderten bisher die Administratorrolle.

- **Kubernetes** — Die Erstellung des ersten Clusters eines Projekts beginnt erst, wenn die Kubernetes-Umgebung des Projekts bereit ist. Während dieser wenigen Minuten antwortet die API mit `70205` und erstellt nichts. Senden Sie dieselbe Anfrage später erneut. Ein weiterer Cluster kann diesen Code kurz erhalten, während das Projekt geändert wird, etwa bei einer Quotenänderung.

- **MariaDB und MongoDB** — Systemdatenbanken können nicht mehr Ziel einer Rolle sein oder erstellt werden: `mysql`, `information_schema`, `performance_schema` und `sys` bei MariaDB, `admin`, `local` und `config` bei MongoDB. Hat ein bestehender Benutzer noch eine Rolle auf einer Systemdatenbank, entfernen Sie sie bei seiner nächsten Aktualisierung, sonst wird diese abgelehnt.

- **Autorisierung** — Ein nicht existierendes Projekt und ein existierendes, aber verbotenes Projekt erhalten jetzt denselben 403-Fehler, mit demselben Code und derselben Meldung. Diese Fälle lieferten bisher je nach Ressource 400 oder 404.

- **Projekte** — Der Projektname `super` ist reserviert.

## Behoben

- **Kubernetes** — Der erste Cluster eines Projekts bleibt beim Start nicht mehr rund zwanzig Minuten im Fehlerzustand, und seine Add-ons bleiben nicht mehr fehlerhaft.

- **Compute** — Die Aktualisierung einer VM liefert keinen 500-Fehler mehr, wenn eine ihrer bestehenden Festplatten kleiner als das Erstellungsminimum (20 GB) ist. Eine Ablehnung, die eine Festplatte betrifft, wird mit ihrem eigenen Code und der betroffenen Festplatte (`disks[1]: …`) zurückgegeben. Vor der abgelehnten Festplatte bearbeitete Festplatten bleiben geändert.

- **Compute** — Dieselbe IP-Adresse erscheint nicht mehr mehrfach in der Adressliste einer VM.

- **Datenbanken und Festplatten** — Ein Volume ab 1 TiB wird mit seiner tatsächlichen Größe (`1024` für 1 TiB) statt `1` gemeldet.

- **MariaDB** — Ein einzelner MariaDB-Server mit externem Zugriff liefert seine externe Adresse in `host`.

- **Storage S3** — Ein Bucket-Benutzer mit Lesezugriff kann wieder auf Lese-/Schreibzugriff umgestellt werden. Die Antwort liefert den Benutzer so, wie er gespeichert ist. Senden Sie `readonly` immer explizit: `"config": {}` gibt dem Benutzer Lese-/Schreibzugriff.

- **Plattform** — Eine Anfrage, die einen internen Fehler auslöst, erhält eine 500-Antwort und unterbricht den Dienst für andere Anfragen nicht mehr.

## Sicherheit

- **Kubernetes** — Ein Projektmitglied ohne Administratorrolle konnte die kubeconfig herunterladen, die Administratorzugriff auf den Cluster gewährt. Dieser Download ist jetzt den Projektadministratoren vorbehalten.

- **Autorisierung** — Fehlerantworten verraten nicht mehr, ob ein Projekt existiert, auf das Sie keinen Zugriff haben.

- **Echtzeit-Ereignisse** — Der Zugriff auf den Ereignisstrom wird für jeden angefragten Ressourcentyp geprüft, Quoten eingeschlossen. Eine Anfrage ohne Typ wird abgelehnt (400).
