---
title: "Comment déployer un Ingress avec TLS"
---

# Comment déployer un Ingress avec TLS

Ce guide explique comment exposer une application en HTTPS avec un certificat TLS automatique sur un cluster Kubernetes Hikube, en utilisant les addons Cert-Manager et Ingress NGINX.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**)
- Un nom de domaine dont vous gérez la zone DNS

## Étapes

### 1. Activer les addons Cert-Manager et Ingress NGINX

Les deux addons sont cochés par défaut à la création d'un cluster. Pour vérifier ou les activer sur un cluster existant :

1. Dans **Infrastructure** > **Kubernetes**, ouvrez la page de détail du cluster : la section **Extensions** liste les addons actifs.
2. S'ils n'y figurent pas, cliquez sur **Modifier**, cochez **Cert-Manager** et **Ingress NGINX** dans la section **Extensions & Addons**, puis cliquez sur **Enregistrer**.

### 2. Vérifier le groupe de nœuds exposé

Le contrôleur Ingress NGINX s'exécute sur les nœuds des groupes marqués **Exposé sur internet (IP Publique)**. Le premier groupe du cluster l'est toujours. Pour dédier un autre groupe au trafic entrant, activez cette option sur sa carte dans la section **Groupes de nœuds** de la page **Modifier**.

:::tip
Dédier un groupe de nœuds à l'Ingress permet d'isoler le trafic entrant et de dimensionner indépendamment les ressources d'exposition HTTP/HTTPS.
:::

### 3. Récupérer l'IP externe et configurer le DNS

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml

# Pods Cert-Manager et Ingress NGINX
kubectl get pods -A | grep -E "cert-manager|ingress-nginx"

# IP externe du contrôleur Ingress NGINX (colonne EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller
```

Créez chez votre fournisseur DNS un enregistrement `A` qui pointe votre domaine (par exemple `app.example.com`) vers cette IP externe.

### 4. Créer un émetteur de certificats

Déclarez un `ClusterIssuer` Let's Encrypt, qui validera vos domaines par challenge HTTP-01 via Ingress NGINX :

```yaml title="cluster-issuer.yaml"
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

```bash
kubectl apply -f cluster-issuer.yaml
kubectl get clusterissuer letsencrypt-prod
```

:::tip
Pour vos tests, utilisez d'abord le serveur de staging de Let's Encrypt (`https://acme-staging-v02.api.letsencrypt.org/directory`) afin de ne pas atteindre les limites de requêtes.
:::

### 5. Créer un Ingress avec TLS

Déployez votre application, puis créez un Ingress avec terminaison TLS automatique :

```yaml title="ingress-tls.yaml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
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

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
L'annotation `cert-manager.io/cluster-issuer: letsencrypt-prod` indique à Cert-Manager d'obtenir automatiquement un certificat pour les domaines de la section `tls`.
:::

### 6. Vérifier le certificat

```bash
kubectl get certificate

# Résultat attendu
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

kubectl describe certificate app-tls
```

## Vérification

```bash
# Vérifier l'Ingress
kubectl get ingress my-app

# Tester l'accès HTTPS
curl -v https://app.example.com
```

**Résultat attendu :**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Le provisionnement du certificat Let's Encrypt peut prendre quelques minutes. Si le certificat reste en état `False`, vérifiez que votre enregistrement DNS pointe vers l'IP externe du contrôleur Ingress NGINX et que le port 80 est accessible (nécessaire pour la validation HTTP-01).
:::

:::tip
Si des pods du cluster doivent joindre vos propres domaines publics (hairpin NAT), activez l'addon [Ouroboros](../plugins/ouroboros.md).
:::

## Pour aller plus loin

- [Cert-Manager](../plugins/cert-manager.md) et [Ingress NGINX](../plugins/ingress-nginx.md) : détail des addons
- [Comment configurer le networking](./configure-networking.md) : gestion avancée du réseau
