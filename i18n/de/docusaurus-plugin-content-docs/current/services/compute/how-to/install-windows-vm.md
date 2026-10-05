---
title: "Eine Windows-VM erstellen"
---

# Eine Windows-VM erstellen

Die Hikube-Konsole bietet sofort einsatzbereite **Windows Server**-Images. Diese Anleitung erklärt, wie Sie eine Windows-Server-VM erstellen, das generierte Administratorpasswort abrufen und sich per RDP verbinden.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt mit mindestens 4 vCPU, 16 GB Arbeitsspeicher und 50 GB verfügbarem Speicher
- Ein RDP-Client (Remotedesktopverbindung unter Windows, Windows App unter macOS, `xfreerdp` oder Remmina unter Linux)
- Ein Passwortmanager, um das Administratorpasswort aufzubewahren

## Schritte

### 1. Den Assistenten starten

Öffnen Sie **Infrastructure** > **VM Instances** und klicken Sie auf **Create an Instance**. Geben Sie im Schritt **General** den **Instance name** ein (zum Beispiel `win-srv01`) und klicken Sie dann auf **Next**.

### 2. Den Instanztyp wählen

Wählen Sie im Schritt **Configuration** mindestens **Universal (U)** > **XLarge** (4 vCPU, 16 GB). Klicken Sie auf **Next**.

:::note Windows-Lizenz
Die Windows-Lizenz wird nach der Anzahl der vCPU abgerechnet. Sie ist in den geschätzten Kosten enthalten, die oben im Assistenten angezeigt werden.
:::

### 3. Image und System-Disk wählen

Im Schritt **Storage**:

1. Wählen Sie unter **Operating System** die Karte **windows-server** und die Version **2022** oder **2025**.
2. Setzen Sie **Size (GB)** auf mindestens `50`: Das ist das Minimum für Windows (Meldung **Min. 50 GB required** darunter).
3. Wählen Sie den **Replication Type** und aktivieren Sie bei Bedarf **Disk Encryption**.
4. Klicken Sie auf **Next**.

### 4. Den RDP-Port öffnen

Im Schritt **Network**:

1. Lassen Sie **Public IPv4 Address** aktiviert und **Enable Firewall** angehakt.
2. Geben Sie in **Custom port...** den Wert `3389` ein und klicken Sie auf die Schaltfläche zum Hinzufügen.
3. Entfernen Sie den Haken bei **SSH (22)**, wenn Sie OpenSSH auf dem Server nicht verwenden.

Das Feld **Cloud-Init script (User Data)** wird für Windows nicht angeboten.

### 5. Bereitstellen und das Passwort kopieren

Klicken Sie im Schritt **Summary** auf **Create instance**. Der Dialog **Windows Instance Credentials** öffnet sich und zeigt an:

- **Default Username**;
- **Administrator Password**.

Kopieren Sie beide Werte mit den Kopierschaltflächen, speichern Sie sie in Ihrem Passwortmanager und klicken Sie dann auf **I copied the password and continue**.

:::warning Passwort wird nur einmal angezeigt
Das Passwort wird bei der Erstellung generiert und **nicht erneut angezeigt**. Wenn Sie es verlieren, kann es in der Konsole nicht wiederhergestellt werden.
:::

### 6. Den Start abwarten

Warten Sie in der Liste **VM Instances** auf den Status **Running**. Der erste Start von Windows (Initialisierung und Konfiguration) dauert mehrere Minuten länger als bei einer Linux-VM: Warten Sie vor der ersten RDP-Verbindung.

### 7. Sich per RDP verbinden

Notieren Sie die öffentliche IP-Adresse auf der Detailseite: Sie steht im Block **SSH Connection** des Abschnitts **Network & Security**. Verbinden Sie sich anschließend:

```bash
# Linux
xfreerdp /v:<public-ip> /u:<username>
```

Unter Windows oder macOS fügen Sie in Ihrem Remotedesktop-Client einen PC mit der Adresse `<public-ip>` hinzu und verwenden die in Schritt 5 kopierten Anmeldedaten.

## Überprüfung

Testen Sie von Ihrem Rechner aus, ob der RDP-Port geöffnet ist:

```bash
nc -zv -w 5 <public-ip> 3389
```

**Erwartetes Ergebnis:** `Connection to <public-ip> 3389 port [tcp/ms-wbt-server] succeeded!`

Ändern Sie nach der Anmeldung das Passwort und spielen Sie die Windows-Updates ein.

:::note Installation von Ihrem eigenen ISO
Die Installation von Windows von einem eigenen ISO erfordert während der Installation einen grafischen Konsolenzugriff (VNC). Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den [Support](mailto:support@hidora.io).
:::

## Weiterführende Informationen

- [Netzwerk und Firewall konfigurieren](./configure-network.md)
- [Eine zusätzliche Disk anbinden](./attach-extra-disk.md)
