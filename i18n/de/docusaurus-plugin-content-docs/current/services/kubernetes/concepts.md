---
sidebar_position: 2
title: Konzepte
---

# Konzepte — Kubernetes

## Terminologie

| Begriff | Definition |
|---------|------------|
| **Projekt** | Isolierter Bereich Ihrer Organisation mit Quotas (CPU, Arbeitsspeicher, Speicher), in dem der Cluster und seine Nodes erstellt werden. Früher „Tenant“ genannt. |
| **Cluster** | Verwalteter Kubernetes-Cluster: eine von Hikube betriebene Control Plane und eine oder mehrere Node-Gruppen. |
| **Control Plane** | Komponenten, die den Cluster steuern (API Server, Scheduler, Controller Manager, etcd), von Hikube gehostet. |
| **Node-Gruppe** | Gruppe homogener Worker-Nodes (gleicher Instanztyp, gleicher Speicher) mit eigenen Autoscaling-Grenzen. Die Detailseite des Clusters zeigt sie unter **Node Pools** an. |
| **Addon** | Optionale Komponente, die von der Plattform im Cluster installiert und gewartet wird (Cert-Manager, Ingress NGINX usw.). |
| **Kubeconfig** | Zugriffsdatei für den Cluster, die über die Detailseite des Clusters in der Konsole heruntergeladen wird. |

## Architektur

Das folgende Schema veranschaulicht die Struktur und die wichtigsten Interaktionen des **Hikube-Kubernetes-Clusters**, einschließlich der Hochverfügbarkeit der Control Plane, der Verwaltung der Nodes, der Datenpersistenz und der regionenübergreifenden Replikation.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Architekturdiagramm eines Hikube-Kubernetes-Clusters"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Architekturdiagramm eines Hikube-Kubernetes-Clusters"/>
</div>

---

### Hauptkomponenten des Clusters

#### Etcd Cluster

- Enthält mehrere untereinander replizierte **etcd**-Instanzen.
- Gewährleistet die **Konsistenz der Zustandsspeicherung des Kubernetes-Clusters** (Informationen zu Pods, Services, Konfigurationen usw.).
- Die interne Replikation zwischen den `etcd`-Nodes garantiert die **Ausfalltoleranz**.

#### Control Plane

- Besteht aus API Server, Scheduler und Controller Manager.
- Aufgabe:
  - **Plant die Workloads** (Pods, Deployments usw.) auf den verfügbaren Nodes ein.
  - **Interagiert mit etcd**, um den Zustand des Clusters zu lesen und zu schreiben.

#### Node Groups

- Jede Gruppe enthält mehrere **Worker-Nodes**.
- Die Workloads (Pods) werden auf diesen Nodes bereitgestellt.
- Die Nodes kommunizieren mit der Control Plane, um ihre Aufgaben zu erhalten.
- Sie lesen und schreiben ihre Daten in die Kubernetes-**Persistent Volumes (PV)**.

#### Kubernetes PV Data

- Stellt den von den Pods verwendeten **persistenten Speicher** dar.
- Die Daten der Workloads werden **in diesen Speicher geschrieben und daraus gelesen**.
- Diese Schicht ist in die Hikube-Replikation integriert, um die Verfügbarkeit der Daten zu gewährleisten.

---

### Hikube-Replikationsschicht

#### Hikube Replication Data Layer

- Dient als Schnittstelle zwischen Kubernetes und den **regionalen Speichersystemen**.
- Repliziert die Daten der PVs automatisch in mehrere Regionen für:
  - **Hochverfügbarkeit**,
  - **Resilienz gegenüber regionalen Ausfällen**,
  - und **Betriebskontinuität**.

#### Regionale Speicher

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Jede Region verfügt über ein eigenes Speicher-Backend, alle über die Hikube-Schicht synchronisiert.

---

### Kommunikationsfluss

1. Die **etcd-Nodes** synchronisieren sich untereinander, um einen konsistenten globalen Zustand zu erhalten.
2. Die **Control Plane** liest und schreibt in etcd, um den Zustand des Clusters zu speichern.
3. Die **Control Plane** plant die Workloads auf den **Node Groups** ein.
4. Die **Node Groups** interagieren mit den **Kubernetes-PVs**, um Daten zu speichern oder abzurufen.
5. Die **PV Data** werden über die **Hikube Replication Data Layer** in die **3 Regionen** repliziert.

---

### Funktionale Zusammenfassung

| Schicht | Hauptfunktion | Technologie |
|---------|---------------|-------------|
| Etcd Cluster | Speicherung des Cluster-Zustands | etcd |
| Control Plane | Verwaltung und Einplanung der Workloads | Kubernetes |
| Node Groups | Ausführung der Workloads | kubelet, container runtime |
| PV Data | Persistenter Speicher | Kubernetes Persistent Volumes |
| Hikube Data Layer | Replikation und Synchronisation über mehrere Regionen | Hikube |
| Data Storage | Physischer regionaler Speicher | Geneva / Gland / Lucerne |

---

### Gesamtziel

Diese Architektur gewährleistet:

- **Hochverfügbarkeit** des Kubernetes-Clusters.
- **Geografische Resilienz** dank regionenübergreifender Replikation.
- **Datenintegrität** über etcd und den persistenten Speicher.
- Horizontale **Skalierbarkeit** mit den Node Groups.

---


## Control Plane

Die Control Plane wird im Schritt **General** des Erstellungsassistenten mit zwei Feldern dimensioniert.

### Control Plane Instance Size

Ressourcen-Preset, das auf alle Komponenten der Control Plane angewendet wird (API Server, Controller Manager, Scheduler). Die Liste wird von der Plattform bereitgestellt, und jede Option zeigt ihre CPU und ihren Arbeitsspeicher an. Das Preset **Small** ist standardmäßig ausgewählt.

| Preset | Empfohlene Nutzung (Hilfetext der Konsole) |
|--------|--------------------------------------------|
| **Small** | Geringe Last, Entwicklung oder Tests. Kostenoptimiert. |
| **Medium** | Standardnutzung mit moderater Last. Gutes Verhältnis von Leistung zu Kosten. |
| **Large** | Intensive Nutzung oder hoher Traffic. Maximale Leistung. |

Die Plattform bietet außerdem kleinere (`nano`, `micro`) und größere (`xlarge`, `2xlarge`) Presets an.

:::note
Eine Dimensionierung pro Komponente (dedizierte Ressourcen für API Server, Scheduler usw.) wird in der Konsole nicht angeboten; wenden Sie sich an den Support.
:::

### Control Plane High Availability

Anzahl der Instanzen der Control Plane: **1**, **3 (HA)** oder **5 (HA)**. Der Standardwert ist 3.
Eine ungerade Anzahl an Instanzen garantiert das Quorum von `etcd`; verwenden Sie in der Produktion mindestens 3 Instanzen.

Unter dem Feld zeigt die Konsole den auf die Projekt-Quota angerechneten Verbrauch an, zum Beispiel „→ 3 × Small = … CPU · … GiB counted against the quota“.

:::warning
Größe und Anzahl der Instanzen der Control Plane lassen sich nach der Erstellung des Clusters in der Konsole nicht ändern. Um sie zu ändern, wenden Sie sich an den Support.
:::

---

## Node-Gruppen

Die Node-Gruppen werden im Schritt **Nodes** des Assistenten konfiguriert (Titel **Worker Node Groups**). Ein Cluster enthält mindestens eine Gruppe; **Add node group** legt eine neue an. Jede Gruppe ist eine einklappbare Karte, die ihre Größe, ihre Grenzen und ihren Speicher zusammenfasst.

| Feld | Beschreibung | Standardwert |
|------|--------------|--------------|
| **Group name** | 3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben, endet mit einem Buchstaben oder einer Ziffer | `worker-pool-1`, `worker-pool-2`… |
| **Ephemeral storage size** | Speicherplatz, der den Pods auf jedem Node zugewiesen wird, in GB (mindestens 5 GB) | 20 GB |
| **Minimum nodes** | Anzahl der Nodes, die immer vorhanden sind. 0 ist zulässig | 1 |
| **Maximum nodes** | Obergrenze des Autoscalings (zwischen 1 und 100, größer oder gleich dem Minimum; empfohlenes Maximum 50) | 3 |
| **Instance type** | Größe der Nodes, gewählt nach Serie und dann nach Größe | keiner (Auswahl erforderlich) |
| **Exposed on the internet (Public IP)** | Die Nodes der Gruppe hosten den Ingress-NGINX-Controller und empfangen den eingehenden Traffic | für die erste Gruppe aktiviert |
| **GPU** | Modell und Anzahl der GPUs, die an jeden Node der Gruppe angebunden werden | keine |

:::note
Die erste Node-Gruppe ist immer aus dem Internet erreichbar und kann nicht gelöscht werden. Später hinzugefügte Gruppen sind standardmäßig nicht erreichbar.
:::

### Instanztypen

Die Auswahl bietet drei Serien. Die genaue Liste der verfügbaren Größen wird von der Plattform bereitgestellt.

#### Serie Standard (S) — Verhältnis 1:2

Kostengünstige Nutzung, für Entwicklung und Tests.

| Größe | vCPU | RAM |
|-------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.3large` | 12 | 24 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.3xlarge` | 24 | 48 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |

#### Serie Universal (U) — Verhältnis 1:4

Allgemeine Nutzung: Webserver, Anwendungen.

| Größe | vCPU | RAM |
|-------|------|-----|
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |

#### Serie Memory (M) — Verhältnis 1:8

Speicheroptimiert: Datenbanken, Caches.

| Größe | vCPU | RAM |
|-------|------|-----|
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### GPU

Der Abschnitt **GPU** einer Gruppe erscheint nur, wenn für Ihr Projekt GPUs verfügbar sind. Dort wählen Sie ein oder mehrere Modelle und deren Anzahl; diese GPUs werden an **jeden** Node der Gruppe angebunden.

Von der Konsole angewendete Regeln:

- sobald eine Gruppe GPUs hat, wird das Addon **GPU Operator** aktiviert und kann nicht mehr abgewählt werden;
- eine ohne GPU erstellte Gruppe kann keine erhalten: Fügen Sie eine neue Node-Gruppe hinzu, um GPUs zu erhalten;
- eine mit GPUs erstellte Gruppe kann Modell oder Anzahl ändern, muss aber mindestens eine GPU behalten.

:::warning
Die GPU-Reservierung wird anhand der maximalen Anzahl an Nodes der Gruppe berechnet: Eine Gruppe mit maximal 4 Nodes und 1 GPU pro Node reserviert 4 GPUs.
:::

### Nicht angebotene Optionen

Benutzerdefinierte Node-Rollen (außer der Erreichbarkeit aus dem Internet) und das Überschreiben der CPU-/Arbeitsspeicher-Ressourcen einer Größe werden in der Konsole nicht angeboten; wenden Sie sich an den Support.

:::tip Best Practices für Node-Gruppen
- Passen Sie Minimum und Maximum der Nodes an Ihren Skalierungsbedarf an.
- Wählen Sie eine Serie, die zur Workload passt (S für allgemeine, U für ausgewogene, M für speicherintensive Workloads).
- Sehen Sie ausreichend ephemeren Speicher für Images, Logs und Caches vor.
- Trennen Sie die Rollen nach Gruppen: eine erreichbare Gruppe für eingehenden Traffic, interne Gruppen für Rechenlast.
:::

---

## Addons

Die Addons werden im Schritt **Addons** des Assistenten ausgewählt (Titel **Extensions and Addons**) und anschließend über die Bearbeitungsseite des Clusters geändert.

### Addons des Clusters

Sie werden über ein Kontrollkästchen aktiviert oder deaktiviert.

| Addon | Beschreibung | Standardmäßig aktiviert |
|-------|--------------|-------------------------|
| [Cert-Manager](./plugins/cert-manager.md) | Automatische Verwaltung von SSL/TLS-Zertifikaten | Ja |
| [Ingress NGINX](./plugins/ingress-nginx.md) | Auf NGINX basierender Ingress-Controller | Ja |
| [Gateway API](./plugins/gateway-api.md) | Installiert die CRDs der Kubernetes Gateway API (experimenteller Kanal) | Nein |
| [GPU Operator](./plugins/gpu-operator.md) | Verwaltung der NVIDIA-GPUs im Cluster | Nein (vorgegeben, wenn eine Gruppe GPUs hat) |
| [HAMi](./plugins/hami.md) | Teilen einer GPU zwischen mehreren Pods | Nein |
| [Flux CD](./plugins/fluxcd.md) | GitOps Continuous Deployment | Nein |
| [Monitoring Agents](./plugins/monitoring-agents.md) | Monitoring-Agents für Logs und Metriken | Ja |
| [Ouroboros](./plugins/ouroboros.md) | Behebt Hairpin-NAT von Ingress NGINX mit dem PROXY-Protokoll | Nein |
| [Velero](./plugins/velero.md) | Backup und Wiederherstellung | Nein |

Von der Konsole geprüfte Abhängigkeiten:

- **HAMi** erfordert das Addon **GPU Operator**;
- **Ouroboros** erfordert das Addon **Ingress NGINX**.

### Advanced Configuration

[Cilium](./plugins/cilium.md), [CoreDNS](./plugins/coredns.md) und [Vertical Pod Autoscaler](./plugins/verticalpodautoscaler.md) sind immer im Cluster vorhanden. Sie lassen sich nicht deaktivieren: Sie können lediglich ihren Block aufklappen, um ihre Konfiguration zu überschreiben.

### Überschreiben der Helm-Werte

Jedes Addon (außer Gateway API) akzeptiert ein Feld **Helm Configuration (YAML) — optional**. Der YAML-Wert wird direkt an das Helm-Chart des Addons übergeben und überschreibt dessen Standardwerte. Er muss ein YAML-Mapping (`key: value`) sein; die Konsole lehnt ungültiges YAML ab. Das Link-Symbol neben dem Namen des Addons öffnet die Dokumentation des Charts.

---

## Zugriff auf den Cluster

Sobald der Cluster bereit ist, lädt die Schaltfläche **Kubeconfig** im Abschnitt **Actions** der Detailseite die Datei `kubeconfig-<cluster-name>.yaml` herunter. Diese Datei gewährt administrativen Zugriff auf den Cluster mit `kubectl`, `helm` oder jedem anderen Kubernetes-Client. Das darin enthaltene Client-Zertifikat ist ab der Erstellung des Clusters ein Jahr lang gültig. Siehe [Zugriff und Werkzeuge](./how-to/toolbox.md).

Die API-Adresse des Clusters wird durch das Feld **API Endpoint (Host)** im Schritt **General** festgelegt. Es ist optional: Bleibt es leer, wird sie automatisch von der Plattform erzeugt und ohne Ihr Zutun aufgelöst. Wenn Sie Ihren eigenen Domainnamen eingeben, deckt das Zertifikat des API-Servers ihn ab, der DNS-Eintrag muss jedoch noch bei Ihrem DNS-Anbieter angelegt werden: Fragen Sie beim [Support](mailto:support@hidora.io) nach der Adresse, auf die er zeigen soll.

---

## Lebenszyklus und Quotas

- **Status**: Ein neu erstellter Cluster erscheint in der Liste **Kubernetes Clusters** mit dem Status **Creating** und danach **Ready**, sobald er betriebsbereit ist.
- **Quotas**: Die Anzeigen **Project Quotas** des Assistenten zählen die Control Plane und jede Node-Gruppe **mit ihrer maximalen Anzahl an Nodes**. Die Erstellung wird blockiert, wenn das Projekt nicht genügend Quota hat.
- **Änderung**: Über die Schaltfläche **Edit** können Sie Version, API-Endpoint, Node-Gruppen und Addons ändern. Der Name des Clusters kann nicht geändert werden.
- **Löschen**: Die Schaltfläche **Delete** löscht den Cluster nach Bestätigung seines Namens.
