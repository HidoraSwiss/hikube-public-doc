---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ein VPC erstellen und zwei VMs damit verbinden

Diese Anleitung erstellt in der [Hikube-Konsole](https://console.hikube.cloud) ein VPC mit einem Subnetz, verbindet zwei VMs damit und prüft, dass sie über ihre privaten Adressen kommunizieren.

---

## Voraussetzungen

- Ein Hikube-Konto und ein **Projekt** (siehe [Hikube-Schnellstart](../../getting-started/quick-start.md)).
- Zwei Linux-VMs in diesem Projekt, von denen mindestens eine per SSH erreichbar ist (siehe [Ihre erste VM erstellen](../compute/quick-start.md)). Sie können sie auch während dieser Anleitung erstellen.

---

## Schritt 1: Den Assistenten zur VPC-Erstellung öffnen

1. Öffnen Sie im Seitenmenü **Infrastructure** > **Networking**. Die Seite **Virtual Private Clouds** listet die VPCs des Projekts auf.
2. Klicken Sie auf **Create VPC**.

Der Assistent **Create VPC** umfasst drei Schritte: **General**, **Subnets** und **Review**.

---

## Schritt 2: Konfigurieren und bestätigen

### General

Geben Sie den **VPC Name** ein, zum Beispiel `vpc-demo` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben). Klicken Sie auf **Next**.

### Subnets

Ein Subnetz ist mit dem **CIDR Block** `172.16.0.0/24` vorausgefüllt.

1. **Name**: Ersetzen Sie den generierten Namen durch `app`.
2. **CIDR Block**: Belassen Sie `172.16.0.0/24`.
3. Optional: **Add a subnet**, um weitere zu erstellen (zum Beispiel `db` mit `172.16.1.0/24`), bis zu zehn.
4. Klicken Sie auf **Next**.

### Review

Die **Configuration Summary** fasst den **VPC Name** und seine **Subnets** zusammen. Klicken Sie auf **Create VPC**.

Die Konsole zeigt **VPC Created** an und kehrt zur Liste zurück.

---

## Schritt 3: Den Zustand prüfen

In der Liste der VPCs muss der Status von `vpc-demo` (Spalte **State** in der Tabellenansicht) von **Provisioning** zu **Ready** wechseln.

Öffnen Sie das Menü **Actions** des VPC und klicken Sie auf **View Subnets**: Die Seite **Subnets for vpc-demo** listet `app` mit seinem **CIDR Block** `172.16.0.0/24` auf.

**Erwartetes Ergebnis:** VPC **Ready**, Subnetz `app` aufgeführt.

---

## Schritt 4: Die VMs mit dem Subnetz verbinden

Für jede der beiden VMs:

1. Öffnen Sie **VM Instances**, klicken Sie auf die VM und dann auf **Edit**.
2. Haken Sie unter **Network & Security**, Abschnitt **VPC Networks (Secondary)**, `vpc-demo` an.
3. Haken Sie unter **Subnets** `app` an.
4. Klicken Sie auf **Save**.

Für eine neue VM treffen Sie dieselbe Auswahl im Schritt **Network** des Assistenten **Create an Instance**.

Auf der Detailseite jeder VM, Abschnitt **Network & Security**:

- **VPC Networks** zeigt `vpc-demo` und `app (172.16.0.0/24)` an;
- **IP Addresses** zeigt eine **Secondary**-Adresse in `172.16.0.0/24` an. Notieren Sie die der zweiten VM.

---

## Schritt 5: Verbindung und Tests

Verbinden Sie sich per SSH mit der ersten VM (Befehl aus dem Block **SSH Connection**) und listen Sie dann ihre Schnittstellen auf:

```bash
ip -br addr
```

**Erwartetes Ergebnis:** Eine zusätzliche Schnittstelle erscheint (zum Beispiel `enp2s0`), ohne Adresse: Das Betriebssystem konfiguriert sie nicht automatisch.

Aktivieren Sie DHCP auf dieser Schnittstelle. Beispiel mit netplan (Ubuntu):

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

**Erwartetes Ergebnis:** `enp2s0` ist `UP` mit einer Adresse in `172.16.0.x/24`, der in der Konsole als **Secondary** angezeigten. Gehen Sie auf der zweiten VM genauso vor.

Testen Sie die Kommunikation mit der zweiten VM über ihre private Adresse:

```bash
ping -c 3 172.16.0.11
```

Ersetzen Sie `172.16.0.11` durch die in Schritt 4 notierte **Secondary**-Adresse. Der Ping muss antworten; dieser Datenverkehr läuft weder über das Internet noch über die Firewall der öffentlichen IP.

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Maßnahme |
|----------|--------|
| **Invalid CIDR block** bei der Erstellung | Geben Sie einen IPv4-Bereich im Format `a.b.c.d/n` ein, zum Beispiel `172.16.2.0/24`. |
| Fehlermeldung, die eine Überschneidung erwähnt (*overlaps*) | Der Bereich überschneidet sich mit einem anderen Subnetz des VPC oder einem reservierten Bereich (`10.244.0.0/16`, `10.96.0.0/12`): Wählen Sie einen anderen Bereich. |
| Die sekundäre Schnittstelle hat in der VM keine Adresse | Siehe [Fehlerbehebung](./troubleshooting.md#die-sekundäre-schnittstelle-hat-in-der-vm-keine-adresse). |
| Der Ping antwortet nicht | Prüfen Sie, dass beide VMs im **selben** Subnetz sind und die Firewall des Betriebssystems (ufw, firewalld) ICMP erlaubt. |

---

## Schritt 7: Aufräumen

1. Trennen Sie die VMs: **Edit** > **Network & Security**, Haken bei `vpc-demo` entfernen, dann **Save**.
2. Öffnen Sie unter **Networking** das Menü **Actions** des VPC und klicken Sie auf **Delete**.
3. Geben Sie zur Bestätigung den Namen des VPC ein und klicken Sie dann auf **Permanently delete**.

Das Löschen eines VPC löscht auch seine Subnetze. Es wird abgelehnt, solange eine VM damit verbunden ist: Die Konsole zeigt **Cannot delete** mit der Liste der betroffenen VMs an.

---

## Nächste Schritte

- [Eine bestehende VM verbinden oder trennen](./how-to/attach-vm-to-vpc.md)
- [Subnetze verwalten](./how-to/manage-subnets.md)
- [Konzepte](./concepts.md)

<NavigationFooter
  nextSteps={[
    {label: "Praktische Anleitungen", href: "../how-to/attach-vm-to-vpc"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
