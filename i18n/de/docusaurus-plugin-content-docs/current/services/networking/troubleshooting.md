---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Netzwerk

### CIDR-Block bei der Erstellung eines Subnetzes abgelehnt

**Ursache**: Ungültiges Format, öffentlicher Bereich, Überschneidung mit einem anderen Subnetz des VPC oder mit einem reservierten Bereich.

**Lösung**:

| Meldung | Korrektur |
|---------|-----------|
| **Invalid CIDR block (ex: 192.168.1.0/24)** oder **Invalid CIDR format (e.g., 172.16.0.0/24)** | Geben Sie eine IPv4-Adresse gefolgt von einem Präfix ein, zum Beispiel `172.16.0.0/24`. |
| Meldung, dass der Bereich privat sein muss | Verwenden Sie einen Bereich in `10.0.0.0/8`, `172.16.0.0/12` oder `192.168.0.0/16`. |
| Meldung, die eine Überschneidung (*overlaps*) mit einem bestehenden Subnetz erwähnt | Wählen Sie einen Bereich, der von den anderen Subnetzen des VPC disjunkt ist (Liste unter **View Subnets**). |
| Meldung, die eine Überschneidung mit einem reservierten Netzwerk erwähnt | Vermeiden Sie `10.244.0.0/16` und `10.96.0.0/12`; bevorzugen Sie `172.16.0.0/12`. |

---

### Name des VPC oder des Subnetzes abgelehnt

**Ursache**: Der Name entspricht nicht den Regeln oder existiert bereits.

**Lösung**:

- **VPC**: 3 bis 16 Zeichen, Kleinbuchstaben, Ziffern und Bindestriche, beginnend mit einem Buchstaben und endend mit einem Buchstaben oder einer Ziffer. Eindeutig im Projekt.
- **Subnetz**: 1 bis 63 Zeichen, Kleinbuchstaben, Ziffern und Bindestriche. Eindeutig im VPC.

---

### Das VPC bleibt im Status Provisioning

**Ursache**: Die Plattform hat die Bereitstellung des Netzwerks noch nicht abgeschlossen.

**Lösung**: Die Liste wird automatisch aktualisiert; warten Sie einen Moment. Wechselt der Zustand nach einigen Minuten nicht zu **Ready**, wenden Sie sich unter Angabe des VPC-Namens an den [Support](mailto:support@hidora.io).

---

### Die sekundäre Schnittstelle hat in der VM keine Adresse

**Ursache**: Die Plattform fügt der VM die Schnittstelle hinzu, aber das Betriebssystem konfiguriert sie nicht automatisch (das ist unter Ubuntu 24.04 der Fall); oder die VM hat die Änderung noch nicht übernommen.

**Lösung**:

1. Prüfen Sie auf der Detailseite der VM, ob **VPC Networks** das Subnetz aufführt und **IP Addresses** eine **Secondary**-Adresse enthält.
2. Listen Sie in der VM die Schnittstellen auf:
   ```bash
   ip -br link
   ip -br addr
   ```
3. Wenn die Schnittstelle ohne Adresse existiert, aktivieren Sie DHCP darauf (netplan-Beispiel in [Eine VM mit einem VPC verbinden](./how-to/attach-vm-to-vpc.md#4-im-betriebssystem-prüfen)).
4. Erscheint die Schnittstelle überhaupt nicht, starten Sie die VM neu (**Restart** im Abschnitt **Actions**).
5. Besteht das Problem weiterhin, wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Zwei VMs desselben Subnetzes kommunizieren nicht

**Ursache**: VMs in verschiedenen Subnetzen oder VPCs, Schnittstelle im Betriebssystem nicht konfiguriert oder Firewall des Betriebssystems.

**Lösung**:

1. Vergleichen Sie den Abschnitt **VPC Networks** der beiden VMs: Sie müssen dasselbe VPC **und** dasselbe Subnetz teilen.
2. Prüfen Sie in jeder VM, ob die sekundäre Schnittstelle die in der Konsole angezeigte Adresse trägt (`ip -br addr`).
3. Prüfen Sie die Firewall des Betriebssystems (`sudo ufw status`, `sudo firewall-cmd --list-all`, `sudo nft list ruleset`).
4. Testen Sie explizit über die Schnittstelle:
   ```bash
   ping -c 3 -I enp2s0 <other-vm-address>
   ```

---

### Die VM hat nach dem Hinzufügen eines VPC den Internetzugang verloren

**Ursache**: Die Netzwerkkonfiguration des Betriebssystems hat die VPC-Schnittstelle zur Standardroute gemacht.

**Lösung**: Prüfen Sie die Standardroute:

```bash
ip route show default
```

Sie muss über die Hauptschnittstelle laufen. Läuft sie über die VPC-Schnittstelle, deaktivieren Sie die Verwendung der DHCP-Routen auf dieser Schnittstelle (`use-routes: false` mit netplan, siehe [Eine VM mit einem VPC verbinden](./how-to/attach-vm-to-vpc.md#4-im-betriebssystem-prüfen)).

---

### Löschen nicht möglich

**Ursache**: Das VPC oder das Subnetz wird noch von VMs verwendet. Die Konsole listet die betroffenen VMs auf.

**Lösung**: Öffnen Sie für jede aufgeführte VM **Edit** > **Network & Security**, entfernen Sie den Haken beim VPC oder Subnetz und klicken Sie dann auf **Save**. Versuchen Sie anschließend erneut, zu löschen.
