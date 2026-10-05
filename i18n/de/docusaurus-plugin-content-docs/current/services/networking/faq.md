---
sidebar_position: 6
title: FAQ
---

# FAQ — Netzwerk

### Wozu dient ein VPC, wenn meine VM bereits eine öffentliche IP hat?

Die öffentliche IP dient dazu, die VM im Internet erreichbar zu machen. Das VPC dient dem Austausch **zwischen Ihren VMs** über private Adressen, die aus dem Internet nicht erreichbar sind. So können Sie nur den Frontend-VMs eine öffentliche IP geben und die anderen privat halten.

---

### Kann eine VM mit mehreren VPCs verbunden werden?

Ja. Haken Sie im Abschnitt **VPC Networks (Secondary)** mehrere VPCs und in jedem ein oder mehrere Subnetze an. Jedes Subnetz fügt der VM eine Netzwerkschnittstelle hinzu.

---

### Welche Adressbereiche kann ich verwenden?

Private IPv4-Bereiche: `10.0.0.0/8`, `172.16.0.0/12` oder `192.168.0.0/16`, ohne Überschneidung mit einem anderen Subnetz desselben VPC oder mit den reservierten Bereichen `10.244.0.0/16` und `10.96.0.0/12`. Wir empfehlen `/24`-Bereiche in `172.16.0.0/12`. Siehe [Konzepte](./concepts.md#adressbereiche).

---

### Können zwei VPCs denselben Bereich verwenden?

Ja: Die VPCs sind isoliert, ihre Bereiche dürfen sich überschneiden. Nur die Subnetze desselben VPC müssen disjunkt sein.

---

### Kann ich zwei VPCs miteinander verbinden?

Die Verbindung von VPCs (*Peering*) und statische Routen werden in der Konsole nicht angeboten; wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Kann ich ein VPC oder ein Subnetz ändern?

Nein. Sie können einem VPC Subnetze hinzufügen und diejenigen löschen, die nicht mehr verwendet werden. Um einen Bereich zu ändern, erstellen Sie ein neues Subnetz und migrieren Sie die VMs dorthin (siehe [Subnetze verwalten](./how-to/manage-subnets.md)).

---

### Können meine Kubernetes-Cluster oder Datenbanken einem VPC beitreten?

Nicht über die Konsole: Der Abschnitt **VPC Networks (Secondary)** existiert nur für VM-Instanzen.

---

### Gilt die Firewall der VM für den VPC-Datenverkehr?

Nein. Die Hikube-Firewall (**Enable Firewall**, **Allowed Ports**) filtert nur den Datenverkehr, der über die öffentliche IP der VM ankommt. Der Datenverkehr zwischen VMs eines VPC wird nicht gefiltert, unabhängig von den erlaubten Ports: Konfigurieren Sie dafür eine Firewall im Betriebssystem (ufw, firewalld, nftables).

---

### Warum kann ich mein VPC nicht löschen?

Eine VM ist noch damit verbunden: Die Konsole zeigt **Cannot delete** mit dem Namen der VMs an. Trennen Sie sie (**Edit** > **Network & Security**) oder löschen Sie sie und versuchen Sie es dann erneut.

---

### Wie viele Subnetze kann ich erstellen?

Der Assistent **Create VPC** akzeptiert bis zu zehn Subnetze. Weitere können anschließend mit **Create Subnet** hinzugefügt werden, solange sich ihre Bereiche nicht überschneiden.
