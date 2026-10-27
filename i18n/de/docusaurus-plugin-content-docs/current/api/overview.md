---
sidebar_position: 1
title: Übersicht
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {HikubeApiUrl} from '@site/src/components/HikubeApi';

# Öffentliche Hikube-API

Mit der **öffentlichen Hikube-API** steuern Sie die Ressourcen eines Projekts aus einem Skript, einer CI/CD-Pipeline oder einem Automatisierungswerkzeug, ohne die [Hikube-Konsole](https://console.hikube.cloud) zu verwenden. Sie stellt per REST und JSON die Operationen bereit, die die Konsole auf virtuellen Maschinen, Disks, Buckets, Kubernetes-Clustern, dem Netzwerk und den Datenbanken ausführt.

Die API ergänzt die Konsole; sie ersetzt sie nicht. Die Verwaltung des Kontos, der Organisation, der Projekte und der Mitglieder bleibt in der Konsole.

:::warning Vorschauversion
Die öffentliche API ist eine **Vorschauversion** (`v1alpha1`). Pfade, Felder und Verhalten können sich noch ändern, und die endgültige öffentliche URL steht noch nicht fest. Bauen Sie auf dieser Version noch keine kritische Automatisierung auf, ohne vorzusehen, ihren Änderungen zu folgen.
:::

---

## Was die API abdeckt

| Bereich | Pfadpräfix | Operationen |
|---------|---------------------|------------|
| Virtuelle Maschinen | `/instance/v1alpha1` | Erstellen, auflisten, abrufen, ändern, löschen; starten, stoppen, neu starten; cloud-init neu laden. Kataloge: Images (`/cloud-images`) und Instanztypen (`/instance-types`) |
| Disks | `/disk/v1alpha1` | Erstellen, auflisten, abrufen, vergrößern, löschen |
| S3-Buckets | `/bucket/v1alpha1` | Erstellen, auflisten, abrufen, löschen; die Benutzer eines Buckets verwalten und ihre Schlüssel rotieren |
| Kubernetes | `/kubernetes/v1alpha1` | Einen Cluster erstellen, auflisten, abrufen, ändern, löschen; seine kubeconfig herunterladen. Kataloge: Versionen, Presets |
| Netzwerk | `/network/v1alpha1` | VPCs und Subnetze: erstellen, auflisten, abrufen, löschen |
| PostgreSQL | `/postgres/v1alpha1` | Cluster (einschließlich Neustart), Datenbanken, Benutzer (einschließlich Passwortrotation). Kataloge: Presets, Erweiterungen |
| MariaDB | `/mariadb/v1alpha1` | Cluster (einschließlich Neustart), Datenbanken, Benutzer (einschließlich Passwortrotation). Katalog: Presets |
| MongoDB | `/mongodb/v1alpha1` | Cluster (einschließlich Neustart), Datenbanken, Benutzer (einschließlich Passwortrotation). Katalog: Presets |
| Redis | `/redis/v1alpha1` | Cluster (einschließlich Neustart), Passwortrotation. Katalog: Presets |
| RabbitMQ | `/rabbitmq/v1alpha1` | Cluster (einschließlich Neustart), Benutzer, VHosts. Katalog: Presets |
| Backups | `/backup/v1alpha1` | Ziele, Zeitpläne (`plans`), Backups auf Abruf und deren Verfolgung (`jobs`), Archive (`backups`), Wiederherstellungen (`restores`), einschließlich der PostgreSQL-Wiederherstellung zu einem bestimmten Zeitpunkt; ein laufendes Backup oder eine laufende Wiederherstellung abbrechen. Für VMs, Disks sowie PostgreSQL- und MariaDB-Datenbanken |
| GPU | `/gpu/v1alpha1` | Katalog der verfügbaren GPUs (die Zuweisung erfolgt auf der VM oder der Knotengruppe) |
| Preise | `/billing/v1alpha1` | Preislisten (VMs, Datenbanken, Kubernetes, Lizenzen, GPUs, Netzwerk, Block- und Objektspeicher) |

Die vollständige Liste der Operationen mit ihren Parametern und Antworten finden Sie in der [API-Referenz](/api/reference/hikube-api/).

### Was die API nicht abdeckt

- **Konto, Organisation, Projekte, Mitglieder und Rollen**: der Konsole vorbehalten.
- **API-Schlüssel**: Ein Schlüssel kann keinen Schlüssel erstellen oder widerrufen (siehe [Authentifizierung](./authentication.md)).
- **Echtzeit-Ereignisströme** der Konsole.
- **Dienste, die nicht in der Konsole verfügbar sind** (ClickHouse, Kafka, NATS): auf Anfrage beim Support.

Eine Operation, die nicht in der Referenz steht, kann nicht mit einem API-Schlüssel aufgerufen werden, auch wenn die Konsole sie anbietet.

---

## Basis-URL

Alle Anfragen gehen von der folgenden Basis-URL aus:

<HikubeApiUrl />

Die Pfade der Referenz werden an diese URL angehängt. Die Beispiele der Dokumentation lesen sie aus der Variablen `HIKUBE_API`:

```bash
curl -sS "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

---

## Versionen

Jeder Dienst trägt seine Version im Pfad: `/disk/v1alpha1/...`, `/postgres/v1alpha1/...`. Alle Dienste sind derzeit in `v1alpha1`, also in der Vorschauversion: Eine Version `v1alpha1` kann sich auf inkompatible Weise ändern. Änderungen werden im [Changelog](/blog) angekündigt.

---

## Organisation und Projekt

Auf Hikube fasst eine **Organisation** **Projekte** zusammen, und jede Ressource (VM, Disk, Datenbank…) gehört zu einem Projekt. In der API steht das Projekt im Pfad jeder Operation:

```text
/<service>/v1alpha1/projects/{projectId}/<ressourcen>/{name}
```

- `projectId` ist die Kennung des Projekts, eine UUID (zum Beispiel `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`). Sie entspricht nicht dem in der Konsole angezeigten Namen des Projekts.
- `name` ist der Name, den Sie der Ressource bei ihrer Erstellung gegeben haben: Er identifiziert sie in den Pfaden.

Ein API-Schlüssel ist an **ein einziges Projekt** gebunden: Jede Anfrage, die auf ein anderes Projekt zielt, wird abgelehnt. Um mehrere Projekte zu automatisieren, verwenden Sie einen Schlüssel pro Projekt. Siehe [Die Kennung des Projekts finden](./quick-start.md#project-id).

Die Kataloge (Images, Instanztypen, Versionen, Presets, GPUs, Preise) hängen von keinem Projekt ab: Ihre Pfade enthalten kein `projectId`.

---

## Konventionen

- **Format**: Anfrage- und Antwortkörper sind in JSON (`Content-Type: application/json`), mit Feldnamen in *camelCase* (`instanceType`, `asyncReplication`). Datumsangaben folgen RFC 3339 (`2026-10-05T09:30:00Z`).
- **Verben**: `GET` ruft ab, `POST` erstellt oder startet eine Aktion, `PATCH` ändert, `PUT` startet eine Aktion auf einer VM (starten, stoppen…), `DELETE` löscht.
- **Asynchrone Operationen**: Eine Erstellung oder Änderung gibt die Ressource sofort zurück, mit einem Feld `status` (`provisioning`, dann `ready`). Fragen Sie die Ressource mit `GET` ab, bis sie den erwarteten Zustand erreicht hat, bevor Sie sie verwenden.
- **Änderungen**: Ein `PATCH` ist eine teilweise Aktualisierung, nur die gesendeten Felder ändern sich (siehe [Teilweise Aktualisierungen](#mises-a-jour-partielles)).
- **Fehler**: Ein Fehler gibt einen HTTP-Code und einen JSON-Body mit einem stabilen numerischen Code zurück (siehe [Fehler](./errors.md)).

---

## Teilweise Aktualisierungen {#mises-a-jour-partielles}

Alle `PATCH`-Anfragen folgen derselben Regel: **Nur die gesendeten Felder werden geändert.** Es ist nicht nötig, die Ressource erneut zu lesen und vollständig zurückzusenden.

- **Fehlendes Feld**: Ein Feld, das im Body fehlt oder als `null` gesendet wird, behält seinen Wert. `{"external": true}` auf einem Redis-Cluster aktiviert den externen Zugriff und behält Version, Größe und Authentifizierung bei.
- **Gesendetes Feld**: Sein Wert wird unverändert übernommen, einschließlich eines leeren Werts (`false`, `0`, `""`). Er wird wie bei der Erstellung validiert: Eine Größe von `0` wird abgelehnt.
- **Unterobjekt**: Es wird Feld für Feld geändert. `{"network": {"publicIpv4": true}}` auf einer VM berührt weder die Firewall noch die VPCs. Leer gesendet setzt es dagegen **jedes seiner Felder** auf seinen leeren Wert zurück: `{"network": {}}` entfernt die öffentliche Adresse, deaktiviert die Firewall und trennt alle VPCs.
- **Liste oder Map**: Gesendet ersetzt sie die vorhandene, und `[]` oder `{}` leert sie. `{"network": {"vpcs": []}}` trennt alle VPCs einer VM; `{"config": {"databases": {}}}` entzieht einem Datenbankbenutzer alle Rechte.
- **Freie Konfiguration** (Helm-Überschreibungen eines Kubernetes-Clusters: `config.cni`, `config.dns`, `config.verticalPodAutoscaler`, `configOverride` der Addons): Ein gesendetes Objekt ersetzt die vorhandene Überschreibung, `{}` ändert nichts, und `null` entfernt sie.
- **Leerer Body**: `{}` ändert nichts und gibt die Ressource so zurück, wie sie gespeichert ist.
- **Nicht änderbare Felder**: Der Name und die Kennungen aus dem Pfad werden ignoriert, wenn sie im Body stehen. Ein bei der Erstellung festgelegtes Feld (zum Beispiel der Modus eines Datenbankclusters, standalone oder repliziert) kann mit seinem aktuellen Wert zurückgesendet werden; ein anderer Wert wird mit einem dienstspezifischen Code abgelehnt. Ein Feld, das in der Änderungsanfrage nicht vorgesehen ist (wie `preset` bei MariaDB oder `image` bei einer VM), wird als unbekanntes Feld abgelehnt (`400`).

Zum Beispiel, um den externen Zugriff eines Redis-Clusters zu aktivieren, ohne etwas anderes zu ändern:

```bash
curl -sS -X PATCH "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"external": true}'
```

### Das Feld `updateMask`

Jede `PATCH`-Anfrage akzeptiert ein optionales Feld `updateMask`: die durch Kommas getrennte Liste der zu ändernden Pfade, in *camelCase* (`external,authEnabled`). Ohne dieses Feld werden die Pfade aus den im Body vorhandenen Feldern abgeleitet, was in den meisten Fällen genügt.

Mit `updateMask` werden nur die aufgeführten Pfade geändert, mit dem Wert aus dem Body. Ein aufgeführter, aber im Body fehlender Pfad erhält seinen leeren Wert: `{"updateMask": "external"}` allein **deaktiviert** den externen Zugriff. Ein Pfad, der kein änderbares Feld bezeichnet, wird mit dem Code `10006` abgelehnt (siehe [Fehler](./errors.md)).

---

## OpenAPI-Spezifikation

Die Spezifikation der öffentlichen API kann im Format OpenAPI 2.0 (Swagger) heruntergeladen werden: [`hikube-public.swagger.json`](pathname:///openapi/hikube-public.swagger.json). Damit können Sie einen Client in Ihrer Programmiersprache generieren. Sie beschreibt nur die Operationen, die mit einem API-Schlüssel aufgerufen werden können.

<NavigationFooter
  nextSteps={[
    {label: "Authentifizierung", href: "../authentication"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "API-Referenz", href: "../reference/hikube-api"},
    {label: "Fehler", href: "../errors"},
  ]}
/>
