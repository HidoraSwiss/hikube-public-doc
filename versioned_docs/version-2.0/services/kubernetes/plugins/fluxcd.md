---
sidebar_position: 8
title: FluxCD
---


### **Flux CD**

Déploiement GitOps pour l'automatisation des déploiements.

```yaml
spec:
  addons:
    fluxcd:
      enabled: true
      valuesOverride:
        # Configuration du Git repository
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
          path: "./clusters/production"
```

#### **Configuration Avancée Flux CD**

```yaml
spec:
  addons:
    fluxcd:
      enabled: true
      valuesOverride:
        # Source Controller
        sourceController:
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Kustomize Controller
        kustomizeController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Helm Controller
        helmController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Notification Controller
        notificationController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi
```
