---
title: "Externes Netzwerk konfigurieren"
---

# Externes Netzwerk konfigurieren

Hikube bietet zwei Netzwerk-Expositionsmethoden, um eine VM von außen erreichbar zu machen: **PortList** (empfohlen) und **WholeIP**. Diese Anleitung erklärt, wie Sie jede Methode auswählen und konfigurieren.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrem Hikube-Kubeconfig
- Eine bestehende **VMInstance** oder ein bereitstellungsbereites Manifest
- Kenntnis der für Ihre Anwendung erforderlichen Ports

## Schritte

### 1. Expositionsmethode wählen

Hikube unterstützt zwei Methoden über den Parameter `externalMethod`:

| Methode | Beschreibung | Anwendungsfall |
|---------|-------------|-------------|
| **PortList** | Nur die in `externalPorts` aufgelisteten Ports werden exponiert. Automatische Firewall. | Produktion, gesicherte Umgebungen |
| **WholeIP** | Alle Ports der VM werden exponiert. Keine Netzwerkfilterung. | Entwicklung, Tests, VPN/Gateway, vollständiger administrativer Zugang |

:::tip Empfehlung
Verwenden Sie **PortList** in der Produktion. Diese Methode wendet eine automatische Firewall an, die nur die explizit deklarierten Ports exponiert.
:::

### 2. Mit PortList konfigurieren (empfohlen)

Mit `PortList` deklarieren Sie explizit die zu exponierenden Ports über `externalPorts`. Alles andere wird auf Netzwerkebene blockiert:

```yaml title="vm-portlist.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-web-server
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

In diesem Beispiel sind nur die Ports SSH (22), HTTP (80) und HTTPS (443) von außen erreichbar.

### 3. Mit WholeIP konfigurieren (Alternative)

Mit `WholeIP` erhält die VM eine öffentliche IP mit allen offenen Ports. Der Parameter `externalPorts` ist nicht erforderlich:

```yaml title="vm-wholeip.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-dev
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: WholeIP
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning Sicherheit
Mit `WholeIP` ist die VM vollständig im Internet exponiert. Alle Ports sind erreichbar. Konfigurieren Sie unbedingt eine **Firewall auf Betriebssystemebene** (ufw, firewalld, iptables), um den Zugriff einzuschränken.
:::

### 4. Anwenden und Zugriff überprüfen

Wenden Sie das Manifest an:

```bash
kubectl apply -f vm-portlist.yaml
```

Warten Sie, bis die VM im Zustand `Running` ist:

```bash
kubectl get vminstance vm-web-server -w
```

## Überprüfung

Rufen Sie die externe IP-Adresse der VM ab:

```bash
kubectl get vminstance vm-web-server -o yaml
```

Testen Sie die Konnektivität auf den exponierten Ports:

```bash
# SSH-Test
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-EXTERNE>

# HTTP-Test (wenn ein Webserver installiert ist)
curl http://<IP-EXTERNE>
```

Um zu überprüfen, dass ein nicht exponierter Port tatsächlich blockiert ist (mit PortList):

```bash
# Dieser Port sollte mit PortList nicht erreichbar sein
nc -zv <IP-EXTERNE> 8080
```

:::note Port-Änderung
Um exponierte Ports mit `PortList` hinzuzufügen oder zu entfernen, ändern Sie die Liste `externalPorts` im Manifest und wenden Sie es erneut mit `kubectl apply` an.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Abschnitt Netzwerkkonfiguration
- [Schnellstart](../quick-start.md)
