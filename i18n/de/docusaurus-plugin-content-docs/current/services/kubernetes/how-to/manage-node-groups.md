---
title: "Eine Node-Gruppe hinzufügen und ändern"
---

# Eine Node-Gruppe hinzufügen und ändern

Mit Node-Gruppen unterteilen Sie die Nodes Ihres Kubernetes-Clusters nach den Anforderungen Ihrer Workloads. Diese Anleitung erklärt, wie Sie Node-Gruppen über die Hikube-Konsole hinzufügen, ändern und löschen.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- Die über die Konsole heruntergeladene kubeconfig des Clusters (Schaltfläche **Kubeconfig**), um die Nodes mit `kubectl` zu prüfen

## Schritte

### 1. Die Instanztypen verstehen

Hikube bietet drei Instanzserien für unterschiedliche Anwendungsfälle an:

| Serie | Verhältnis CPU:RAM | Anwendungsfall |
|-------|--------------------|----------------|
| **Standard (S)** | 1:2 | Kostengünstige Nutzung, Entwicklung, Tests |
| **Universal (U)** | 1:4 | Allgemeine Nutzung: Webserver, Anwendungen |
| **Memory (M)** | 1:8 | Speicheroptimiert: Datenbanken, Caches |

Die Größen jeder Serie finden Sie in den [Konzepten](../concepts.md#instanztypen).

### 2. Die Bearbeitungsseite des Clusters öffnen

1. Öffnen Sie in der Konsole **Infrastructure** > **Kubernetes**.
2. Öffnen Sie das Menü **Actions** des Clusters und wählen Sie **Edit** (oder klicken Sie auf der Detailseite des Clusters auf **Edit**).

Die Bearbeitungsseite enthält die Abschnitte **General information**, **Node groups** und **Extensions & Addons** sowie die Quota-Anzeigen des Projekts.

### 3. Eine Node-Gruppe hinzufügen

1. Klicken Sie im Abschnitt **Node groups** auf **Add node group**. Eine neue Karte öffnet sich.
2. Füllen Sie die Felder aus:
   - **Group name**: zum Beispiel `compute` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche);
   - **Ephemeral storage size**: zum Beispiel 100 GB;
   - **Minimum nodes** und **Maximum nodes**: zum Beispiel 1 und 10;
   - **Instance type**: zum Beispiel Serie **Universal (U)**, Größe **4XLarge** (`u1.4xlarge`);
   - **Exposed on the internet (Public IP)**: nur aktivieren, wenn diese Gruppe eingehenden Traffic empfangen soll (Ingress NGINX);
   - **GPU**: bei Bedarf, siehe [GPUs hinzufügen](#5-gpus-hinzufügen).
3. Klicken Sie auf **Save**.

:::tip
Wählen Sie aussagekräftige Namen für Ihre Gruppen (`compute`, `web`, `monitoring`, `gpu`), um die Verwaltung des Clusters zu erleichtern.
:::

### 4. Eine bestehende Gruppe ändern

Klappen Sie im Abschnitt **Node groups** die Karte der Gruppe auf, ändern Sie die gewünschten Felder (Instanztyp, ephemerer Speicher, minimale oder maximale Anzahl der Nodes, Erreichbarkeit) und klicken Sie dann auf **Save**.

:::warning
Eine Änderung des Instanztyps ersetzt die Nodes der Gruppe schrittweise: Neue Nodes werden erstellt, danach werden die alten einzeln entfernt. Die Quota des Projekts muss die zusätzlichen Nodes während des Austauschs aufnehmen können.
:::

:::note
Vermeiden Sie es, eine bestehende Gruppe umzubenennen: Eine umbenannte Gruppe wird als neue Gruppe behandelt.
:::

### 5. GPUs hinzufügen

Der Abschnitt **GPU** einer Karte erscheint nur, wenn für Ihr Projekt GPUs verfügbar sind.

- Wählen Sie für eine **neue** Gruppe das Modell und die Anzahl der GPUs pro Node. Das Addon **GPU Operator** wird dann automatisch aktiviert und kann nicht mehr abgewählt werden.
- Eine **ohne GPU erstellte** Gruppe kann keine erhalten: Fügen Sie eine neue GPU-Node-Gruppe hinzu.
- Eine **mit GPUs erstellte** Gruppe kann Modell oder Anzahl ändern, muss aber mindestens eine GPU behalten: Um zu Nodes ohne GPU zurückzukehren, fügen Sie stattdessen eine neue Gruppe ohne GPU hinzu.

Siehe auch [GPUs in Kubernetes bereitstellen](../../gpu/how-to/provision-gpu-kubernetes.md).

### 6. Eine Node-Gruppe löschen

:::warning
Stellen Sie vor dem Löschen einer Gruppe sicher, dass die darauf laufenden Workloads auf andere Gruppen umgeplant werden können. Verwenden Sie bei Bedarf `kubectl drain` auf den betroffenen Nodes.
:::

1. Klicken Sie im Abschnitt **Node groups** auf das Symbol **Remove this group** der betreffenden Karte.
2. Klicken Sie auf **Save**.

Die erste Gruppe des Clusters kann nicht gelöscht werden; ein Cluster muss immer mindestens eine Node-Gruppe behalten.

## Überprüfung

Nach dem Speichern zeigt die Konsole „Cluster updated“ an und kehrt zur Detailseite zurück. Der Abschnitt **Node Pools** listet jede Gruppe mit ihrem Instanztyp und der Anzahl aktiver Nodes auf.

Beobachten Sie im Cluster, wie die neuen Nodes hinzukommen:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes -w
```

**Erwartetes Ergebnis:**

```console
NAME                        STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx    Ready    <none>   10m   v1.xx.x
my-cluster-compute-yyyyy    Ready    <none>   2m    v1.xx.x
```

## Weiterführende Informationen

- [Konzepte](../concepts.md): Beschreibung aller Felder einer Node-Gruppe
- [Autoscaling konfigurieren](./configure-autoscaling.md): die automatische Skalierung der Gruppen verwalten
