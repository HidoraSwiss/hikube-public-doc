---
title: "Eine VM mit einem VPC verbinden"
---

# Eine VM mit einem VPC verbinden

Diese Anleitung erklärt, wie Sie eine VM mit einem oder mehreren VPC-Subnetzen verbinden, bei der Erstellung oder bei einer bestehenden VM, und wie Sie die Schnittstelle anschließend im Betriebssystem prüfen und konfigurieren. Sie behandelt auch das Trennen.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt
- Ein VPC mit mindestens einem Subnetz (siehe [Schnellstart](../quick-start.md)) oder die Absicht, eines über den VM-Assistenten zu erstellen
- Ein SSH-Zugang zur VM für die Überprüfung

## Schritte

### 1. Eine neue VM verbinden

1. Öffnen Sie **VM Instances** > **Create an Instance** und füllen Sie die ersten Schritte aus.
2. Haken Sie im Schritt **Network**, Abschnitt **VPC Networks (Secondary)**, das gewünschte VPC an.
3. Haken Sie unter **Subnets** ein oder mehrere Subnetze an.
4. Schließen Sie den Assistenten ab: Die **Summary** zeigt **Private Networks** mit der Anzahl der Subnetze an. Klicken Sie auf **Create instance**.

Noch kein VPC? Klicken Sie im Abschnitt **VPC Networks (Secondary)** auf **+ VPC**: Im Dialog **Create VPC** erstellen Sie das VPC und seine Subnetze, das VPC wird anschließend automatisch angehakt. Um einem angehakten VPC ein Subnetz hinzuzufügen, klicken Sie auf **Add subnet**, geben einen Namen und einen CIDR-Bereich ein und bestätigen.

### 2. Eine bestehende VM verbinden

1. Öffnen Sie die Detailseite der VM und klicken Sie auf **Edit**.
2. Haken Sie unter **Network & Security**, Abschnitt **VPC Networks (Secondary)**, das VPC und dann die Subnetze an.
3. Klicken Sie auf **Save**.

### 3. In der Konsole prüfen

Auf der Detailseite der VM, Abschnitt **Network & Security**:

- **VPC Networks** listet jedes VPC mit seinen **Connected subnets** und deren Bereich auf, zum Beispiel `app (172.16.0.0/24)`;
- **IP Addresses** fügt pro Subnetz eine **Secondary**-Adresse hinzu.

### 4. Im Betriebssystem prüfen

```bash
ip -br addr
```

**Erwartetes Ergebnis:** eine zusätzliche Schnittstelle pro verbundenem Subnetz. Das Betriebssystem konfiguriert sie nicht automatisch: Sie erscheint zunächst ohne Adresse, zum Beispiel:

```
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             10.x.x.x/xx ...
enp2s0           DOWN
```

Aktivieren Sie DHCP auf der sekundären Schnittstelle. Beispiel mit netplan (Ubuntu):

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

**Erwartetes Ergebnis:** `enp2s0` ist `UP` mit der in der Konsole angezeigten **Secondary**-Adresse, zum Beispiel `172.16.0.11/24`.

`use-routes: false` verhindert, dass die VPC-Schnittstelle die Standardroute ersetzt: Der Internetzugang läuft weiterhin über die Hauptschnittstelle.

### 5. Eine VM trennen

1. Detailseite der VM > **Edit**.
2. Entfernen Sie unter **VPC Networks (Secondary)** den Haken beim Subnetz oder beim gesamten VPC.
3. Klicken Sie auf **Save**.

Entfernen Sie anschließend die entsprechende Konfiguration im Betriebssystem (zum Beispiel die hinzugefügte netplan-Datei).

## Überprüfung

Von einer anderen VM desselben Subnetzes:

```bash
ping -c 3 <vm-secondary-address>
```

## Weiterführende Informationen

- [Subnetze verwalten](./manage-subnets.md)
- [Netzwerk und Firewall einer VM konfigurieren](../../compute/how-to/configure-network.md)
- [Fehlerbehebung](../troubleshooting.md)
