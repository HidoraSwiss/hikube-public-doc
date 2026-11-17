---
title: Hikube-Konsole v1.5.1
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.7.1. Sie wird barrierefreier, mit der Tastatur wie mit einem Screenreader, und wird auf kleinen Bildschirmen besser dargestellt. Das Design kann dem des Systems folgen, und die Konsole speichert weniger Daten im Browser.

<!-- truncate -->

## Hinzugefügt

- **Design** — Das Design-Menü bietet **Light**, **Dark** oder **System**. Im Modus **System** folgt die Konsole dem Design des Computers, auch wenn es sich ändert, und eine Änderung in einem Tab gilt für die anderen offenen Tabs.

- **GPU** — Die NVIDIA-L4-GPU lässt sich in den Erstellungsassistenten für VM-Instanzen und Kubernetes-Cluster auswählen.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Formulare** — Ein Eingabefehler erscheint, sobald das Feld verlassen wird, und nicht mehr ab dem ersten getippten Buchstaben. Er verschwindet, sobald er korrigiert ist. Fehlermeldungen sind mit ihrem Feld verknüpft, und Pflichtfelder werden von Screenreadern angesagt.

- **Navigation** — Aktionen, die zu einer Seite führen, wie **View** und **Edit** in Listen, sind echte Links: Mittelklick und **In neuem Tab öffnen** funktionieren.

- **Barrierefreiheit** — Jede Seite hat ihren eigenen Tab-Titel. Navigationsbereiche, Menüzustände und die Schritte der Assistenten werden von Screenreadern angesagt, ebenso laufende Aktionen. Kontrast und Fokusrahmen sind verstärkt, Tooltips öffnen sich per Tastatur und per Berührung, und Texte folgen der im Browser eingestellten Schriftgröße.

- **Kleine Bildschirme** — Auf einem schmalen Bildschirm wechseln die Tabellen der Mitglieder, Einladungen, SSO-Rollenbindungen und API-Schlüssel in eine gestapelte Darstellung, ohne horizontales Scrollen. Die Seitenhöhe berücksichtigt die Leisten des mobilen Browsers.

- **Dunkles Design** — Bildlaufleisten, Auswahllisten, Datumsauswahl und vom Browser automatisch ausgefüllte Felder folgen dem dunklen Design.

- **Leistung** — Seiten laden schneller, und regelmäßige Aktualisierungen pausieren, solange der Tab ausgeblendet ist.

## Behoben

- **Instanzkonsole** — Im Vollbild werden Dialoge, Benachrichtigungen und Tooltips über der Konsole angezeigt.

- **VM-Instanzen** — Das Fenster, das das Windows-Passwort nur einmal anzeigt, schließt sich nicht mehr mit der Escape-Taste.

## Sicherheit

- **Konsole** — Entwürfe der Assistenten, einschließlich Initialisierungspasswörtern, bleiben im Arbeitsspeicher und werden nicht mehr im Browserspeicher abgelegt, außer während eines Sprachwechsels. Die kubeconfig-Datei wird nicht mehr zwischengespeichert. Eine Abmeldung löscht die Daten der Website im Browser.

- **Konsole** — Die Content Security Policy ist strenger, und die Konsole ist von anderen Websites isoliert. Leistungsmessungen senden keine Namen von Organisationen, Projekten oder Ressourcen mehr.
