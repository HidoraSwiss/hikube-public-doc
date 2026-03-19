---
title: "Monitoring konfigurieren"
---

# Monitoring konfigurieren

Dieser Leitfaden erklärt, wie Sie das Monitoring auf einem Hikube-Kubernetes-Cluster aktivieren und konfigurieren, einschließlich der Sammlung von Metriken, Logs und Visualisierungs-Dashboards.

## Voraussetzungen

- Ein bereitgestellter Hikube-Kubernetes-Cluster (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Die YAML-Konfigurationsdatei Ihres Clusters

## Schritte

### 1. Addon monitoringAgents aktivieren

Ändern Sie die Konfiguration Ihres Clusters, um das Monitoring-Addon zu aktivieren:

```yaml title="cluster-monitoring.yaml"
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

    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

:::note
Die Aktivierung von Fluent Bit (`fluentbit.enabled: true`) ermöglicht die Sammlung und Weiterleitung der Logs Ihrer Anwendungen an den Observability-Stack.
:::

### 2. Dedizierte Node Group für Monitoring erstellen

Die Monitoring-Komponenten (VictoriaMetrics, Grafana, Fluent Bit) verbrauchen erhebliche Ressourcen. Es wird empfohlen, eine dedizierte Node Group mit speicheroptimierten Instanzen einzurichten:

```yaml title="cluster-monitoring.yaml"
nodeGroups:
  monitoring:
    minReplicas: 2
    maxReplicas: 4
    instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
    ephemeralStorage: 200Gi       # Stockage important pour les metriques et logs
    roles:
      - monitoring
```

:::tip
Die Serie M (Memory Optimized) ist ideal für Monitoring, da Metrik-Datenbanken (VictoriaMetrics) und Log-Indexierungsengines viel Speicher benötigen.
:::

### 3. Konfiguration anwenden

```bash
kubectl apply -f cluster-monitoring.yaml

# Attendre que le cluster soit pret
kubectl get kubernetes my-cluster -w
```

### 4. Auf Monitoring-Tools zugreifen

Sobald der Cluster aktualisiert ist, überprüfen Sie, ob die Monitoring-Komponenten im Child-Cluster bereitgestellt sind:

```bash
export KUBECONFIG=cluster-admin.yaml

# Lister les pods de monitoring
kubectl get pods -n monitoring

# Verifier les services disponibles
kubectl get svc -n monitoring

# Acceder a Grafana (si disponible via Ingress)
kubectl get ingress -n monitoring
```

Um lokal auf Grafana zuzugreifen:

```bash
kubectl port-forward -n monitoring svc/grafana 3000:80 &
# Ouvrir http://localhost:3000 dans le navigateur
```

### 5. Metriken überprüfen

Bestätigen Sie, dass die Metriken korrekt gesammelt werden:

```bash
# Metriques des noeuds
kubectl top nodes

# Metriques des pods
kubectl top pods -A

# Events du cluster
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Erwartetes Ergebnis für `kubectl top nodes`:**

```console
NAME                          CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
my-cluster-general-xxxxx      250m         6%     1200Mi          15%
my-cluster-monitoring-yyyyy   800m         20%    4500Mi          14%
```

## Überprüfung

Überprüfen Sie, ob der gesamte Monitoring-Stack betriebsbereit ist:

```bash
# Verifier tous les composants de monitoring
kubectl get pods -n monitoring

# Verifier les logs Fluent Bit
kubectl logs -n monitoring -l app.kubernetes.io/name=fluent-bit --tail=20
```

**Erwartetes Ergebnis:**

```console
NAME                                 READY   STATUS    RESTARTS   AGE
grafana-xxxxx-yyyyy                  1/1     Running   0          10m
vmagent-xxxxx-yyyyy                  1/1     Running   0          10m
fluent-bit-xxxxx                     1/1     Running   0          10m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Konfiguration des Addons `monitoringAgents`
- [Konzepte](../concepts.md) -- Architektur und Observability
- [Zugang und Tools](./toolbox.md) -- Debugging-Befehle und Metriken
