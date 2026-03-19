---
sidebar_position: 1
title: Übersicht
---

<!--- Vorstellung des verwalteten Kubernetes auf Hikube
- Schéma architecture (parlé de la réplication, des controls plane, workers, infra, addons, versionning k8s)
- Composition des différents éléments de configuration du k8s géré
- Explication du fonctionnement :
  - control plane
  - worker/nodeGroup
    - Exemple
  - storageclass
  - versionning
  - addons-->

# Vorstellung des verwalteten Kubernetes auf Hikube

Hikube bietet einen **verwalteten Kubernetes-Service**, der für eine hochverfügbare, sichere und leistungsstarke Infrastruktur konzipiert ist.
Die Steuerungsebene wird vollständig von der Plattform verwaltet, während die **Worker-Knoten** in Ihrem Tenant als virtuelle Maschinen bereitgestellt werden.

---

## 🏗️ Architekturschema

### **Übersicht**

Die Kubernetes-Cluster von Hikube basieren auf einer **Multi-Rechenzentrum-Infrastruktur** (3 Schweizer Standorte), die Replikation, Fehlertoleranz und Dienstkontinuität gewährleistet.

- **Steuerungsebene (Control Plane)**: gehostet und betrieben von Hikube
  Bestehend aus:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Worker-Knoten**: Virtuelle Maschinen in Ihrem Tenant
- **Netzwerk**: CNI mit Unterstützung für `LoadBalancer`, `Ingress` und Netzwerkrichtlinien (`NetworkPolicy`)
- **Speicher**: Persistente Volumes repliziert über die 3 Rechenzentren
- **Add-ons**: Integration von cert-manager, FluxCD, Monitoring usw.
- **Kubernetes-Versionierung**: Multi-Versions-Unterstützung mit progressiven Updates

---

## ⚙️ Zusammensetzung und Konfiguration des Clusters

Die Cluster sind vollständig deklarativ und über API oder YAML-Manifest konfigurierbar.
Die wichtigsten Konfigurationselemente umfassen:

| Element | Beschreibung |
|----------|--------------|
| **nodeGroups** | Homogene Knotengruppen (Größe, Rolle, GPU usw.) |
| **storageClass** | Definiert den Persistenztyp und die Replikation |
| **addons** | Satz optionaler aktivierbarer Funktionen |
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

Die **NodeGroups** ermöglichen die Anpassung der Ressourcen an Ihre Bedürfnisse. Jede Gruppe kann mit einem Instanztyp, Rollen und automatischer Skalierung konfiguriert werden.

#### NodeGroup-Beispiel

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
- **GPU-Unterstützung**: Dynamische Anbindung von NVIDIA-GPUs
- **Instanztypen**: `S1` (Standard), `U1` (Universal), `M1` (Memory-optimiert)

---

## 💾 Persistenter Speicher

### **Speicherklasse: `replicated`**

- Automatische Replikation über die **3 Schweizer Rechenzentren**
- Dynamische Bereitstellung persistenter Volumes (PVC)
- Fehlertoleranz und native Hochverfügbarkeit

Verwendungsbeispiel:

```yaml
storageClassName: replicated
resources:
  requests:
    storage: 20Gi
```

---

## 🔢 Kubernetes-Versionierung

- Cluster können mit einer **bestimmten Kubernetes-Version** erstellt werden
- Hikube gewährleistet kontrollierte Minor- und Patch-Updates
- Der Kunde behält die Möglichkeit, Major-Upgrades zu planen

Beispiel:

```yaml
version: "1.30.3"
```

---

## 🧩 Integrierte Add-ons

### **Cert-Manager**

- Automatisierte Verwaltung von SSL/TLS-Zertifikaten
- Unterstützung für Let's Encrypt und private Zertifizierungsstellen
- Automatische Erneuerung

### **Ingress NGINX**

- Integrierter Ingress-Controller
- Unterstützung für Wildcard, SNI und Prometheus-Metriken

### **Flux CD (GitOps)**

- Kontinuierliche Synchronisation mit Ihren Git-Repositories
- Automatisiertes Deployment und Rollback

### **Monitoring-Stack**

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

- **[Konzepte und Architektur](./concepts.md)** → Verstehen, wie ein Hikube-Kubernetes-Cluster bereitgestellt wird
- **[Schnellstart](./quick-start.md)** → Erstellen Sie Ihren ersten Hikube-Cluster
- **[API-Referenz](./api-reference.md)** → Vollständige Konfigurationsdokumentation

---

## 💡 Wichtige Punkte

- **Verwaltete Steuerungsebene**: Keine Master-Wartung erforderlich
- **Knoten in Ihrem Tenant**: Vollständige Kontrolle über die Worker
- **Automatische Skalierung**: Dynamische Anpassung nach Last
- **Multi-Rechenzentrum**: Native Hochverfügbarkeit und Replikation
- **Vollständige Kompatibilität**: Standard-Kubernetes-API unterstützt
