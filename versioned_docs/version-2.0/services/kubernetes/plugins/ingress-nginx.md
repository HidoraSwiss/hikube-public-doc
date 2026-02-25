---
sidebar_position: 5
title: Ingress Nginx
---

# 🧩 Détails du champ `addons.ingressNginx`

Le champ `addons.ingressNginx` définit la configuration de l’add-on **Ingress NGINX**, utilisé pour gérer les points d’entrée HTTP(S) du cluster Kubernetes.
Il déploie un contrôleur NGINX qui expose les applications internes via des routes Ingress, avec un support complet du TLS, du load balancing et des annotations Kubernetes.

```yaml
addons:
  ingressNginx:
    enabled: true
    exposeMethod: LoadBalancer
    hosts:
      - app.example.com
      - api.example.com
    valuesOverride:
      ingressNginx:
        controller:
          replicaCount: 2
          service:
            type: LoadBalancer
```

---

## `ingressNginx` (Object) — **Obligatoire**

### Description

Le champ `ingressNginx` regroupe la configuration principale du contrôleur Ingress basé sur NGINX.
Il permet d’activer le déploiement du contrôleur, de choisir la méthode d’exposition et de définir les hôtes publics associés.

### Exemple

```yaml
ingressNginx:
  enabled: true
  exposeMethod: Proxied
  hosts:
    - app.example.com
```

---

## `enabled` (boolean) — **Obligatoire**

### Description

Indique si le contrôleur **Ingress NGINX** est activé (`true`) ou désactivé (`false`).
Lorsqu’il est activé, un ou plusieurs pods NGINX sont déployés pour gérer les règles d’entrée du cluster.

### Exemple

```yaml
enabled: true
```

---

## `exposeMethod` (string) — **Obligatoire**

### Description

Détermine la **méthode d’exposition** du contrôleur Ingress NGINX.
Ce champ accepte les valeurs suivantes :

| Valeur | Description |
|--------|--------------|
| `Proxied` | Le contrôleur est exposé via un proxy interne ou un ingress existant. |
| `LoadBalancer` | Le service NGINX est exposé via un `Service` de type `LoadBalancer`. |

### Exemple

```yaml
exposeMethod: LoadBalancer
```

---

## `hosts` (Array)

### Description

Liste les **noms de domaine** associés au contrôleur Ingress NGINX.
Ces hôtes définissent les routes publiques accessibles depuis l’extérieur du cluster.

### Exemple

```yaml
hosts:
  - app.example.com
  - api.example.com
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Le champ `valuesOverride` permet de **surcharger les valeurs Helm** du déploiement Ingress NGINX.
Il est utilisé pour personnaliser la configuration du contrôleur (nombre de réplicas, type de service, ressources, annotations, etc.).

#### **Ingress NGINX**

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
        ingressNginx:
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

---

## 💡 Bonnes pratiques

- Préférer `Proxied` pour les environnements on-premises où l’accès est géré via un reverse proxy externe.
- Définir plusieurs `hosts` pour les applications multi-domaines.
- Utiliser `valuesOverride` pour ajuster les ressources, le nombre de réplicas et la configuration TLS.
- Configurer les annotations (`nginx.ingress.kubernetes.io/*`) directement via les manifestes `Ingress` pour un meilleur contrôle applicatif.
