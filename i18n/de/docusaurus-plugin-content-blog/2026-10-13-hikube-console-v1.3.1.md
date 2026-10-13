---
title: Hikube-Konsole v1.3.1
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.5.1: Die Formulare bieten die Größen an, die die Plattform bereitstellt. Die Festplatten einer bestehenden VM lassen sich nicht mehr über die Bearbeitungsseite ersetzen, und die PostgreSQL-Bildschirme folgen den neuen Datenbankregeln.

<!-- truncate -->

## Hinzugefügt

- **Datenbanken und Kubernetes** — Die Größenlisten kommen von der Plattform, mit ihren Ressourcen, zum Beispiel „u1.medium — 1 CPU / 4Gi“. Für die Kubernetes-Control-Plane bietet die Konsole `s1.small` und `s1.medium` an. Kann die Liste nicht geladen werden, sagt eine Meldung dies, statt eine veraltete Liste anzuzeigen.

- **Kubernetes** — Die Bearbeitungsseite eines Clusters zeigt schreibgeschützt die Größe jeder der vier Komponenten der Control Plane.

- **Erzwungene Ressourcen** — Sind die Ressourcen einer Instanz außerhalb ihrer Größe festgelegt, zeigt das Formular dies mit dem Hinweis „(override)“ und einer Erklärung.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Datenbanken und Kubernetes** — Bei der Erstellung ist keine Größe vorausgewählt: Sie müssen eine wählen. Beim Bearbeiten bleibt die aktuelle Größe angezeigt und wird unverändert zurückgesendet, auch wenn sie nicht mehr in der Liste steht.

- **Redis** — Die Quotenvorschau zählt die drei Sentinels des Clusters in der gewählten Größe.

- **VM-Instanzen** — Auf der Bearbeitungsseite einer VM werden ihre bestehenden Festplatten schreibgeschützt angezeigt. Die Systemfestplatte hat keine Aktion mehr, mit der Erklärung „The system disk of an existing VM cannot be replaced: the VM boots from it.“ Eine Datenfestplatte bietet nur noch **Detach disk** an. Die Wahl **New** / **Existing** bleibt für im Formular hinzugefügte Festplatten verfügbar.

- **Festplatten** — Das Löschen einer getrennten Festplatte, die die VM noch nutzt, wird mit einer klaren Meldung abgelehnt: „This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.“ Auch das Löschen einer angehängten Festplatte zeigt eine eindeutige Meldung statt eines technischen Fehlers.

- **PostgreSQL** — Systemdatenbanken werden in den Benutzer-Assistenten nicht mehr angeboten, und ihre Erstellung wird abgelehnt. In der Datenbankliste sind **Manage extensions** und **Delete** bei einer Systemdatenbank deaktiviert. Eine bestehende Rolle auf einer Systemdatenbank wird in **Manage Access** gesperrt angezeigt, mit einer Warnung: Sie können sie entfernen, aber nicht ändern.

- **PostgreSQL** — Datenbanknamen folgen der Regel der Plattform: Kleinbuchstaben, Ziffern, Unterstriche und Bindestriche, höchstens 54 Zeichen, beginnend mit einem Buchstaben oder einem Unterstrich, aber nicht mit `pg_`. Bindestriche werden bei der Eingabe nicht mehr entfernt.

## Behoben

- **PostgreSQL** — Auf der Seite **Create a user** behält der Benutzername seine Unterstriche: `u_app` wird nicht mehr zu `uapp`.

- **PostgreSQL** — Der Erstellungsassistent wählt für die Benutzer nicht mehr die Systemdatenbank `postgres` vor. Ohne Anwendungsdatenbank wird der Benutzer ohne Rechte angelegt. Lehnt die Plattform einen Benutzer ab, zeigt der letzte Schritt „User not created“ und den Grund statt eines falschen Passworts.

- **Kubernetes und Datenbanken** — Ein Cluster, dessen Größe nicht in der Liste steht, lässt sich wieder speichern: Das Bearbeiten eines Add-ons oder einer anderen Option wird nicht mehr blockiert.

## Sicherheit

- **VM-Instanzen** — Auf der Bearbeitungsseite einer VM ermöglichte die Wahl **New** / **Existing**, die Systemfestplatte einer laufenden VM zu ersetzen oder zu trennen. Diese Wahl wird für bestehende Festplatten nicht mehr angeboten, und die Plattform lehnt diese Änderung jetzt ab.
