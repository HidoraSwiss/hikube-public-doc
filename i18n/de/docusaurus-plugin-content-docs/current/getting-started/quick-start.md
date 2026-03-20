---
sidebar_position: 3
title: Schnellstart
---

# 🚀 Schnellstart mit Hikube

Willkommen! Dieser Leitfaden begleitet Sie Schritt für Schritt bei der Erstellung Ihres ersten Projekts auf Hikube. Am Ende dieses Tutorials haben Sie Ihre erste Anwendung in einer vollständig gesicherten Umgebung bereitgestellt.

---

## Voraussetzungen

### **Zugang zur Plattform**
Falls Sie noch kein Hikube-Konto haben, kontaktieren Sie unser Team unter **sales@hidora.io**, um Ihre Zugangsdaten zu erhalten.

### **Installation der erforderlichen Tools**

#### **kubectl** (erforderlich)

**macOS**
```bash
# Homebrew
brew install kubectl
```

**Linux**
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y kubectl

# RHEL/CentOS/Fedora
sudo dnf install kubectl
# oder für ältere Versionen
sudo yum install kubectl

# Alpine Linux
sudo apk add kubectl
```

**Windows**
```powershell
# Chocolatey
choco install kubernetes-cli

# winget
winget install Kubernetes.kubectl
```

📖 **Offizielle Dokumentation**: [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)

#### **kubelogin** (erforderlich für OIDC-Authentifizierung)

[kubelogin](https://github.com/int128/kubelogin) ist ein kubectl-Plugin für die OpenID-Connect-Authentifizierung (OIDC).

**macOS / Linux (Homebrew)**
```bash
brew install kubelogin
```

**Krew (macOS, Linux, Windows)**
```bash
kubectl krew install oidc-login
```

**Windows (Chocolatey)**
```powershell
choco install kubelogin
```

📖 **Offizielle Dokumentation**: [int128/kubelogin](https://github.com/int128/kubelogin)

:::warning Achtung
Verwenden Sie **nicht** das Azure-kubelogin (`Azure/kubelogin`). Hikube verwendet die standardmässige OIDC-Authentifizierung und benötigt das Plugin [int128/kubelogin](https://github.com/int128/kubelogin).
:::

### **Optionale empfohlene Tools**

Für eine bessere Kubernetes-Verwaltungserfahrung:

- **[Lens](https://k8slens.dev/)** - Moderne grafische Oberfläche für Kubernetes
- **[K9s](https://k9scli.io/)** - Interaktive Terminal-Oberfläche für Kubernetes
- **[Helm](https://helm.sh/)** - Paketmanager für Kubernetes
- **[kubectx + kubens](https://github.com/ahmetb/kubectx)** - Tools zum schnellen Wechseln von Kontext und Namespace

---

## Schritt 1: Auf Ihren Tenant zugreifen

### **kubectl-Konfiguration**
1. **Holen Sie Ihre kubeconfig** von Ihrem Hikube-Administrator
2. **Konfigurieren Sie kubectl** mit Ihrer Konfigurationsdatei:
   ```bash
   # Option 1: Umgebungsvariable
   export KUBECONFIG=/path/to/your/hikube-kubeconfig.yaml

   # Option 2: Kopie in das Standardverzeichnis
   cp hikube-kubeconfig.yaml ~/.kube/config
   ```
3. **Überprüfen Sie die Verbindung**:
   ```bash
   kubectl get pods
   ```

:::tip Mehrere Konfigurationen
Sie können mehrere Cluster mit `kubectl config get-contexts` und `kubectl config use-context <context-name>` verwalten
:::

### **Überprüfung Ihres Tenants**
Ihr Tenant ist Ihr **isolierter Arbeitsbereich**. Überprüfen Sie, dass Sie sich im richtigen Kontext befinden:
```bash
kubectl config current-context
```

:::warning -A / --all-namespaces nicht verwenden
Das Flag `-A` (`--all-namespaces`) führt eine Abfrage auf Cluster-Ebene durch, was für einen Tenant-Benutzer nicht erlaubt ist. Verwenden Sie Befehle immer ohne `-A`: Ihre kubeconfig zielt bereits auf Ihren Namespace ab.
:::

---

## Schritt 2: Ihren ersten Kubernetes-Cluster erstellen

### **Bereitstellung über kubectl**
1. **Erstellen Sie eine YAML-Datei** für Ihren Kubernetes-Cluster
2. **Passen Sie die Konfiguration** an Ihre Bedürfnisse an
3. **Stellen Sie mit kubectl bereit**:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: kube
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride: {}
    fluxcd:
      enabled: false
      valuesOverride: {}
    ingressNginx:
      enabled: true
      hosts:
      - mon-app.example.com
      valuesOverride: {}
    monitoringAgents:
      enabled: false
      valuesOverride: {}
    verticalPodAutoscaler:
      valuesOverride: {}
  controlPlane:
    replicas: 3
  host: k8s-api.example.com
  kamajiControlPlane:
    addons:
      konnectivity:
        server:
          resources: {}
          resourcesPreset: small
    apiServer:
      resources: {}
      resourcesPreset: small
    controllerManager:
      resources: {}
      resourcesPreset: small
    scheduler:
      resources: {}
      resourcesPreset: small
  nodeGroups:
    md0:
      ephemeralStorage: 30Gi
      instanceType: u1.large
      maxReplicas: 6
      minReplicas: 3
      roles:
      - ingress-nginx
  storageClass: replicated
```

4. **Stellen Sie den Cluster bereit**:
   ```bash
   # Konfiguration in einer Datei speichern
   kubectl apply -f my-kubernetes-cluster.yaml
   ```

### **⏳ Bereitstellung verfolgen**
- Der Cluster ist in **1-3 Minuten** bereit
- Verfolgen Sie den Status mit kubectl:
  ```bash
  kubectl get kubernetes
  kubectl describe kubernetes kube
  ```
- Status "Ready" = Cluster betriebsbereit ✅

---

## DNS-Konfiguration

### **Erforderliche DNS-Einträge**

Damit Ihr Cluster erreichbar ist, müssen Sie die folgenden DNS-Einträge bei Ihrem DNS-Anbieter erstellen:

```bash
# Öffentliche IP Ihres Clusters über die Ingress-Ressourcen abrufen
kubectl get ingress
```

**Erwartetes Ergebnis:**

```console
NAME                            CLASS           HOSTS                 ADDRESS        PORTS   AGE
kubernetes-kube                 tenant-myco     k8s-api.example.com   91.x.x.x      80      2m
kubernetes-kube-ingress-nginx   tenant-myco     mon-app.example.com   91.x.x.x      80      2m
```

Erstellen Sie die DNS-Einträge bei Ihrem Anbieter:

```
Type A : k8s-api.example.com → <ADDRESS>
Type A : mon-app.example.com → <ADDRESS>
```

:::tip DNS-Konfiguration
- **k8s-api.example.com**: Zugangspunkt zur Kubernetes-API
- **mon-app.example.com**: Domain für Ihre Anwendungen über Ingress
- Ersetzen Sie `example.com` durch Ihre tatsächliche DNS-Zone
:::

---

## Schritt 3: Kubeconfig abrufen

### **Kubeconfig des Clusters extrahieren**
Sobald Ihr Cluster bereitgestellt und bereit ist, rufen Sie die Zugangsdaten mit diesem Befehl ab:

```bash
# Kubeconfig des erstellten Clusters abrufen (Clusternamen anpassen)
kubectl get secret kubernetes-<clusterName>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf

# Konkretes Beispiel mit dem Cluster "kube":
kubectl get secret kubernetes-kube-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "admin.conf" | base64decode) }}' > admin.conf
```

:::info Anzupassende Variable
- `<clusterName>`: Ersetzen Sie durch den Namen Ihres Clusters (z.B. `kube` gemäss dem YAML-Manifest)
:::

### **Lokale Konfiguration**
```bash
# Kubeconfig des neuen Clusters verwenden
export KUBECONFIG=./admin.conf

# Verbindung zum erstellten Cluster überprüfen
kubectl get nodes
```

:::note
Dieser Befehl funktioniert erst, nachdem die DNS-Einträge konfiguriert wurden (vorheriger Abschnitt). Die Worker-Knoten können einige zusätzliche Minuten benötigen, um zu erscheinen.
:::

:::success Herzlichen Glückwunsch!
Ihr Kubernetes-Cluster ist jetzt betriebsbereit mit **nativer Hochverfügbarkeit**!
:::

---

## Zusammenfassung

Sie haben erstellt:

- Einen **hochverfügbaren Kubernetes-Cluster**
- Eine **vollständig gesicherte Umgebung** (Netzwerkisolation)
- Einen **resilienten Speicher** (automatische Replikation)
---

## Brauchen Sie Hilfe?

### **Dokumentation**
- **[FAQ](../resources/faq.md)** → Antworten auf häufige Fragen
- **[Troubleshooting](../resources/troubleshooting.md)** → Problemlösungen

### **Support**
- **E-Mail:** support@hidora.io
- **Dokumentation:** Diese Plattform
- **Community:** Foren und Echtzeit-Chat

:::tip Bravo! 🎊
Sie haben Ihre ersten Schritte auf Hikube gemacht. Ihre Infrastruktur ist jetzt bereit, all Ihre ambitioniertesten Projekte aufzunehmen!
:::

---

**Empfohlener nächster Schritt:** [📖 Schlüsselkonzepte](./concepts.md) → Beherrschen Sie die Grundlagen von Hikube
