---
sidebar_position: 6
title: API-Referenz
---

# Vollständige Beispiele

## **Produktions-Cluster**

```yaml title="production-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: production
  namespace: company-prod
  labels:
    environment: production
    criticality: high
    team: platform
spec:
  # Cluster-Konfiguration
  host: "k8s-prod.company.com"
  storageClass: "replicated"

  # Hochverfügbare Steuerungsebene
  controlPlane:
    replicas: 3

  # Spezialisierte Node Groups
  nodeGroups:
    # Allgemeine Knoten mit Ingress
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Compute-Knoten für intensive Workloads
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
      ephemeralStorage: 100Gi
      roles: []

    # Dedizierte Monitoring-Knoten
    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  # Vollständige Add-ons
  addons:
    # Automatische SSL-Zertifikate
    certManager:
      enabled: true
      valuesOverride:
        prometheus:
          enabled: true

    # HTTP/HTTPS-Exposition
    ingressNginx:
      enabled: true
      hosts:
        - "app.company.com"
        - "api.company.com"
        - "*.services.company.com"
      valuesOverride:
        controller:
          replicaCount: 3
          resources:
            requests:
              cpu: 200m
              memory: 256Mi

    # GitOps für Bereitstellungen
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-production"
          branch: "main"

    # Vollständiges Monitoring
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

## **Entwicklungs-Cluster**

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
  namespace: company-dev
  labels:
    environment: development
    auto-cleanup: "7d"
spec:
  # Basiskonfiguration
  host: "k8s-dev.company.local"
  storageClass: "replicated"

  # Minimale Steuerungsebene
  controlPlane:
    replicas: 1  # Ressourcen sparen

  # Einzelne Allzweck-Node Group
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "s1.medium"
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  # Nur wesentliche Add-ons
  addons:
    certManager:
      enabled: true

    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.company.local"
      valuesOverride:
        controller:
          replicaCount: 1  # Minimale Replikation
```

## **ML/AI-Cluster mit GPU**

```yaml title="ml-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: machine-learning
  namespace: company-ai
  labels:
    environment: ai
    workload: gpu
spec:
  host: "k8s-ai.company.com"
  storageClass: "fast-ssd"  # Hochleistungsspeicher

  controlPlane:
    replicas: 2

  nodeGroups:
    # Standardknoten für Orchestrierung
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # GPU-Knoten für ML-Workloads
    gpu:
      minReplicas: 0      # Skalierung auf Null möglich
      maxReplicas: 10
      instanceType: "u1.2xlarge"
      gpus: # Instanz mit GPU
        - name: nvidia.com/AD102GL_L40S # Nvidia L40S
      ephemeralStorage: 500Gi      # Großer Speicher für Datasets
      roles: []

  addons:
    certManager:
      enabled: true

    monitoringAgents:
      enabled: true
      valuesOverride:
        # Spezialisiertes GPU-Monitoring
        dcgmExporter:
          enabled: true
```

---

:::tip 💡 Best Practices

- **Verwenden Sie Labels**, um Ihre Cluster nach Umgebung zu organisieren
- **Konfigurieren Sie RBAC** von Beginn an, um den Zugriff abzusichern
- **Aktivieren Sie das Monitoring** für vollständige Observability
- **Planen Sie die Kapazität** mit geeigneten Node Groups
- **Testen Sie die Sicherungen** regelmäßig
:::

:::warning ⚠️ Achtung

- **Löschungen sind irreversibel** — denken Sie an Sicherungen
- **Updates** können Auswirkungen auf die Workloads haben
- **Prüfen Sie die Kompatibilität** der Add-ons mit den Kubernetes-Versionen
:::
