---
sidebar_position: 1
title: Überblick
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Verwaltetes Kubernetes auf Hikube im Überblick

Hikube bietet einen **verwalteten Kubernetes**-Service, der eine hochverfügbare, sichere und leistungsfähige Infrastruktur bereitstellt.
Die Control Plane wird vollständig von der Plattform verwaltet, während die **Worker-Nodes** in Ihrem Projekt als virtuelle Maschinen bereitgestellt werden.

Die Cluster werden über die [Hikube-Konsole](https://console.hikube.cloud) im Menü **Infrastructure** > **Kubernetes** erstellt, geändert und gelöscht. Sobald der Cluster bereit ist, laden Sie seine kubeconfig aus der Konsole herunter und arbeiten im Cluster mit Ihren gewohnten Werkzeugen (`kubectl`, `helm`, SDK-Client usw.).

---

## Architektur

Die Kubernetes-Cluster von Hikube basieren auf einer **Multi-Datacenter-Infrastruktur** (3 Schweizer Standorte), die Replikation, Ausfalltoleranz und Betriebskontinuität gewährleistet.

- **Control Plane**: von Hikube gehostet und betrieben. Sie besteht aus:
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Worker-Nodes**: virtuelle Maschinen in Ihrem Projekt, in Node-Gruppen organisiert
- **Netzwerk**: CNI Cilium, Unterstützung für Services vom Typ `LoadBalancer`, `Ingress` und `NetworkPolicy`
- **Speicher**: persistente Volumes, repliziert über die 3 Rechenzentren
- **Addons**: Cert-Manager, Ingress NGINX, Flux CD, Monitoring-Agents, Velero, GPU Operator usw.
- **Kubernetes-Versionen**: Sie wählen die Version unter den von der Plattform angebotenen

---

## Was Sie in der Konsole konfigurieren

Der Assistent **Create cluster** gliedert die Konfiguration in vier Schritte:

| Schritt | Was Sie festlegen |
|---------|-------------------|
| **General** | Name des Clusters, Kubernetes-Version, API-Endpoint (optional), Größe und Anzahl der Instanzen der Control Plane |
| **Nodes** | Eine oder mehrere Node-Gruppen: Name, Instanztyp, ephemerer Speicher, minimale und maximale Anzahl der Nodes, Erreichbarkeit aus dem Internet, GPU |
| **Addons** | Aktivierung der Addons des Clusters und optionales Überschreiben ihrer Helm-Werte |
| **Summary** | Zusammenfassung vor der Bereitstellung |

Die einzelnen Felder sind in den [Konzepten](./concepts.md) und im [Schnellstart](./quick-start.md) beschrieben.

---

## Funktionsweise im Detail

### Control Plane

- Von Hikube verwaltet, ohne dass Sie Wartung übernehmen müssen
- Dimensioniert über ein Preset (**Control Plane Instance Size**) und eine Anzahl von Instanzen (**Control Plane High Availability**: 1, 3 oder 5)
- Zugriff über die Standard-Kubernetes-API (`kubectl`, SDK-Client usw.) mit der aus der Konsole heruntergeladenen kubeconfig

### Node-Gruppen

Mit **Node-Gruppen** passen Sie die Ressourcen an Ihre Workloads an. Jede Gruppe hat ihren eigenen Instanztyp und eigene Autoscaling-Grenzen.

- **Autoscaling**: minimale und maximale Anzahl der Nodes pro Gruppe
- **GPU-Unterstützung**: Anbindung von NVIDIA-GPUs an die Nodes einer Gruppe, ausgewählt im Assistenten
- **Instanztypen**: Serien Standard (S), Universal (U) und Memory (M)

---

## Persistenter Speicher

Die im Cluster erstellten persistenten Volumes (PVC) verwenden die Speicherklasse **`replicated`**:

- Automatische Replikation über die **3 Schweizer Rechenzentren**
- Dynamisches Provisioning der persistenten Volumes
- Ausfalltoleranz und native Hochverfügbarkeit

Beispiel für ein PVC, das Sie in Ihrem Cluster bereitstellen:

```yaml title="pvc.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated
  resources:
    requests:
      storage: 20Gi
```

---

## Kubernetes-Versionen

- Die Version wird bei der Erstellung des Clusters unter den von der Plattform angebotenen gewählt (die neueste ist vorausgewählt)
- Das Update erfolgt über die Bearbeitungsseite des Clusters (siehe [Einen Cluster aktualisieren](./how-to/upgrade-cluster.md))

---

## Integrierte Addons

### Cert-Manager

- Automatisierte Verwaltung von SSL/TLS-Zertifikaten
- Unterstützung für Let's Encrypt und private Zertifizierungsstellen
- Automatische Erneuerung

### Ingress NGINX

- Integrierter Ingress-Controller, bereitgestellt über einen Service vom Typ `LoadBalancer`
- Auf den aus dem Internet erreichbaren Node-Gruppen bereitgestellt

### Flux CD (GitOps)

- Kontinuierliche Synchronisation mit Ihren Git-Repositories
- Automatisierte Bereitstellung und Rollback

### Monitoring Agents

- Erfassung der Metriken und Logs des Clusters (VictoriaMetrics Agent, Fluent Bit, kube-state-metrics, node exporter)

Die vollständige Liste finden Sie im Abschnitt [Plugins](./plugins/cilium.md).

---

## Beispiele für Anwendungsfälle

| Anwendungsfall | Empfohlene Node-Gruppe |
|----------------|------------------------|
| **Webanwendungen** | Serie Standard (S), 2 bis 10 Nodes, aus dem Internet erreichbare Gruppe für den Ingress |
| **ML/KI-Workloads** | Serie Universal (U) mit GPU, Addon GPU Operator aktiviert |
| **Kritische Anwendungen** | Mindestens 3 Nodes, hochverfügbare Control Plane (3 Instanzen) |

---

## Ressourcen

- **[Konzepte und Architektur](./concepts.md)**: verstehen, wie ein Hikube-Kubernetes-Cluster bereitgestellt wird
- **[Schnellstart](./quick-start.md)**: Ihren ersten Cluster über die Konsole erstellen

---

## Kernpunkte

- **Verwaltete Control Plane**: keine Wartung der Master erforderlich
- **Nodes in Ihrem Projekt**: volle Kontrolle über die Worker
- **Autoscaling**: dynamische Anpassung an die Last
- **Multi-Datacenter**: native Hochverfügbarkeit und Replikation
- **Volle Kompatibilität**: Standard-Kubernetes-API

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
/>
