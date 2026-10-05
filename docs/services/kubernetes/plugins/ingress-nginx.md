---
sidebar_position: 5
title: Ingress NGINX
---

# Ingress NGINX

L'addon **Ingress NGINX** déploie un contrôleur Ingress basé sur NGINX. Il expose les applications du cluster via des ressources `Ingress`, avec support du TLS, du load balancing et des annotations NGINX.

## Dans la console

1. À la création, étape **Addons**, **Ingress NGINX** est coché par défaut.
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez ou décochez **Ingress NGINX**, puis **Enregistrer**.

La page de détail du cluster affiche **Ingress NGINX** dans la section **Extensions** lorsqu'il est actif.

### Exposition

Le contrôleur est exposé par un Service de type `LoadBalancer` et s'exécute sur les nœuds des groupes marqués **Exposé sur internet (IP Publique)** (étape **Nœuds**). Le premier groupe du cluster est toujours exposé.

:::note
Le choix de la méthode d'exposition (`LoadBalancer` ou `Proxied`) et la déclaration de noms d'hôtes au niveau de l'addon ne sont pas proposés dans la console ; contactez le support.
:::

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart Helm d'Ingress NGINX, sous la clé `ingress-nginx`. Par exemple, pour ajuster les ressources et la configuration NGINX :

```yaml title="ingress-nginx-override.yaml"
ingress-nginx:
  controller:
    resources:
      requests:
        cpu: 100m
        memory: 90Mi
      limits:
        cpu: 500m
        memory: 500Mi
    config:
      ssl-protocols: "TLSv1.2 TLSv1.3"
```

Les options disponibles sont décrites dans le [chart Helm d'Ingress NGINX](https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx).

## Utilisation dans le cluster

```bash
# IP externe du contrôleur (colonne EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller

# Classe d'Ingress à utiliser dans vos manifestes
kubectl get ingressclass
```

Exemple d'Ingress :

```yaml title="ingress.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
```

Pointez ensuite vos noms de domaine (enregistrement DNS `A`) vers l'IP externe du contrôleur. Pour le HTTPS, voir [Comment déployer un Ingress avec TLS](../how-to/deploy-ingress-tls.md).

## Bonnes pratiques

- Dédiez un groupe de nœuds exposé au trafic entrant pour l'isoler de vos charges de calcul.
- Configurez les annotations `nginx.ingress.kubernetes.io/*` directement dans vos manifestes `Ingress` pour un contrôle par application.
- Activez [Ouroboros](./ouroboros.md) si des pods du cluster doivent joindre les domaines publics servis par ce même Ingress.
