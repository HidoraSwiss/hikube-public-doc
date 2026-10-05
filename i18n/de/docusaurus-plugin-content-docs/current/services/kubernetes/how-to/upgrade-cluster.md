---
title: "Einen Cluster aktualisieren"
---

# Einen Cluster aktualisieren

Diese Anleitung erklärt, wie Sie die Kubernetes-Version eines Hikube-Clusters über die Konsole aktualisieren. Die Updates erfolgen per Rolling Update.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**), um das Ergebnis zu prüfen

## Schritte

### 1. Die aktuelle Version prüfen

Unter **Infrastructure** > **Kubernetes** zeigt die Spalte **Version** der Liste die Version jedes Clusters an. Die Detailseite zeigt sie außerdem im Abschnitt **General** (**Version**) an.

Im Cluster sehen Sie die Version der Nodes mit:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

### 2. Das Update vorbereiten

:::warning
Testen Sie das Update immer auf einem Testcluster, bevor Sie es in der Produktion durchführen. Einige Anwendungen sind möglicherweise nicht mit einer neuen Kubernetes-Version kompatibel (veraltete und später entfernte APIs).
:::

:::note
Führen Sie Updates inkrementell durch (zum Beispiel von v1.29 auf v1.30). Überspringen Sie nicht mehrere Minor-Versionen auf einmal.
:::

### 3. Die Version ändern

1. Öffnen Sie das Menü **Actions** des Clusters und wählen Sie **Edit** (oder klicken Sie auf der Detailseite auf **Edit**).
2. Öffnen Sie im Abschnitt **General information** die Liste **Kubernetes Version** und wählen Sie die Zielversion. Die Liste enthält nur die von der Plattform angebotenen Versionen.
3. Klicken Sie auf **Save**. Die Konsole zeigt „Cluster updated“ an und kehrt zur Detailseite zurück.

:::note
Wenn die aktuelle Version des Clusters von der Plattform nicht mehr angeboten wird, weist die Konsole darauf hin („current version“) und fordert Sie auf, eine unterstützte Version auszuwählen.
:::

### 4. Das Rolling Update verfolgen

Die Nodes werden schrittweise ersetzt. Verfolgen Sie den Austausch im Cluster:

```bash
kubectl get nodes -w
```

:::tip
Während eines Rolling Updates werden die Nodes einzeln ersetzt: Ihre Workloads laufen weiter, wenn sie mehrere Replicas haben. Definieren Sie `PodDisruptionBudget` für Ihre kritischen Anwendungen.
:::

## Überprüfung

Bestätigen Sie nach Abschluss des Austauschs die neue Version:

```bash
# Nodes im Zustand Ready mit der neuen Version
kubectl get nodes

# Version des API-Servers
kubectl version

# Ihre Workloads laufen
kubectl get pods -A
```

**Erwartetes Ergebnis:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx     Ready    <none>   5m    v1.30.x
my-cluster-general-yyyyy     Ready    <none>   3m    v1.30.x
```

:::warning
Wenn Pods nach dem Update fehlerhaft bleiben, prüfen Sie die Kompatibilität Ihrer Manifeste mit der neuen Kubernetes-Version. Einige veraltete APIs wurden möglicherweise entfernt.
:::

## Weiterführende Informationen

- [Konzepte](../concepts.md): Architektur der Control Plane
- [Zugriff und Werkzeuge](./toolbox.md): Diagnosebefehle im Cluster
