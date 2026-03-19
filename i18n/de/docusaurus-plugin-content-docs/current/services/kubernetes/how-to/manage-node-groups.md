---
title: "Node Group hinzufügen und ändern"
---

# Node Group hinzufügen und ändern

Node Groups ermöglichen die Segmentierung der Knoten Ihres Kubernetes-Clusters nach den Anforderungen Ihrer Workloads. Dieser Leitfaden erklärt, wie Sie Node Groups in Ihrer Hikube-Konfiguration hinzufügen, ändern und entfernen.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihres Clusters

## Schritte

### 1. Instanztypen verstehen

Hikube bietet drei Instanzserien für verschiedene Anwendungsfälle:

| Serie | Verhältnis CPU:RAM | Anwendungsfall |
|-------|---------------------|----------------|
| **S (Standard)** | 1:2 | Allgemeine Workloads, Webanwendungen |
| **U (Universal)** | 1:4 | Ausgewogene Workloads, Datenbanken |
| **M (Memory Optimized)** | 1:8 | Speicherintensive Anwendungen, Caches |

**Details der verfügbaren Instanzen:**

| Instanz | vCPU | RAM |
|---------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |
| `s1.4xlarge` | 32 | 64 GB |
| `s1.8xlarge` | 64 | 128 GB |
| `u1.medium` | 1 | 4 GB |
| `u1.large` | 2 | 8 GB |
| `u1.xlarge` | 4 | 16 GB |
| `u1.2xlarge` | 8 | 32 GB |
| `u1.4xlarge` | 16 | 64 GB |
| `u1.8xlarge` | 32 | 128 GB |
| `m1.large` | 2 | 16 GB |
| `m1.xlarge` | 4 | 32 GB |
| `m1.2xlarge` | 8 | 64 GB |
| `m1.4xlarge` | 16 | 128 GB |
| `m1.8xlarge` | 32 | 256 GB |

### 2. Node Group hinzufügen

Um eine neue Node Group hinzuzufügen, fügen Sie einen Eintrag unter `spec.nodeGroups` in Ihrer Cluster-Konfigurationsdatei hinzu:

```yaml title="cluster-with-compute.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    # Node group existant
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nouveau node group pour le compute intensif
    compute:
      minReplicas: 1
      maxReplicas: 10
      instanceType: "u1.4xlarge"
      ephemeralStorage: 100Gi
      roles: []
```

:::tip
Wählen Sie beschreibende Namen für Ihre Node Groups (`compute`, `web`, `monitoring`, `gpu`), um die Cluster-Verwaltung zu erleichtern.
:::

### 3. Bestehende Node Group ändern

Um eine Node Group zu ändern, aktualisieren Sie die gewünschten Felder in Ihrer YAML-Datei. Beispiel: Instanztyp ändern und ephemeren Speicher erhöhen:

```yaml title="cluster-updated.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "u1.xlarge"       # Modifie : de s1.large a u1.xlarge
      ephemeralStorage: 100Gi          # Modifie : de 50Gi a 100Gi
      roles:
        - ingress-nginx
```

:::warning
Die Änderung des `instanceType` löst ein Rolling Update der Knoten der Gruppe aus. Stellen Sie sicher, dass Ihr Cluster über genügend Kapazität verfügt, um die Last während des Updates aufzufangen.
:::

### 4. Node Group entfernen

Um eine Node Group zu entfernen, löschen Sie einfach ihren Block aus der Konfiguration und wenden Sie sie erneut an:

```yaml title="cluster-simplified.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    # Le node group "compute" a ete supprime
```

:::warning
Stellen Sie vor dem Entfernen einer Node Group sicher, dass die darauf laufenden Workloads auf andere Gruppen umgeplant werden können. Verwenden Sie bei Bedarf `kubectl drain` auf den betroffenen Knoten.
:::

### 5. Änderungen anwenden

Wenden Sie die Änderungen mit `kubectl` an:

```bash
kubectl apply -f cluster-updated.yaml
```

## Überprüfung

Überprüfen Sie, ob die Änderungen übernommen wurden:

```bash
# Verifier la configuration du cluster
kubectl get kubernetes my-cluster -o yaml | grep -A 15 nodeGroups

# Observer les noeuds du cluster enfant
kubectl --kubeconfig=cluster-admin.yaml get nodes -w

# Verifier les machines en cours de provisionnement
kubectl get machines -l cluster.x-k8s.io/cluster-name=my-cluster
```

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   10m   v1.29.0
my-cluster-compute-yyyyy     Ready    <none>   2m    v1.29.0
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Vollständige Details der Felder `nodeGroups`
- [Konzepte](../concepts.md) -- Architektur der Hikube Node Groups
- [Autoscaling konfigurieren](./configure-autoscaling.md) -- Automatisches Scaling der Node Groups verwalten
