---
sidebar_position: 1
title: Übersicht
---

<!--- Vorstellung des Managed Kubernetes auf Hikube
- Architekturschema (Replikation, Control Planes, Workers, Infrastruktur, Addons, K8s-Versionierung)
- Zusammensetzung der verschiedenen Konfigurationselemente des verwalteten K8s
- Funktionsweise:
  - Control Plane
  - Worker/nodeGroup
    - Beispiel
  - StorageClass
  - Versionierung
  - Addons-->

# Vorstellung des Managed Kubernetes auf Hikube

Hikube bietet einen **Managed-Kubernetes-Service**, der auf eine hochverfügbare, sichere und leistungsfähige Infrastruktur ausgelegt ist.
Die Steuerungsebene wird vollständig von der Plattform verwaltet, während die **Worker-Knoten** als virtuelle Maschinen in Ihrem Tenant bereitgestellt werden.

---

## 🏗️ Architekturschema

### **Übersicht**

Die Kubernetes-Cluster von Hikube basieren auf einer **Multi-Datacenter-Infrastruktur** (3 Schweizer Standorte), die Replikation, Fehlertoleranz und Dienstkontinuität gewährleistet.

- **Steuerungsebene (Control Plane)**: gehostet und betrieben von Hikube
  Bestehend aus:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Worker-Knoten**: virtuelle Maschinen in Ihrem Tenant
- **Netzwerk**: CNI mit Unterstützung für `LoadBalancer`, `Ingress` und Netzwerkrichtlinien (`NetworkPolicy`)
- **Speicher**: persistente Volumes, repliziert über die 3 Rechenzentren
- **Add-ons**: Integration von cert-manager, FluxCD, Monitoring usw.
- **Kubernetes-Versionierung**: Multi-Versions-Unterstützung mit schrittweisen Updates

---

## ⚙️ Zusammensetzung und Konfiguration des Clusters

Die Cluster sind vollständig deklarativ und über API oder YAML-Manifest konfigurierbar.
Die wichtigsten Konfigurationselemente umfassen:

| Element | Beschreibung |
|----------|--------------|
| **nodeGroups** | Homogene Knotengruppen (Größe, Rolle, GPU usw.) |
| **storageClass** | Definiert den Persistenz-Typ und die Replikation |
| **addons** | Sammlung optionaler aktivierbarer Funktionen |
| **version** | Verwendete Kubernetes-Server-Version |
| **network** | Verwaltung von CNI, LoadBalancer und Ingress |

---

## ⚙️ Detaillierte Funktionsweise

### 🧠 **Control Plane**

- Von Hikube verwaltet, keine clientseitige Wartung erforderlich
- Kritische Komponenten über mehrere Standorte repliziert
- Verwaltung der Hochverfügbarkeit, des Monitorings und automatischer Updates
- Zugriff über die Standard-Kubernetes-API (`kubectl`, Client SDK usw.)

### 🧩 **Worker Nodes / NodeGroups**

Die **NodeGroups** ermöglichen es, die Ressourcen an Ihre Bedürfnisse anzupassen. Jede Gruppe kann mit einem Instanztyp, Rollen und automatischer Skalierung konfiguriert werden.

#### Beispiel eines NodeGroup

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

#### Hauptmerkmale

- **Autoscaling**: Parameter `minReplicas` und `maxReplicas`
- **GPU-Unterstützung**: dynamische Anbindung von NVIDIA-GPUs
- **Instanztypen**: `S1` (Standard), `U1` (Universal), `M1` (speicheroptimiert)

---

## 💾 Persistenter Speicher

### **Speicherklasse: `replicated`**

- Automatische Replikation über die **3 Schweizer Rechenzentren**
- Dynamische Bereitstellung persistenter Volumes (PVC)
- Fehlertoleranz und native Hochverfügbarkeit

Anwendungsbeispiel:

```yaml
storageClassName: replicated
resources:
  requests:
    storage: 20Gi
```

---

## 🔢 Kubernetes-Versionierung

- Cluster können mit einer **bestimmten Kubernetes-Version** erstellt werden
- Hikube führt Minor- und Patch-Updates kontrolliert durch
- Der Kunde behält die Möglichkeit, Major-Upgrades zu planen

Beispiel:

```yaml
version: "1.30.3"
```

---

## 🧩 Integrierte Add-ons

### **Cert-Manager**

- Automatisierte Verwaltung von SSL/TLS-Zertifikaten
- Unterstützung von Let's Encrypt und privaten Zertifizierungsstellen
- Automatische Erneuerung

### **Ingress NGINX**

- Integrierter Ingress-Controller
- Unterstützung von Wildcard, SNI und Prometheus-Metriken

### **Flux CD (GitOps)**

- Kontinuierliche Synchronisierung mit Ihren Git-Repositories
- Automatisierte Bereitstellung und Rollback

### **Monitoring Stack**

- **Node Exporter**, **FluentBit**, **Kube-State-Metrics**
- Vollständige Integration mit Grafana und Prometheus des Tenants

---

## 🚀 Anwendungsbeispiele

### **Webanwendungen**

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

### **ML/AI-Workloads**

```yaml
nodeGroups:
  ml:
    minReplicas: 1
    maxReplicas: 5
    instanceType: "u1.xlarge"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"
```

### **Kritische Anwendungen**

```yaml
nodeGroups:
  production:
    minReplicas: 3
    maxReplicas: 20
    instanceType: "m1.large"
```

---

## 📚 Ressourcen

- **[Konzepte und Architektur](./concepts.md)** → Verstehen, wie ein Kubernetes-Cluster bei Hikube bereitgestellt wird
- **[Schnellstart](./quick-start.md)** → Erstellen Sie Ihren ersten Hikube-Cluster
- **[API-Referenz](./api-reference.md)** → Vollständige Konfigurationsdokumentation

---

## 💡 Kernpunkte

- **Verwaltete Steuerungsebene**: keine Wartung der Master erforderlich
- **Knoten in Ihrem Tenant**: volle Kontrolle über die Worker
- **Automatische Skalierung**: dynamische Anpassung je nach Last
- **Multi-Datacenter**: native Hochverfügbarkeit und Replikation
- **Vollständige Kompatibilität**: Standard-Kubernetes-API unterstützt
