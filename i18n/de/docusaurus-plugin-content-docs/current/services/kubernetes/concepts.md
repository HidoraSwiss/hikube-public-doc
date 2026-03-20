---
sidebar_position: 2
title: Konzepte
---

# Konzepte — Kubernetes

## Architektur

Das folgende Schema veranschaulicht die Struktur und die wichtigsten Interaktionen des **Kubernetes-Clusters von Hikube**, einschließlich der Hochverfügbarkeit der Steuerungsebene, der Knotenverwaltung, der Datenpersistenz und der regionsübergreifenden Replikation.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Helles Logo"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Dunkles Logo"/>
</div>

---

### Hauptkomponenten des Clusters

#### Etcd-Cluster

- Enthält mehrere untereinander replizierte **etcd**-Instanzen.
- Gewährleistet die **Konsistenz der Zustandsspeicherung des Kubernetes-Clusters** (Informationen zu Pods, Services, Konfigurationen usw.).
- Die interne Replikation zwischen den `etcd`-Knoten garantiert die **Fehlertoleranz**.

#### Control Plane

- Bestehend aus dem API Server, dem Scheduler und dem Controller Manager.
- Aufgabe:
  - **Plant die Workloads** (Pods, Deployments usw.) auf den verfügbaren Knoten.
  - **Interagiert mit etcd**, um den Clusterzustand zu lesen/schreiben.

#### Node Groups

- Jede Gruppe enthält mehrere **Worker-Knoten (Worker Nodes)**.
- Die Workloads (Pods) werden auf diesen Knoten bereitgestellt.
- Die Knoten kommunizieren mit dem Control Plane, um ihre Aufgaben zu empfangen.
- Sie lesen und schreiben ihre Daten in den **Persistent Volumes (PV)** von Kubernetes.

#### Kubernetes PV Data

- Repräsentiert den **persistenten Speicher**, der von den Pods genutzt wird.
- Die Daten der Workloads werden **in diesen Speicher geschrieben und daraus gelesen**.
- Diese Schicht ist in die Hikube-Replikation integriert, um die Datenverfügbarkeit zu gewährleisten.

---

### Hikube-Replikationsschicht

#### Hikube Replication Data Layer

- Dient als Schnittstelle zwischen Kubernetes und den **regionalen Speichersystemen**.
- Repliziert automatisch die PV-Daten in mehrere Regionen für:
  - **Hochverfügbarkeit**,
  - **Resilienz bei regionalen Ausfällen**,
  - und **Dienstkontinuität**.

#### Regionale Speicher

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Jede Region verfügt über ein eigenes Speicher-Backend, die alle über die Hikube-Schicht synchronisiert werden.

---

### Kommunikationsflüsse

1. Die **etcd-Knoten** synchronisieren sich untereinander, um einen konsistenten globalen Zustand aufrechtzuerhalten.
2. Das **Control Plane** liest/schreibt in etcd, um den Clusterzustand zu speichern.
3. Das **Control Plane** plant die Workloads auf den **Node Groups**.
4. Die **Node Groups** interagieren mit den **Kubernetes-PVs**, um Daten zu speichern oder abzurufen.
5. Die **PV-Daten** werden über den **Hikube Replication Data Layer** in die **3 Regionen** repliziert.

---

### Funktionale Zusammenfassung

| Schicht | Hauptfunktion | Technologie |
|--------|---------------------|-------------|
| Etcd-Cluster | Speicherung des Clusterzustands | etcd |
| Control Plane | Verwaltung und Planung der Workloads | Kubernetes |
| Node Groups | Ausführung der Workloads | kubelet, Container Runtime |
| PV Data | Persistenter Speicher | Kubernetes Persistent Volumes |
| Hikube Data Layer | Multi-Regions-Replikation und -Synchronisation | Hikube |
| Data Storage | Regionaler physischer Speicher | Geneva / Gland / Lucerne |

---

### Globales Ziel

Diese Architektur gewährleistet:

- **Hochverfügbarkeit** des Kubernetes-Clusters.
- **Geografische Resilienz** durch regionsübergreifende Replikation.
- **Datenintegrität** über etcd und den persistenten Speicher.
- **Horizontale Skalierbarkeit** mit den Node Groups.

---

## Control Plane

Das Feld `controlPlane` definiert die Konfiguration der Steuerungsebene des verwalteten Kubernetes-Clusters.
Es legt die zugewiesenen Ressourcen für jede Schlüsselkomponente (API Server, Scheduler, Controller Manager, Konnectivity) sowie die Anzahl der Replikas für die Hochverfügbarkeit fest.

```yaml title="control-plane.yaml"
controlPlane:
  apiServer:
    resources:
      cpu: 2
      memory: 4Gi
    resourcesPreset: small
  controllerManager:
    resources:
      cpu: 2
      memory: 2Gi
    resourcesPreset: small
  konnectivity:
    server:
      resources:
        cpu: 1
        memory: 1Gi
      resourcesPreset: nano
  scheduler:
    resources:
      cpu: 1
      memory: 512Mi
    resourcesPreset: micro
  replicas: 3
```

---

### `apiServer` (Object)

Der `apiServer` ist die zentrale Komponente der Kubernetes-Steuerungsebene.
Er verarbeitet alle Anfragen an die Kubernetes-API und stellt die Kommunikation zwischen den internen Clusterkomponenten sicher.

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `resources` | Object | Ja | Definiert die dem API Server zugewiesenen CPU- und Speicherressourcen |
| `resources.cpu` | string | Nein | Anzahl der zugewiesenen vCPUs (z.B.: `2`) |
| `resources.memory` | string | Nein | Zugewiesene Speichermenge (z.B.: `4Gi`) |
| `resourcesPreset` | string | Ja | Vordefiniertes Ressourcenprofil (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) |

### `controllerManager` (Object)

Der `controllerManager` führt die **Kontrollschleifen** von Kubernetes (Reconciliation Loops) aus.
Er stellt die Erstellung, Aktualisierung und Löschung von Ressourcen (Pods, Services usw.) gemäß dem gewünschten Clusterzustand sicher.

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `resources` | Object | Ja | Legt die CPU-/Speicherressourcen für den Controller Manager fest |
| `resources.cpu` | string | Nein | Anzahl der reservierten vCPUs |
| `resources.memory` | string | Nein | Zugewiesene Speichermenge |
| `resourcesPreset` | string | Ja | Vordefinierte Größe (`nano`, `micro`, `small`, `medium` usw.) |

### `konnectivity` (Object)

Der **Konnectivity**-Dienst verwaltet die sichere Kommunikation zwischen der Steuerungsebene und den Knoten (Agents).
Er ersetzt den ehemaligen `kube-proxy` für ausgehende Verbindungen der Knoten und optimiert die Netzwerkkonnektivität.

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `server.resources` | Object | Ja | Legt die CPU-/Speicherressourcen des Konnectivity-Servers fest |
| `server.resources.cpu` | string | Nein | Anzahl der vCPUs |
| `server.resources.memory` | string | Nein | Speichermenge |
| `server.resourcesPreset` | string | Ja | Vordefiniertes Profil (`nano`, `micro`, `small`, `medium` usw.) |

### `scheduler` (Object)

Der `scheduler` bestimmt, auf welchem Knoten jeder Pod ausgeführt werden soll, basierend auf Ressourcenbeschränkungen, Affinitäten und Topologien.

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `resources` | Object | Ja | Definiert die dem Scheduler zugewiesenen Ressourcen |
| `resources.cpu` | string | Nein | Anzahl der vCPUs |
| `resources.memory` | string | Nein | Speichermenge |
| `resourcesPreset` | string | Ja | Vordefinierte Größe (`nano`, `micro`, `small`, `medium` usw.) |

### `replicas` (integer)

Das Feld `replicas` definiert die **Anzahl der Instanzen der Steuerungsebene**.
Eine ungerade Anzahl von Replikas (üblicherweise `3`) wird empfohlen, um die Hochverfügbarkeit und das Quorum in `etcd` zu gewährleisten.

---

### Typen von resourcesPreset

```yaml
resourcesPreset: "nano"     # 0.1 CPU, 128 MiB RAM
resourcesPreset: "micro"    # 0.25 CPU, 256 MiB RAM
resourcesPreset: "small"    # 0.5 CPU, 512 MiB RAM
resourcesPreset: "medium"   # 0.5 CPU, 1 GiB RAM
resourcesPreset: "large"    # 1 CPU, 2 GiB RAM
resourcesPreset: "xlarge"   # 2 CPU, 4 GiB RAM
resourcesPreset: "2xlarge"  # 4 CPU, 8 GiB RAM
```

:::tip Best Practices für das Control Plane
- Setzen Sie immer `replicas: 3` für Redundanz.
- Verwenden Sie konsistente `resourcesPreset` zwischen den Komponenten.
- Passen Sie die Ressourcen je nach Last an (Produktionscluster → `medium` oder `large`).
- Dimensionieren Sie den `apiServer` nicht zu gering, er ist die am stärksten beanspruchte Komponente.
:::

---

## Node Groups

Das Feld `nodeGroup` definiert die Konfiguration einer Knotengruppe (Workers) innerhalb des Kubernetes-Clusters.
Es ermöglicht die Angabe des Instanztyps, der Ressourcen, der Anzahl der Replikas sowie der zugehörigen Rollen und GPUs.

```yaml title="node-group.yaml"
nodeGroup:
  <name>:
    ephemeralStorage:
      size: 100Gi
    gpus:
      - name: nvidia.com/AD102GL_L40S
    instanceType: m5.large
    maxReplicas: 5
    minReplicas: 2
    resources:
      cpu: 4
      memory: 16Gi
    roles:
      - ingress-nginx
```

---

### `ephemeralStorage` (Object)

Definiert die Konfiguration des **ephemeren Speichers**, der den Knoten der Gruppe zugeordnet ist.
Dieser Speicher wird für temporäre Daten, Caches oder Logdateien verwendet.

### `gpus` (Array)

Listet die auf den Knoten der Gruppe verfügbaren **GPUs** auf, die für rechenintensive Workloads (KI, ML usw.) verwendet werden.

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `name` | string | Ja | Name der GPU oder Kartentyp (`nvidia.com/AD102GL_L40S` oder `nvidia.com/GA100_A100_PCIE_80GB`) |

### `instanceType` (string)

Gibt den **Instanztyp** an, der für die Knoten verwendet wird.

#### Serie S (Standard) — Verhältnis 1:2

Optimiert für allgemeine Workloads mit geteilter und burstfähiger CPU.

```yaml
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

#### Serie U (Universal) — Verhältnis 1:4

Optimiert für ausgewogene Workloads mit mehr Speicher.

```yaml
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

#### Serie M (Memory Optimized) — Verhältnis 1:8

Optimiert für Anwendungen mit hohem Speicherbedarf.

```yaml
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

### `maxReplicas` / `minReplicas` (integer)

- `maxReplicas`: **maximale** Anzahl von Knoten, die bereitgestellt werden können (begrenzt das Autoscaling).
- `minReplicas`: **minimale** Anzahl garantierter Knoten in dieser Gruppe.

### `resources` (Object)

Definiert die jedem Knoten der Gruppe **zugewiesenen Ressourcen** (CPU und Speicher).

| Feld | Typ | Erforderlich | Beschreibung |
|-------|------|-------------|--------------|
| `cpu` | string | Nein | Anzahl der pro Knoten zugewiesenen vCPUs (z.B.: `4`) |
| `memory` | string | Nein | Zugewiesene Speichermenge pro Knoten (z.B.: `16Gi`) |

### `roles` (Array)

Listet die den Knoten der Gruppe zugewiesenen **Rollen** auf (z.B.: `ingress-nginx`).

---

### Beispiele für Node Groups

#### Allgemeine Node Group

```yaml title="node-group-general.yaml"
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

#### Rechenintensive Node Group

```yaml title="node-group-compute.yaml"
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

#### Speicheroptimierte Node Group

```yaml title="node-group-memory.yaml"
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU statt 4
      memory: "48Gi" # Override: 48 GB statt 32
```

:::tip Best Practices für Node Groups
- Passen Sie `minReplicas` und `maxReplicas` an die Skalierungsanforderungen an.
- Verwenden Sie `instanceType` passend zur Arbeitslast.
- Definieren Sie ausreichend ephemeren Speicher für temporäre Lasten (Logs, Caches).
- Legen Sie die Rollen klar fest, um die Funktionen der Knoten zu segmentieren (z.B.: Trennung `worker` / `ingress`).
:::
