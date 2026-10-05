---
title: "System-Disk aus einem Image erstellen"
---

# System-Disk aus einem Image erstellen

Eine **System-Disk** enthält ein vorinstalliertes Betriebssystem und kann als Boot-Disk einer VM dienen. Diese Anleitung erklärt, wie Sie sie in der [Hikube-Konsole](https://console.hikube.cloud) aus einem Image des Katalogs oder aus Ihrem eigenen Image erstellen.

## Voraussetzungen

- Ein **Projekt** mit ausreichendem Speicher-Quota
- Für ein eigenes Image: eine öffentliche **HTTPS-URL** zu einer ISO- oder QCOW2-Datei

## Schritte

### 1. Den Assistenten öffnen

Öffnen Sie **Infrastructure** → **Disks** und klicken Sie auf **Create a disk**. Geben Sie im Schritt **General** den **Disk Name** ein.

### 2. Die Quelle wählen

Wählen Sie im Schritt **Source** **System Disk**. Die Auswahl **OS Image / Source** wird angezeigt:

- **Image aus dem Katalog**: Wählen Sie das Betriebssystem und dann seine **Version**;
- **Eigenes Image**: Klicken Sie auf **Custom Image** und geben Sie die **Image URL (ISO/QCOW2)** ein. Die URL muss auf eine rohe oder komprimierte Datei verweisen, die vom System erkannt wird.

Validierungsregeln für die URL:

| Regel | Meldung der Konsole |
|-------|-----------------------|
| URL erforderlich | „URL is required“ |
| Nur HTTPS | „URL must use the HTTPS protocol“ |
| Keine private oder lokale Adresse | „Private or local IP addresses are not allowed“ |

### 3. Größe und Sicherheit konfigurieren

Im Schritt **Configuration**:

- **Size (GB)**: mindestens 20 GB und mindestens **50 GB für ein Windows-Image** (die Konsole passt den Wert automatisch an);
- **Replication Type**: **Asynchronous Replication** (Recommended) oder **Synchronous Replication**;
- **Disk Encryption**: Aktivieren Sie diese Option bei Bedarf.

### 4. Prüfen und erstellen

Im Schritt **Summary** zeigt der Bereich **Source & Content** **System Disk** und das gewählte Image an (**Cloud Image: …** oder **Custom image (ISO/QCOW2)** mit der URL). Die **Estimated Cost** enthält bei einem Windows-Image die Lizenz. Klicken Sie auf **Create disk**.

### 5. Den Download verfolgen

Nach der Erstellung durchläuft die Disk den Status **Downloading**: Die Plattform importiert das Image, und die Seite der Disk zeigt den Fortschritt in Prozent an. Anschließend wechselt die Disk zu **Ready**.

Die Seite der Disk zeigt das Ursprungs-Image im Abschnitt **Source** an.

## Die System-Disk verwenden

Um eine VM von dieser Disk zu starten, wählen Sie im Schritt **Storage** des VM-Erstellungsassistenten **Existing** bei der **System Disk (Boot)** (siehe [Eine Disk an eine VM anbinden](./attach-to-vm.md)).

:::note
Ein eigenes Image (ISO) ist nur bei der Erstellung einer Disk möglich.
:::

## Überprüfung

- Die Disk hat den Status **Ready**.
- Ihre Seite zeigt das Ursprungs-Image (**Source system image**) im Abschnitt **Source** an.

## Weiterführende Informationen

- [Konzepte](../concepts.md)
- [Fehlerbehebung](../troubleshooting.md)
