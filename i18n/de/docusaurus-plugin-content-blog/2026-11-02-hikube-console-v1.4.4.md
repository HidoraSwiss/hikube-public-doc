---
title: Hikube-Konsole v1.4.4
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.6.4. Eine gelöschte Ressource bleibt angezeigt, bis ihre Löschung abgeschlossen ist, und die Systemfestplatte einer VM wird in einer eigenen Ansicht gewechselt. Eine beim Start hängende VM lässt sich jetzt stoppen, und die Topologiekarte des Dashboards lädt schneller.

<!-- truncate -->

## Hinzugefügt

- **VM-Instanzen: Systemfestplatte wechseln** — In einer eigenen Ansicht lässt sich die Systemfestplatte einer gestoppten VM durch eine bestehende, nicht angehängte Festplatte oder durch eine neue, leere Festplatte ersetzen. Eine Zusammenfassung erinnert daran, dass die alte Festplatte getrennt und aufbewahrt wird, danach wird eine Bestätigung verlangt. Bei einer laufenden VM fordert die Ansicht dazu auf, sie zuerst zu stoppen, und bietet dies an. Sie ist über die Seite der VM und über deren Bearbeitung erreichbar.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Alle Ressourcen** — Eine gelöschte Ressource bleibt mit dem Status **Deleting** in der Liste, bis sie verschwindet. Ihre Bearbeitungsaktionen sind deaktiviert, und der Grund wird angegeben. Wird eine Ressource unter dem Namen einer Ressource erstellt, die noch gelöscht wird, erscheint eine eigene Meldung: Versuchen Sie es erneut, sobald die Löschung abgeschlossen ist.

- **VM-Instanzen** — Direkt nach einer Änderung oder einige Sekunden nach einem Stopp kann der Start vorübergehend abgelehnt werden. Die Konsole zeigt **Change still being applied** an und versucht es selbst erneut; eine Schaltfläche **Retry** erscheint, wenn das Warten länger dauert.

- **VM-Instanzen** — Eine VM, die beim Start hängt oder fehlerhaft ist, zum Beispiel mangels Kontingent, lässt sich über ihre Seite, die VM-Liste und die Ansicht der Systemfestplatte stoppen. Der Grund der Blockierung wird auf der Seite angezeigt.

- **Dashboard** — Die Topologiekarte lädt die Subnetze aller VPCs des Projekts mit einer einzigen Anfrage und begrenzt die Anzahl der pro Subnetz angezeigten VMs.

## Behoben

- **VM-Instanzen** — In der VM-Liste zeigt die Spalte **Network** zuerst die öffentliche Adresse einer VM, markiert mit „public“, oder **No public IP**. Bisher stand „Public IP: Yes“ über allen Adressen, auch über privaten.

- **Festplatten** — Die Farbe des Status unterscheidet wieder eine Festplatte im Status **Ready** von einer im Status **In Use**.

- **Images** — Eine ISO-Image-Karte öffnet sich mit einem Klick.

- **Navigation** — Die Rückkehr auf eine Seite stellt ihre Scrollposition wieder her.
