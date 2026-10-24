---
title: Hikube API v1.6.0
authors: [hikube]
tags: [release]
---

Die API öffnet sich mit API-Schlüsseln für Automatisierungswerkzeuge und erhält einen Dienst für Sicherung und Wiederherstellung von PostgreSQL, MariaDB, VMs und Festplatten, einschließlich der Wiederherstellung von PostgreSQL zu einem bestimmten Zeitpunkt. Verwaltete Datenbanken lassen sich neu starten, und eine VM gibt ihre interne und ihre öffentliche Adresse jetzt getrennt zurück. `PATCH`-Anfragen werden zu echten Teilaktualisierungen: Ein Feld, das im Body fehlt, behält seinen Wert.

**Inkompatible Änderung**: Der Zugriff mit einer Projekt-Kubeconfig auf `api.hikube.cloud` entfällt, und diese Adresse stellt nun die öffentliche API bereit (siehe *Migration* am Ende dieser Notiz).

<!-- truncate -->

## Hinzugefügt

- **API-Schlüssel** — Werkzeuge ohne Sitzung, etwa eine CI-Pipeline, Terraform oder ein Skript, authentifizieren sich mit einem API-Schlüssel im Header `X-Hikube-Api-Key`. Ein Schlüssel wirkt auf ein einziges Projekt, mit einer Berechtigungsstufe (`read`, `write`, `admin` oder `superadmin`), die den Rollen des Projekts folgt. Er läuft nach 1 bis 365 Tagen ab (standardmäßig 90), und sein Geheimnis wird nur einmal angezeigt, bei der Erstellung. Die Administratoren des Projekts erstellen, listen und widerrufen seine Schlüssel in der Konsole oder per `POST`, `GET` und `DELETE` auf `/iam/v1alpha1/projects/{project_id}/api-keys`. Niemand kann einem Schlüssel mehr Rechte geben als die eigenen (`60003`), und die Zahl aktiver Schlüssel pro Projekt ist begrenzt (`60009`). Ein Schlüssel kann weder Schlüssel verwalten noch auf Konto, Organisation oder Projekte einwirken. Siehe [Authentifizierung](/api/authentication/).

- **Sicherungen** — Ein neuer Dienst sichert und stellt PostgreSQL- und MariaDB-Cluster, VMs und Festplatten wieder her. Die übrigen Dienste (MongoDB, Redis, RabbitMQ, Kubernetes, Buckets) werden nicht unterstützt: Eine Anfrage für einen davon wird mit dem Code `180107` abgelehnt.

- **Sicherungen: Ziele** — Ein Ziel verbindet einen Bucket des Projekts, den Bucket-Benutzer, dessen Zugangsdaten es verwendet, und eine Aufbewahrungsdauer in Tagen. Die Archive werden in Ihren Bucket geschrieben und belegen dessen Speicher: Es gibt weder einen von der Plattform bereitgestellten Speicher noch ein eigenes Sicherungskontingent. Bei einem gesperrten Bucket (WORM) darf die Aufbewahrung nicht kürzer sein als die Sperre (`180218`). Ein Ziel kann nicht gelöscht werden, solange ein Plan, eine laufende Sicherung oder eine Wiederherstellung es verwendet. Das Löschen lässt die bereits in den Bucket geschriebenen Archive unberührt.

- **Sicherungen: Pläne und Sicherungen auf Abruf** — Ein Plan plant eine wiederkehrende Sicherung mit einem fünfteiligen Cron-Ausdruck oder mit `@hourly`, `@daily`, `@weekly`, `@monthly` und `@yearly`. Der Zeitplan gilt in UTC, und das Feld `nextRunAt` nennt die nächste Ausführung. Ein Zeitplan, der öfter als einmal pro Stunde auslöst, wird abgelehnt (`180106`), ebenso `@every` und Zeitzonen-Präfixe (`180105`). Eine Sicherung lässt sich auch auf Abruf starten und abbrechen, solange sie nicht beendet ist.

- **Sicherungen: Archive** — Jedes Archiv gibt an, ob es wiederhergestellt werden kann. Ist das nicht der Fall, nennt `notRestorableCause` den Grund als festen Wert (`not_ready`, `destination_removed`, `destination_tearing_down`, `destination_replaced`, `destination_unverified`, `stored_archive_gone`) und `notRestorableReason` den anzuzeigenden Satz. Ein unter demselben Namen neu erstelltes Ziel macht die vor seiner Erstellung geschriebenen Archive nicht wiederherstellbar. Nach Ablauf ihrer Aufbewahrung werden Archive automatisch entfernt. Das jüngste wiederherstellbare Archiv jeder Anwendung bleibt immer erhalten, unabhängig von seinem Alter.

- **Sicherungen: Löschen eines Archivs** — Bei PostgreSQL und MariaDB entfernt das Löschen eines Archivs nur seinen Eintrag: Die Daten bleiben in Ihrem Bucket. Bei einer VM oder einer Festplatte werden die Daten unwiderruflich vernichtet. Die Anfrage muss dann `confirm_destructive=true` enthalten, und die Antwort bestätigt dies in `archiveDeleted`. Ein durch einen WORM-Bucket gesperrtes Archiv kann vor Ende der Sperre nicht gelöscht werden (`180217`).

- **Sicherungen: Wiederherstellung** — Ein Archiv wird über der Anwendung wiederhergestellt, von der es stammt, oder bei PostgreSQL und MariaDB in eine andere Anwendung desselben Typs. Jede Wiederherstellung, die Daten überschreibt, verlangt `confirmDestructive`. Ein PostgreSQL-Archiv wird nur in eine Datenbank derselben Hauptversion wiederhergestellt (`180224`). Während einer Wiederherstellung lehnt die Anwendung Sicherungen auf Abruf ab (`180205`).

- **Sicherungen: PostgreSQL-Wiederherstellung zu einem Zeitpunkt** — Ein PostgreSQL-Archiv wird im genauen Zustand der Sicherung (`restorePoint: backup`, Standard), im jüngsten archivierten Zustand (`latest`) oder zu einem gewählten Zeitpunkt (`recoveryTime`) wiederhergestellt. Das Wiederherstellungsfenster jedes Archivs (`recoveryWindow`) nennt die einzuhaltenden Grenzen, auf die Mikrosekunde genau. Senden Sie sie unverändert zurück, ohne sie neu zu berechnen. Ein Zeitpunkt außerhalb des Fensters wird abgelehnt (`180214`).

- **Sicherungen: Wiederherstellung einer VM** — Die aktuellen Festplatten der VM werden durch die des Archivs ersetzt. Mit `originalDisks: discard` (Standard) wird ihr bisheriger Inhalt nach erfolgreicher Wiederherstellung gelöscht. Mit `keep` bleibt er in einer eigenen, getrennten Festplatte namens `<disk>-orig-<id>` erhalten. Eine fehlgeschlagene oder abgebrochene Wiederherstellung löscht nichts. Bevor sie `succeeded` erreicht, prüft die Wiederherstellung, dass jede Festplatte des Archivs zurückgeschrieben wurde. Eine VM-Wiederherstellung, die nicht endet, kann abgebrochen werden. Eine Festplatte wird nicht über sich selbst wiederhergestellt, solange sie existiert (`180225`): Stellen Sie eine Sicherung der VM wieder her, an die sie angeschlossen ist. Eine VM oder Festplatte, die seit der Sicherung gelöscht und unter demselben Namen neu erstellt wurde, wird abgelehnt (`180222`).

- **Verwaltete Datenbanken** — PostgreSQL-, MariaDB-, MongoDB-, RabbitMQ- und Redis-Cluster lassen sich neu starten (`POST .../clusters/{name}/restart`). PostgreSQL startet seine Instanzen nacheinander neu. Die übrigen Dienste starten alle Instanzen neu, was den Dienst kurz unterbricht. Die Daten bleiben erhalten.

- **Redis** — Das neue Feld `restartRequired` zeigt an, dass eine Änderung der Authentifizierung oder eine Passwortrotation auf einen Neustart des Clusters wartet.

- **Compute** — Das Feld `network.internalIp` liefert die Adresse der VM im Netzwerk ihres Projekts, mit oder ohne öffentliche IP. Sie ist von den übrigen Ressourcen des Projekts aus erreichbar, vorbehaltlich der Firewall des Gastsystems. Sie wird beim Lesen und Auflisten von VMs zurückgegeben und ist leer, solange die VM gestoppt ist. Das Feld `network.publicIp` liefert die öffentliche Adresse, wenn `publicIpv4` aktiviert ist. Sie kann zu einem privaten Bereich gehören: Leiten Sie sie nicht aus ihrem Bereich ab.

- **Teilaktualisierungen** — Jede Aktualisierungsanfrage akzeptiert ein optionales Feld `updateMask`. Senden Sie es nicht, wird es aus den Schlüsseln des JSON-Bodys abgeleitet. Ein Pfad, der kein änderbares Feld bezeichnet, oder ein einzelner Schlüssel einer Sammlung (etwa `nodeGroups.workers`) wird mit dem Code `10006` abgelehnt. Die OpenAPI-Spezifikation listet die änderbaren Pfade jeder Ressource auf. Siehe [Teilaktualisierungen](/api/overview/#mises-a-jour-partielles).

- **Fehlercodes** — Jede neue Ablehnung hat ihren eigenen Code. Sie werden mit HTTP 400 zurückgegeben, sofern nicht anders angegeben. Das Fehlerformat ist unter [Fehler](/api/errors/) beschrieben.

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `10004` | Alle | HTTP 503: Der API-Schlüssel konnte nicht geprüft werden. Erneut versuchen: Der Schlüssel gilt nicht als ungültig |
| `10005` | Alle | HTTP 403 oder 400: Von einer Regel der Plattform abgelehnt: Die Meldung nennt das abgelehnte Feld, `details` die Regel und ihren Grund |
| `10006` | Alle | Ungültige `updateMask`: unbekannter Pfad oder Schlüssel einer Sammlung |
| `60003` | API-Schlüssel | HTTP 403: Berechtigungsstufe über Ihrer eigenen |
| `60006` | API-Schlüssel | HTTP 404: Schlüssel in diesem Projekt nicht gefunden |
| `60009` | API-Schlüssel | Höchstzahl aktiver Schlüssel für das Projekt erreicht |
| `60106` bis `60109` | API-Schlüssel | Ungültige Stufe, Kennung, Name oder Gültigkeit des Schlüssels |
| `20115` | Compute | Die UserData einer Windows-VM werden von der Plattform erzeugt und können nicht geändert werden |
| `40202` | Projekte | Das angeforderte Kontingent übersteigt, was der Organisation noch bleibt |
| `80205` / `110205` / `120205` / `140205` / `150205` | PostgreSQL / MariaDB / Redis / RabbitMQ / MongoDB | Der Cluster wird noch erstellt: noch nichts neu zu starten |
| `120206` | Redis | Passwortrotation abgelehnt: Die Authentifizierung ist deaktiviert |
| `120207` | Redis | Passwortrotation abgelehnt: Die Authentifizierung wurde gerade aktiviert, versuchen Sie es in einigen Sekunden erneut |
| `180001` bis `180227` | Sicherungen | Ablehnungen des Sicherungsdienstes, jede mit einer Meldung, die sagt, was zu tun ist. Die vollständige Liste steht in der OpenAPI-Spezifikation |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus eigenen Werkzeugen aufrufen.

- **Teilaktualisierungen** — Ein `PATCH` ändert nur noch die Felder, die im Body stehen: Ein fehlendes Feld behält seinen gespeicherten Wert. Die Felder, die bei der Aktualisierung Pflicht waren, etwa `version`, `instanceType` oder `disks`, sind es nicht mehr: `{"external": true}` genügt, um den externen Zugriff einer Datenbank einzuschalten. Ein leerer Body (`{}`) ändert nichts und gibt die Ressource so zurück, wie sie gespeichert ist. Die übrigen Regeln:
  - Eine leer gesendete Liste wird geleert: `gpus`, `sshKeys`, `network.vpcs`, `allowedInboundPorts`, die Gruppen eines IAM-Benutzers, die Erweiterungen einer PostgreSQL-Datenbank, die Rechte eines Benutzers;
  - ein leer gesendetes Unterobjekt wie `"config": {}` bezeichnet alle seine Felder, die auf ihren Standardwert zurückgesetzt werden. Um nur ein Feld zu ändern, senden Sie nur dieses Feld;
  - `null` steht für ein fehlendes Feld, außer bei einer frei formulierten Konfigurationsüberschreibung (Cilium, CoreDNS, Vertical Pod Autoscaler und die Addon-Überschreibungen eines Kubernetes-Clusters), wo `null` die Überschreibung entfernt;
  - eine gesendete frei formulierte Konfigurationsüberschreibung ersetzt die gespeicherte, statt mit ihr zusammengeführt zu werden;
  - ein gesendetes Feld wird mit den Regeln der Erstellung geprüft, auch bei null: `replicas: 0` wird abgelehnt, wo es bisher „keine Änderung“ bedeutete, und ein Projektkontingent von 0 wird abgelehnt (`40103` bis `40105`).

- **Compute** — `userData: ""` entfernt die UserData einer Linux-VM. Bei einer Windows-VM wird bei der Aktualisierung gesendete UserData abgelehnt (`20115`), eine leere Zeichenkette wird ignoriert.

- **Compute** — Die Liste `network.ips` enthält die interne Adresse der VM nicht mehr; sie wird getrennt in `internalIp` zurückgegeben. Die öffentliche Adresse steht weiterhin dort, und zusätzlich in `publicIp`.

- **Einheiten** — Die Größen der API (Festplatten, Arbeitsspeicher, Speicher, Kontingente) werden in GiB angegeben: 1 GiB entspricht 1 024 MiB. Spezifikation und Fehlermeldungen sprachen von „GB“, und ein Client, der in GB rechnete, unterschätzte die tatsächliche Größe. Im Detail `quotaFloor` der Ablehnung `40201` lautet `unit` jetzt `" GiB"` statt `"Gi"`.

- **Ablehnungen durch Regeln der Plattform** — Eine von einer Regel der Plattform abgelehnte Anfrage erhält den Code `10005`, mit dem betroffenen Feld. Bisher erhielt sie den Code eines anderen Fehlers, zum Beispiel `40002` („das Projekt existiert bereits“).

- **Redis** — Die Passwortrotation erzeugt ein neues Passwort mit 32 Zeichen, das nach einem Neustart des Clusters gilt. Sie wird abgelehnt, wenn die Authentifizierung deaktiviert ist (`120206`).

## Entfernt

- **Zugriff per Projekt-Kubeconfig** — Der direkte Zugriff mit einer Projekt-Kubeconfig, die auf `https://api.hikube.cloud:443` zeigt, ist nicht mehr verfügbar. Die Adresse `api.hikube.cloud` stellt nun die öffentliche Hikube-API bereit. Werkzeuge, die mit dieser Kubeconfig eingerichtet sind (`kubectl`, `virtctl`, der frühere Terraform-Provider), können sich nicht mehr damit verbinden. Kubeconfigs der Kubernetes-Cluster, die Sie auf Hikube erstellen, sind nicht betroffen: Jeder Cluster behält seine eigene Adresse.

## Behoben

- **Teilaktualisierungen** — Eine Aktualisierung setzt die Felder, die sie nicht nennt, nicht mehr zurück. Bisher hat ein Body ohne diese Felder:
  - die öffentliche IP einer VM ausgeschaltet und ihre Neustartrichtlinie überschrieben;
  - die im Body fehlenden Addons eines Kubernetes-Clusters ausgeschaltet;
  - den externen Zugriff eines MariaDB-, RabbitMQ- oder Redis-Clusters und die Authentifizierung eines Redis-Clusters ausgeschaltet;
  - das Sharding eines MongoDB-Clusters ausgeschaltet und das Quorum eines PostgreSQL-Clusters zurückgesetzt;
  - das Verbindungslimit eines MariaDB-Benutzers und das Replikationsrecht eines PostgreSQL-Benutzers zurückgesetzt;
  - einen RabbitMQ-Benutzer aus allen seinen vhosts entfernt.

- **Projekte** — Ein Projektkontingent, das übersteigt, was der Organisation noch bleibt, wird mit dem Code `40202` und dem betroffenen Kontingent abgelehnt. Bisher wurde es mit dem Code `40001` (Projekt nicht gefunden) oder `40002` (Projekt existiert bereits) abgelehnt.

- **Fehlermeldungen** — Der Name eines Ressourcentyps verliert in Fehlermeldungen nicht mehr seinen ersten Buchstaben.

- **IAM** — Änderungen an einem über die API erstellten Benutzer (Name, Gruppen) und seine Löschung werden jetzt auf sein Anmeldekonto angewendet, das über seine E-Mail-Adresse gefunden wird. Bisher galt das nur für seine Erstellung.

- **Listen** — Ressourcenlisten, insbesondere die VM-Liste, antworten schneller. Eine VM-Liste konnte mehrere Sekunden dauern.

## Sicherheit

- **Redis** — Die Passwortrotation eines Redis-Clusters gab das bisherige Passwort zurück, statt ein neues zu erzeugen. Wenn Sie vor dieser Version ein Passwort rotiert haben, rotieren Sie es erneut und starten Sie den Cluster dann neu.

:::warning Bekannte Einschränkung
Eine geplante Sicherung kann während der Wiederherstellung eines PostgreSQL-Clusters an Ort und Stelle starten und sie scheitern lassen. Prüfen Sie vor einer solchen Wiederherstellung das `nextRunAt` der Pläne der Anwendung: Ist eine Ausführung innerhalb der nächsten 30 Minuten vorgesehen, warten Sie, bis sie beendet ist.
:::

:::warning Migration
- **Projekt-Kubeconfig**: Ersetzen Sie die Aufrufe mit dieser Kubeconfig durch die öffentliche API. Erstellen Sie in den Projekteinstellungen einen API-Schlüssel und rufen Sie dann `https://api.hikube.cloud` mit dem Header `X-Hikube-Api-Key` auf. Siehe [Authentifizierung](/api/authentication/) und [Schnellstart](/api/quick-start/).
- **Öffentliche API unter `api.demo.hikube.cloud`**: Wechseln Sie zu `https://api.hikube.cloud`. Die frühere Adresse bleibt während einer Übergangszeit verfügbar und wird dann entfernt.
- Für einen Bedarf, den die API noch nicht abdeckt, etwa die VNC-Konsole einer VM, wenden Sie sich an den Support.
:::
