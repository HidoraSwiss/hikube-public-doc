---
title: Hikube API v1.6.4
authors: [hikube]
tags: [release]
---

Diese Version hält eine Ressource, die gerade gelöscht wird, sichtbar, paginiert die Listen der Instanzen und Festplatten und listet die Subnetze eines ganzen Projekts mit einem einzigen Aufruf auf. Außerdem schützt sie die Systemfestplatte einer laufenden VM und lehnt eine Festplatte, die das Speicherkontingent des Projekts nicht aufnehmen kann, von vornherein ab. Die Ergänzungen entfernen nichts aus dem bestehenden Vertrag.

**Verhaltensänderung**: Eine gelöschte Ressource verschwindet nicht mehr sofort aus der API. Sie bleibt mit dem Status `deleting` lesbar, bis sie tatsächlich entfernt ist (siehe *Geändert*).

<!-- truncate -->

## Hinzugefügt

- **Netzwerk: Subnetze eines Projekts** — `GET /network/v1alpha1/projects/{project_id}/subnets` liefert mit einem einzigen Aufruf die Subnetze aller VPCs des Projekts, statt eines Aufrufs pro VPC.

- **Compute und Festplatten: Paginierung** — `GET .../instances` und `GET .../disks` akzeptieren `pageSize` (höchstens 500; ein größerer Wert wird als 500 behandelt) und `pageToken`, das `nextPageToken` der vorherigen Antwort. Die Elemente sind nach Name sortiert, und `totalCount` gibt auf jeder Seite die Größe der gesamten Sammlung an. `nextPageToken` ist auf der letzten Seite leer. Ohne diese Parameter wird die Liste wie bisher vollständig zurückgegeben.

- **Fehlercodes** — Sie werden mit HTTP 400 zurückgegeben. Das Fehlerformat ist unter [Fehler](/api/errors/) beschrieben.

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `10009` | Alle | Ungültige Seitenanfrage: negatives `pageSize` oder ein `pageToken`, das nicht aus dieser Liste stammt |
| `10010` | Alle | Die Ressource wird gerade gelöscht: Sie ist lesbar, aber nicht mehr änderbar, und ihr Name kann erst nach ihrem Verschwinden wiederverwendet werden |
| `20208` | Compute | Die Systemfestplatte einer VM lässt sich nur bei gestoppter VM ersetzen, trennen oder verschieben: Stoppen Sie die VM zuerst |
| `20209` | Compute | Die VM kann noch nicht starten: Ihre letzte Änderung wird noch angewendet (etwa 30 Sekunden). Versuchen Sie es erneut |
| `20210` | Compute | Die Festplatten, die die Erstellung oder Änderung hinzufügt oder vergrößert, passen nicht in das verbleibende Speicherkontingent des Projekts |
| `30202` | Festplatten | Die zu erstellende Festplatte oder ihre neue Größe passt nicht in das verbleibende Speicherkontingent des Projekts |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus Ihren eigenen Werkzeugen aufrufen.

- **Alle Ressourcen** — Nach ihrer Löschung bleibt eine Ressource mit dem Status `deleting` lesbar und aufgelistet, bis sie tatsächlich verschwunden ist; ein `GET` antwortet dann mit 404. In dieser Zeit werden jede Änderung der Ressource oder ihrer Unterressourcen sowie jede Erstellung unter demselben Namen mit dem Code `10010` abgelehnt. Eine erneute Löschanfrage wird weiterhin angenommen. Bisher lieferte die Ressource ab der Anfrage 404, obwohl sie noch existierte. In Echtzeit erhält die Konsole `status_changed` mit `deleting`, dann `deleted`.

- **Compute** — Die Systemfestplatte einer VM (`disks[0]`) lässt sich nur ersetzen, trennen oder verschieben, wenn die VM gestoppt ist (`stopped`). Andernfalls wird die Änderung mit dem Code `20208` abgelehnt, und nichts wird geändert.

- **Compute** — Direkt nach einer Änderung wird der Start einer VM mit dem Code `20209` abgelehnt, solange die Änderung nicht angewendet ist, also etwa 30 Sekunden lang. Ein früherer Start konnte die VM mit ihrer alten Konfiguration starten lassen, zum Beispiel mit einer gerade ersetzten Systemfestplatte. Diese Ablehnung kann auch einige Sekunden nach dem Stoppen einer VM auftreten: Versuchen Sie es erneut.

- **Festplatten und Compute** — Eine zu erstellende oder zu vergrößernde Festplatte wird mit dem verbleibenden Speicherkontingent des Projekts abgeglichen. Passt sie nicht hinein, wird die Anfrage mit dem Code `30202` (Festplatten) oder `20210` (Erstellung oder Änderung einer VM) abgelehnt, und nichts wird erstellt. `details.storageQuota` gibt die angeforderte Größe und den verbleibenden Platz an. Bisher wurde die Festplatte angenommen und blieb dann mangels Platz blockiert.

- **Kontingente** — Bei einem Projekt mit Unterprojekten ist das angezeigte und geprüfte Kontingent dasjenige, das dem Projekt nach Abzug des an seine Unterprojekte vergebenen Anteils tatsächlich verbleibt. Dieses Kontingent gilt für neue Ressourcen, für die Größenprüfung der Control Plane von Kubernetes (`70209`) und für die Echtzeit-Aktualisierungen der Konsole.

## Behoben

- **Compute** — Eine gestoppte VM bleibt gestoppt, wenn Sie sie ändern oder wenn die Plattform gewartet wird. Sie konnte von selbst neu starten.

- **MariaDB** — Die Erstellung eines Benutzers wurde seit v1.6.3 mit einem Berechtigungsfehler abgelehnt. Sie funktioniert wieder.
