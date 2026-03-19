---
sidebar_position: 6
title: Riferimento API
---

# Esempi Completi

## **Cluster di Produzione**

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
  # Configurazione cluster
  host: "k8s-prod.company.com"
  storageClass: "replicated"

  # Piano di controllo ad alta disponibilità
  controlPlane:
    replicas: 3

  # Node group specializzati
  nodeGroups:
    # Nodi generali con Ingress
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nodi compute per workload intensivi
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
      ephemeralStorage: 100Gi
      roles: []

    # Nodi monitoring dedicati
    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  # Add-on completi
  addons:
    # Certificati SSL automatici
    certManager:
      enabled: true
      valuesOverride:
        prometheus:
          enabled: true

    # Esposizione HTTP/HTTPS
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

    # GitOps per le distribuzioni
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-production"
          branch: "main"

    # Monitoring completo
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

## **Cluster di Sviluppo**

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
  # Configurazione base
  host: "k8s-dev.company.local"
  storageClass: "replicated"

  # Piano di controllo minimale
  controlPlane:
    replicas: 1  # Risparmio di risorse

  # Node group unico polivalente
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "s1.medium"
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  # Solo add-on essenziali
  addons:
    certManager:
      enabled: true

    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.company.local"
      valuesOverride:
        controller:
          replicaCount: 1  # Replica minimale
```

## **Cluster ML/AI con GPU**

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
  storageClass: "fast-ssd"  # Archiviazione ad alte prestazioni

  controlPlane:
    replicas: 2

  nodeGroups:
    # Nodi standard per l'orchestrazione
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nodi GPU per workload ML
    gpu:
      minReplicas: 0      # Scaling a zero possibile
      maxReplicas: 10
      instanceType: "u1.2xlarge"
      gpus: # Istanza con GPU
        - name: nvidia.com/AD102GL_L40S # Nvidia L40S
      ephemeralStorage: 500Gi      # Archiviazione importante per i dataset
      roles: []

  addons:
    certManager:
      enabled: true

    monitoringAgents:
      enabled: true
      valuesOverride:
        # Monitoring specializzato GPU
        dcgmExporter:
          enabled: true
```

---

:::tip 💡 Buone Pratiche

- **Utilizzate le label** per organizzare i vostri cluster per ambiente
- **Configurate RBAC** fin dalla creazione per proteggere l'accesso
- **Attivate il monitoring** per un'osservabilità completa
- **Pianificate la capacità** con node group appropriati
- **Testate i backup** regolarmente
:::

:::warning ⚠️ Attenzione

- **Le eliminazioni sono irreversibili** - pensate ai backup
- **Gli aggiornamenti** possono avere un impatto sui workload
- **Verificate la compatibilità** degli add-on con le versioni Kubernetes
:::
