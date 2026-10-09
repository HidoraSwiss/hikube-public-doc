---
title: Hikube-Konsole v1.3.0
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.5.0: Sie bietet keine Änderungen mehr an, die die Plattform ablehnen würde, erklärt, was das Trennen einer Festplatte und das Löschen eines Buckets bewirken, und zeigt die Mitglieder eines exponierten MongoDB-Replica-Sets an.

<!-- truncate -->

## Hinzugefügt

- **MongoDB** — Die Seite eines Replica Sets mit externem Zugriff listet seine Mitglieder auf, jedes mit einer kopierbaren Adresse, statt „Not defined“ anzuzeigen. Sie bietet eine Verbindungszeichenfolge, die sich direkt mit einem Mitglied verbindet. Dieses Mitglied kann ein Secondary sein, das keine Schreibvorgänge annimmt.

- **Kubernetes** — Während die Kubernetes-Umgebung eines Projekts vorbereitet wird, wird die Erstellung seines ersten Clusters automatisch wiederholt, ohne die eingegebene Konfiguration zu verlieren. Ein Banner zeigt die Wartezeit an, mit einer Schaltfläche **Cancel**. Kann die Umgebung nicht vorbereitet werden, sagt eine Meldung dies, und die Konsole versucht es nicht erneut.

- **Projekte** — Die Projekteinstellungen zeigen die Projekt-ID mit einer Kopierschaltfläche. Die Organisations-ID unter **My Account** lässt sich ebenso kopieren.

- **Status** — Die Seite eines VPC zeigt seinen Status. Ein Projekt, dessen letzte Änderung nicht angewendet werden konnte, trägt in der Projektauswahl ein Abzeichen **Error**. Die Statusfilter der VPCs und Kubernetes-Cluster bieten **Ready** und **Error** an.

- **VM-Instanzen** — Nach **Reload UserData** weist die Konsole darauf hin, dass ein Neustart nötig ist und die SSH-Hostschlüssel neu erzeugt werden. Eine Schaltfläche **Restart** wird angeboten.

- **VM-Instanzen** — Ist ein VPC an eine Debian- oder Ubuntu-VM angehängt, erinnert eine Warnung daran, dass die Schnittstelle im Betriebssystem konfiguriert werden muss. Siehe [Eine VM mit einem VPC verbinden](/services/networking/how-to/attach-vm-to-vpc/).

- **Projekte** — Schlägt die Erstellung eines Projekts fehl, zeigt die Fehlermeldung eine Anfragereferenz, die Sie an den Support weitergeben können.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Kubernetes** — Die Schaltfläche **Kubeconfig** ist den Projektadministratoren vorbehalten. Für andere Mitglieder ist sie deaktiviert, mit dem Hinweis „Reserved for project administrators.“

- **Datenbanken** — Beim Bearbeiten eines PostgreSQL-, MariaDB-, MongoDB- oder RabbitMQ-Clusters werden nur noch die aktuelle und höhere Versionen angeboten. Die Festplattengröße kann nicht mehr unter die aktuelle Größe sinken. Eine Warnung weist darauf hin, dass ein Wechsel der Version oder des Presets die Instanzen neu startet und eine aktualisierte Version nicht wieder herabgestuft werden kann.

- **MariaDB und MongoDB** — Der Erstellungsassistent fragt für jeden Benutzer nach seiner Anwendungsdatenbank. Systemdatenbanken werden abgelehnt: `mysql`, `information_schema`, `performance_schema` und `sys` bei MariaDB, `admin`, `local` und `config` bei MongoDB. Das Feld „Globale Rolle“, das nie funktioniert hat, entfällt.

- **Datenbanken und RabbitMQ** — Benutzer-, Datenbank- und vhost-Namen folgen den Regeln der API: Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben. Validierungsfehler werden übersetzt. PostgreSQL ist nicht betroffen.

- **VM-Instanzen** — Das Entfernen einer Festplatte von einer VM trennt sie, ohne sie zu löschen. Die Bestätigung heißt jetzt „Detach“ und verlangt keine Eingabe des Namens. Sie erklärt, dass die Festplatte mit ihren Daten unter **Disks** bleibt und die Trennung erst beim nächsten Neustart der VM wirksam wird.

- **VM-Instanzen** — Die Mindestgröße der Systemfestplatte hängt vom gewählten Image ab: 40 GB für Oracle Linux, 28 GB für Windows Server, 20 GB für die übrigen Images. Wählen Sie ein anspruchsvolleres Image, wird die Größe auf dessen Minimum angehoben.

- **Storage S3** — Die Löschbestätigung eines Buckets sagt, was mit den Objekten geschieht. Ohne WORM werden der Bucket und alle seine Objekte gelöscht, auch wenn er nicht leer ist. Mit WORM verschwindet der Bucket aus der Konsole, seine Objekte bleiben jedoch erhalten und sind ab ihrem Schreiben 365 Tage im Modus COMPLIANCE gesperrt. Der Erstellungsassistent nennt diese Aufbewahrung.

- **Kubernetes** — Das Feld „Ephemeral storage size“ der Knotengruppen heißt jetzt „Node disk size“: Diese Festplatte ist persistent. Das Add-on Monitoring Agents bietet keine Helm-Konfiguration mehr an, die es nicht anwendete. Die Hilfelinks der Add-ons führen zu dieser Dokumentation.

- **VM-Instanzen** — Die vCPU- und RAM-Anzeigen, die keinen echten Messwert darstellten, entfallen auf der VM-Seite und bei der Auswahl des Instanztyps. Die Seite zeigt die tatsächliche Serie des Instanztyps: Standard (S), Universal (U) oder Memory (M).

## Behoben

- **Storage S3** — Die Konsole zeigt nicht mehr den Ressourcennamen anstelle des S3-Namens des Buckets. Sie zeigt den tatsächlichen Namen (`bucket-…`) oder weist darauf hin, dass er in wenigen Augenblicken verfügbar ist. Haben Sie einen S3-Client mit dem beim Anlegen eines Benutzers angezeigten Namen konfiguriert und erhält er „Access Denied“, übernehmen Sie den S3-Namen von der Seite des Buckets.

- **Storage S3** — Das Abwählen von „Read-only“ bei einem Bucket-Benutzer gibt ihm jetzt tatsächlich Lese-/Schreibzugriff.

- **VM-Instanzen** — Das Speichern einer VM, deren bestehende Festplatte nicht den Regeln einer neuen Festplatte entspricht (Name länger als 16 Zeichen, Größe unter 20 GB), scheitert nicht mehr ohne Meldung. Wird ein Speichern abgelehnt, nennt die Konsole den Grund.

- **VM-Instanzen** — Der Block für die SSH-Verbindung zeigt den Standardbenutzer, den die API liefert: `Hikube` für Windows, `opc` für Oracle Linux. Ist er unbekannt, sagt die Konsole dies, statt einen zu erraten.

- **VM-Instanzen** — Die Auswahl einer **Existing**-Festplatte beim Bearbeiten einer VM bietet keine Systemfestplatten und keine an eine andere VM angehängten Festplatten mehr an.

- **Kubernetes** — Die erste Helm-Überschreibung für Cilium, CoreDNS oder Vertical Pod Autoscaler, die beim Bearbeiten eines Clusters eingegeben wird, wird jetzt gespeichert. Die Stundenkosten folgen der Sprache der Konsole („CHF/h“).

- **PostgreSQL** — Beim Bearbeiten eines Clusters stehen dieselben Replikazahlen wie bei der Erstellung zur Wahl (1, 2 oder 3). Bei einem Cluster mit 2 Replikas ist diese Auswahl nicht mehr leer.

- **Datenbanken** — **Manage Access** zeigt eine eigene Bestätigung, und die Spalte **Databases** der MariaDB- und MongoDB-Benutzer zeigt die Rolle auf jeder Datenbank. Die englischen Beschriftungen der Bildschirme PostgreSQL, MariaDB, MongoDB und Redis verwenden nicht mehr das Vokabular von RabbitMQ.

- **Navigation** — Die Breadcrumb-Navigation zeigt einen Ressourcennamen unverändert an, auch wenn er einem Wort der Oberfläche entspricht: Ein Cluster namens `postgres` erscheint dort nicht mehr als „PostgreSQL“.

- **VM-Instanzen** — Die Karte „Custom image“ im Assistenten erklärt ihre Verwendung: zuerst eine Festplatte erstellen, dann diese auswählen.

## Sicherheit

- **MariaDB und MongoDB** — Der Assistent zur Clustererstellung gab jedem Benutzer eine Rolle auf der Systemdatenbank (`mysql` bei MariaDB, `admin` bei MongoDB). Das ist nicht mehr der Fall. Öffnen Sie für Benutzer, die vor dieser Version angelegt wurden, **Manage Access**: Die Zeile der Systemdatenbank erscheint dort als Fehler. Entfernen Sie sie.
