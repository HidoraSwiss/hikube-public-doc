---
title: "Die Subnetze eines VPC verwalten"
---

# Die Subnetze eines VPC verwalten

Ein VPC lässt sich nach seiner Erstellung nicht ändern, aber Sie können ihm Subnetze hinzufügen und diejenigen löschen, die nicht mehr benötigt werden. Diese Anleitung zeigt, wie Sie dabei in der Konsole vorgehen und wie Sie die Adressbereiche wählen.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt
- Ein bestehendes VPC unter **Infrastructure** > **Networking**

## Schritte

### 1. Die Adressbereiche planen

Wählen Sie einen privaten IPv4-Bereich, der sich mit keinem anderen Subnetz des VPC überschneidet. Beispiel für eine Aufteilung:

| Subnetz | CIDR-Bereich | Adressen |
|-------------|------------|----------|
| `app` | `172.16.0.0/24` | 256 |
| `db` | `172.16.1.0/24` | 256 |
| `admin` | `172.16.2.0/26` | 64 |

Erlaubte Bereiche: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, ausgenommen die reservierten Bereiche `10.244.0.0/16` und `10.96.0.0/12`.

### 2. Die Liste der Subnetze öffnen

1. Öffnen Sie **Infrastructure** > **Networking**.
2. Klicken Sie im Menü **Actions** des VPC auf **View Subnets**.

Die Seite **Subnets for `<vpc>`** listet jedes Subnetz mit seinem **Subnet Name** und seinem **CIDR Block** auf.

### 3. Ein Subnetz erstellen

1. Klicken Sie auf **Create Subnet**.
2. **Subnet Name**: 1 bis 63 Zeichen, Kleinbuchstaben, Ziffern und Bindestriche.
3. **IPv4 CIDR Block**: zum Beispiel `172.16.2.0/26`.
4. Klicken Sie auf **Create Subnet**.

Die Konsole zeigt **Subnet created!** an und kehrt zur Liste zurück. Das Subnetz wird sofort im Abschnitt **VPC Networks (Secondary)** der VMs angeboten.

### 4. Ein Subnetz löschen

1. Trennen Sie zuerst die VMs, die es verwenden (siehe [Eine VM mit einem VPC verbinden](./attach-vm-to-vpc.md#5-eine-vm-trennen)).
2. Öffnen Sie in der Liste der Subnetze das Menü **Actions** der Zeile und klicken Sie auf **Delete**.
3. Geben Sie zur Bestätigung den Namen des Subnetzes ein und klicken Sie dann auf **Permanently delete**.

Ist noch eine VM damit verbunden, zeigt die Konsole **Cannot delete** und die Liste der betroffenen VMs an.

### 5. Den Bereich eines Subnetzes ändern

Ein Subnetz lässt sich nicht ändern. Erstellen Sie ein neues Subnetz mit dem richtigen Bereich, verbinden Sie die VMs damit, trennen Sie sie vom alten und löschen Sie dieses dann.

## Überprüfung

Die Seite **Subnets for `<vpc>`** spiegelt Erstellungen und Löschungen wider. Bei einer verbundenen VM zeigt der Abschnitt **VPC Networks** der Detailseite die verbundenen Subnetze mit ihrem Bereich an.

## Weiterführende Informationen

- [Konzepte: Adressbereiche](../concepts.md#adressbereiche)
- [Eine VM mit einem VPC verbinden](./attach-vm-to-vpc.md)
