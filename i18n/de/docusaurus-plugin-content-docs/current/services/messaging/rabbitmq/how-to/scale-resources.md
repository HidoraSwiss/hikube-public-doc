---
title: "Die Konfiguration eines Clusters ändern"
---

# Die Konfiguration eines RabbitMQ-Clusters ändern

Diese Anleitung erklärt, welche Parameter eines RabbitMQ-Clusters nach seiner Erstellung in der [Hikube-Konsole](https://console.hikube.cloud) geändert werden können und wie Sie dabei vorgehen.

## Voraussetzungen

- Ein in Ihrem Projekt erstellter **RabbitMQ-Cluster**
- Eine ausreichende Projekt-Quota, wenn Sie die Disk-Größe erhöhen

## Änderbare Parameter

| Parameter | Nach der Erstellung änderbar | Hinweis |
|-----------|---------------------------|----------|
| **RabbitMQ Version** | Ja | Angebotene Versionen: 4.2, 4.1, 4.0, 3.13 |
| **Disk size (GB)** | Ja | Kapazität pro Knoten, im Rahmen der Speicher-Quota des Projekts |
| **External access** | Ja | Siehe [Externen Zugriff konfigurieren](./configure-external-access.md) |
| **Preset** | Nein | „The resources preset cannot be changed after creation“ |
| **Number of replicas** | Nein | „The mode cannot be changed after creation“ |

## Schritte

### 1. Das Änderungsformular öffnen

1. Klicken Sie im Menü **DB & Messaging** → **RabbitMQ** auf den Cluster.
2. Klicken Sie auf **Edit**. Sie können auch in der Liste das Aktionsmenü des Clusters öffnen und **Edit** wählen.

Die Seite **Edit RabbitMQ cluster** zeigt die Karte **Cluster settings** an. Die Felder **Preset** und **Number of replicas** sind dort ausgegraut.

### 2. Die Parameter anpassen

- **RabbitMQ Version**: Wählen Sie die Zielversion aus.
- **Disk size (GB)**: Geben Sie die neue Kapazität pro Knoten ein. Die Größe kann nur erhöht werden: Ein kleinerer Wert wird vom Formular akzeptiert, aber von der Plattform abgelehnt, und der Cluster behält seine aktuelle Größe.
- **External access**: Aktivieren oder deaktivieren Sie den Schalter.

:::warning Versionswechsel
Beim Versionswechsel werden die RabbitMQ-Knoten nacheinander neu erstellt: Mit nur einem Replica ist der Cluster während des Neustarts nicht verfügbar (etwa ein bis zwei Minuten), und die Clients müssen sich neu verbinden. Die Adresse im Feld **Host** ändert sich nicht. Testen Sie den Versionswechsel auf einem Nicht-Produktionscluster, bevor Sie ihn auf einen Produktionscluster anwenden, und prüfen Sie die Kompatibilität Ihrer Clients mit der Zielversion.
:::

### 3. Speichern

Klicken Sie auf **Save**. Die Meldung „Cluster updated“ bestätigt, dass die Parameter angewendet wurden, und die Konsole kehrt zur Detailseite zurück.

Lässt die Quota des Projekts die neue Konfiguration nicht zu, bleibt die Schaltfläche **Save** inaktiv.

## Preset oder Anzahl der Replicas ändern

Preset und Anzahl der Replicas werden bei der Erstellung festgelegt. Es gibt zwei Möglichkeiten:

- **Einen neuen Cluster erstellen** mit der gewünschten Konfiguration, die VHosts und Benutzer neu anlegen und dann Ihre Anwendungen umstellen;
- **Den Support kontaktieren**: Diese Optionen werden in der Konsole nicht angeboten; [wenden Sie sich an den Support](mailto:support@hidora.io).

## Überprüfung

Auf der Detailseite des Clusters zeigt der Abschnitt **General Information** die aktualisierte **Version** und **Volume Size** an, der Abschnitt **Connection** den Status des **External Access**.

## Weiterführende Informationen

- [Konzepte](../concepts.md): Bereitstellungsmodi und Presets
- [VHosts und Benutzer verwalten](./manage-vhosts-users.md)
