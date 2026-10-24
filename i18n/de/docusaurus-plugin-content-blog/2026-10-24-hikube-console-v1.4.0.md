---
title: Hikube-Konsole v1.4.0
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.6.0 mit einer neuen Ansicht **Backups**: Ziele, Zeitpläne, Sicherungen auf Abruf, Archive und Wiederherstellungen von VMs, Festplatten sowie PostgreSQL- und MariaDB-Datenbanken. Die Projekteinstellungen verwalten seine API-Schlüssel, verwaltete Datenbanken lassen sich von ihrer Seite aus neu starten, und die Seiten der VMs und Datenbanken trennen interne von externen Adressen.

<!-- truncate -->

## Hinzugefügt

- **Sicherungen** — Im Projektmenü erscheint der Eintrag **Backups** mit vier Registerkarten:
  - **Destinations**: ein S3-Bucket des Projekts, der Benutzer, dessen Zugangsdaten das Ziel verwendet, und eine Aufbewahrungsdauer. Ein Ziel auf einem WORM-Bucket zeigt die Dauer seiner Sperre;
  - **Protection**: jede Anwendung des Projekts mit ihrem Zustand (**Scheduled**, **Covered**, **Unprotected**) und ihrer letzten Sicherung. Der Filter **Unprotected** listet diejenigen ohne Sicherung, und die Schaltfläche **Schedule** legt eine an;
  - **Activity**: Sicherungen und Wiederherstellungen mit Status, Dauer und Meldung;
  - **Archives**: alle Archive des Projekts.

- **Sicherungen auf den Ressourcenseiten** — Die Seiten der VM-Instanzen, der Festplatten sowie der PostgreSQL- und MariaDB-Cluster haben eine Registerkarte **Backups**. Sie bietet **Back up now**, den Zeitplan der Anwendung, den Stand laufender Ausführungen, ihre Archive und ihre Wiederherstellungen. Die Registerkarte weist auf eine ungeschützte Ressource oder eine fehlgeschlagene letzte Sicherung hin.

- **Zeitplanung** — Eine Sicherung wird stündlich, täglich oder wöchentlich oder mit einem Cron-Ausdruck geplant. Der Zeitplan gilt in UTC, und die Konsole zeigt die nächste Ausführung. Ein Hinweis erinnert daran, dass sich der Zeitplan bei der Zeitumstellung um eine Stunde verschiebt. Ein PostgreSQL-Cluster kann nur zu einem einzigen Ziel gesichert werden: Die Konsole erklärt dies, wenn bereits ein Plan existiert.

- **Wiederherstellung** — **Restore** bietet das Ziel der Wiederherstellung an: **In place** oder, bei PostgreSQL und MariaDB, **Another application**. Eine Wiederherstellung, die Daten überschreibt, verlangt die Eingabe des Zielnamens. Bei einer VM wählen Sie, was aus ihren aktuellen Festplatten wird: **Discard them** nach erfolgreicher Wiederherstellung oder **Keep them** als eigene Festplatten. Laufende Sicherungen und Wiederherstellungen von VMs zeigen ihren Fortschritt.

- **PostgreSQL-Wiederherstellung zu einem Zeitpunkt** — Das Feld **Restore up to** bietet den genauen Zustand der Sicherung, den **Most recent state** oder einen Zeitpunkt, der auf einer Zeitleiste mit einem Maßstab von einer Stunde bis sieben Tagen gewählt oder als Datum und Uhrzeit eingegeben wird. Ein Zeitpunkt außerhalb des wiederherstellbaren Zeitraums wird auf die nächste Grenze gesetzt, und die Konsole weist darauf hin.

- **Archive** — Ein Archiv, das nicht wiederhergestellt werden kann, nennt den Grund: Archiv noch nicht bereit, Ziel gelöscht, in Löschung oder seither neu erstellt, Daten am Ende ihrer Aufbewahrung gelöscht. Mehrere Archive einer Anwendung lassen sich auf einmal löschen: Die Bestätigung verlangt die Eingabe ihrer Anzahl. Die Konsole gibt an, ob das Löschen die Daten vernichtet (VMs und Festplatten) oder das Archiv in Ihrem Bucket lässt (Datenbanken). Durch einen WORM-Bucket gesperrte Archive werden mit dem Ende ihrer Sperre ausgenommen.

- **Abbrechen** — Eine laufende Sicherung und die Wiederherstellung einer VM können abgebrochen werden. Ist der Abbruch noch nicht möglich oder noch abzuschließen, sagt die Konsole dies und bietet **Retry** an.

- **API-Schlüssel** — In den Projekteinstellungen erscheint für dessen Administratoren eine Karte **API keys**. **Create a key** verlangt einen Namen, eine **Access level** (**Read**, **Use**, **Admin** oder **Super admin**, nie über Ihrer eigenen) und eine **Validity** von 1 Tag bis 1 Jahr. Der Schlüssel wird nur einmal angezeigt, mit einem Beispielaufruf. Die Liste zeigt Stufe, Erstellung, Ablauf (**Expires soon** in den letzten 7 Tagen, dann **Expired**) und letzte Verwendung jedes Schlüssels. **Renew** erstellt einen neuen Schlüssel mit gleichem Namen und gleicher Stufe und bietet danach an, den alten zu widerrufen. Der Widerruf wird mit dem Namen des Schlüssels bestätigt. Siehe [Authentifizierung](/api/authentication/).

- **Verwaltete Datenbanken** — Auf der Seite der PostgreSQL-, MariaDB-, MongoDB-, RabbitMQ- und Redis-Cluster erscheint eine Schaltfläche **Restart**. Die Bestätigung nennt die Unterbrechung: schrittweiser Neustart bei PostgreSQL, kurze Unterbrechung bei den anderen. Die Daten bleiben erhalten.

- **Redis** — Ein Banner **Restart required** erscheint, solange eine Änderung der Authentifizierung oder eine Passwortrotation auf einen Neustart wartet, mit einer Schaltfläche **Restart now**. Nach einer solchen Änderung bietet die Konsole an, sofort oder später neu zu starten.

- **Adressen** — Die Seiten der VM-Instanzen und der PostgreSQL-, MariaDB-, MongoDB-, Redis- und RabbitMQ-Cluster zeigen ihre Adressen in zwei Bereichen. **Internal**: von den Ressourcen des Projekts erreichbar, mit der Adresse der VM im Projektnetzwerk, gekennzeichnet als **mgmt**, oder der internen Adresse der Datenbank und ihrem Port. **External**: aus dem Internet erreichbar, mit der öffentlichen IP der VM oder der externen Adresse der Datenbank. Eine VM ohne öffentliche IP zeigt endlich ihre Adresse an, und eine Datenbank ohne externen Zugriff ihre interne Adresse. Ist der externe Zugriff ausgeschaltet, sagt der Bereich dies, statt „Not defined“ anzuzeigen.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **VM-Instanzen** — Der vorgeschlagene SSH-Befehl zielt auf die öffentliche IP, sonst auf die Adresse **mgmt**. Die öffentliche IP ist die, die die Plattform zurückgibt, auch wenn sie zu einem privaten Bereich gehört.

- **Projekte** — Leer gelassene Kontingentfelder behalten den aktuellen Wert. Ein Kontingent von 0, ein negatives oder ein Dezimalkontingent wird abgelehnt. Übersteigt ein Kontingent, was der Organisation noch bleibt, weist das betroffene Feld darauf hin, mit dem höchstmöglichen Wert.

- **Projekte** — Die Ablehnung eines Kontingents unterhalb des Verbrauchs zeigt ihre Werte in den Einheiten der Konsole: vCPU und GiB. Die Felder für Arbeitsspeicher und Speicher im Formular zeigen auf Englisch „GiB“.

## Behoben

- **VM-Instanzen** — Das Entfernen des letzten VPC einer VM trennt ihn jetzt tatsächlich. Bisher blieb der VPC angeschlossen.

- **PostgreSQL** — Das Entfernen aller Rechte eines Benutzers entfernt nicht mehr sein Replikationsrecht.

- **Kubernetes** — Das Leeren einer Cilium-, CoreDNS-, Vertical-Pod-Autoscaler- oder Addon-Überschreibung entfernt sie jetzt aus dem Cluster.

- **Redis** — Die Texte, die einen sofortigen Widerruf des bisherigen Passworts ankündigten, sind korrigiert: Das neue Passwort gilt nach dem Neustart des Clusters.
