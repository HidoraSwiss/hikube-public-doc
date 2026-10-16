---
title: Hikube-Konsole v1.3.2
authors: [hikube]
tags: [release]
---

Diese Korrektur macht die Echtzeit-Aktualisierung der Konsole unauffälliger. Eine Sitzungserneuerung lädt die Seite nicht mehr im Hintergrund neu, und ein inaktiv gelassener Tab verlängert Ihre Sitzung nicht mehr.

<!-- truncate -->

## Behoben

- **Echtzeit** — Wenn Ihre Sitzung erneuert wird, lädt die Konsole nicht mehr alle Daten der Seite neu. Nur Daten, die nicht geladen werden konnten, werden erneut angefordert. Listen wie die der VM-Instanzen werden nicht mehr bei jeder Erneuerung neu gelesen oder unterbrochen.

## Sicherheit

- **Sitzung** — Ein ohne Aktivität geöffneter Tab verlängert Ihre Sitzung nicht mehr. Wenn Ihre Sitzung abläuft, pausiert die Echtzeit-Aktualisierung und die Anzeige zeigt **Reconnecting…**. Sobald Sie zum Tab zurückkehren, wird die Sitzung erneuert, die Daten werden neu geladen und die Anzeige wechselt zurück zu **Live**. Ohne Aktivität läuft die Sitzung normal ab, zu dem von der Plattform vorgesehenen Zeitpunkt.
