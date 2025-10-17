---
sidebar_position: 5
title: Ingress Nginx
---

### **Ingress NGINX**

Contrôleur d'ingress pour l'exposition HTTP/HTTPS.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Wildcard support
      valuesOverride: {}
```

#### **Configuration Avancée Ingress NGINX**

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "production.company.com"
        - "*.apps.company.com"
      valuesOverride:
        controller:
          # Réplication pour haute disponibilité
          replicaCount: 3

          # Configuration des ressources
          resources:
            requests:
              cpu: 100m
              memory: 90Mi
            limits:
              cpu: 500m
              memory: 500Mi

          # Configuration du service LoadBalancer
          service:
            type: LoadBalancer
            annotations:
              service.beta.kubernetes.io/aws-load-balancer-type: nlb

          # Métriques
          metrics:
            enabled: true
            serviceMonitor:
              enabled: true

          # Configuration SSL
          config:
            ssl-protocols: "TLSv1.2 TLSv1.3"
            ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

          # Logging
          enableSnippets: true
```
