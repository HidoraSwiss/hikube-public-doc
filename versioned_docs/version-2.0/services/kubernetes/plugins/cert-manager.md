---
sidebar_position: 6
title: Cert-manager
---

### **Cert-Manager**

Gestion automatisée des certificats SSL/TLS.

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        installCRDs: true
        prometheus:
          enabled: true
```

#### **Configuration Avancée Cert-Manager**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        # Configuration des issuers par défaut
        global:
          leaderElection:
            namespace: cert-manager
        # Métriques Prometheus
        prometheus:
          enabled: true
          servicemonitor:
            enabled: true
        # Resources des pods
        resources:
          requests:
            cpu: 10m
            memory: 32Mi
          limits:
            cpu: 100m
            memory: 128Mi
```
