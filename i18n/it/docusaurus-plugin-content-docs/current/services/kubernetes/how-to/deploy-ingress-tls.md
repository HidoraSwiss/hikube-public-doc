---
title: Come distribuire un Ingress con TLS
---

# Comment deployer un Ingress avec TLS

Ce guide explique comment exposer une application via HTTPS avec un certificat TLS automatique sur un cluster Kubernetes Hikube, en utilisant les addons cert-manager et ingress-nginx.

## Prerequisitiiti

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Un nom de domaine pointe vers votre cluster (enregistrement DNS A ou CNAME)
- Le kubeconfig du cluster enfant recupere

## Passi

### 1. Activer les addons certManager et ingressNginx

Modifiez la configuration de votre cluster pour activer les addons necessaires :

```yaml title="cluster-ingress-tls.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  controlPlane:
    replicas: 3

  nodeGroups:
    web:
      minReplicas: 2
      maxReplicas: 5
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - app.example.com
```

:::note
Le champ `hosts` sous `ingressNginx` definit les domaines pour lesquels l'Ingress Controller acceptera le trafic. Vous pouvez utiliser des wildcards (`*.example.com`) pour couvrir plusieurs sous-domaines.
:::

### 2. Assigner le role ingress-nginx a un node group

Le node group qui hebergera l'Ingress Controller doit avoir le role `ingress-nginx` dans sa configuration. Verifiez que votre node group est correctement configure :

```yaml title="cluster-ingress.yaml"
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 5
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

:::tip
Dedier un node group a l'Ingress permet d'isoler le trafic entrant et de dimensionner independamment les ressources d'exposition HTTP/HTTPS.
:::

### 3. Appliquer la configuration du cluster

```bash
kubectl apply -f cluster-ingress-tls.yaml

# Attendre que le cluster soit pret
kubectl get kubernetes my-cluster -w
```

Verifiez que les addons sont deployes dans le cluster enfant :

```bash
export KUBECONFIG=cluster-admin.yaml

# Verifier cert-manager
kubectl get pods -n cert-manager

# Verifier l'Ingress Controller
kubectl get pods -n ingress-nginx

# Recuperer l'IP externe de l'Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### 4. Creer un Ingress avec TLS dans le cluster enfant

Deployez votre application, puis creez un Ingress avec terminaison TLS automatique :

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

Appliquez la configuration dans le cluster enfant :

```bash
kubectl apply -f ingress-tls.yaml
```

:::note
L'annotation `cert-manager.io/cluster-issuer: letsencrypt-prod` indique a cert-manager d'obtenir automatiquement un certificat Let's Encrypt pour le domaine specifie.
:::

### 5. Verifier le certificat

```bash
# Verifier l'etat du certificat
kubectl get certificate

# Resultat attendu
# NAME      READY   SECRET    AGE
# app-tls   True    app-tls   2m

# Details du certificat
kubectl describe certificate app-tls
```

## Verifica

Testez l'acces HTTPS a votre application :

```bash
# Verifier l'Ingress
kubectl get ingress my-app

# Tester l'acces HTTPS
curl -v https://app.example.com
```

**Risultato atteso :**

```console
NAME     CLASS   HOSTS             ADDRESS        PORTS     AGE
my-app   nginx   app.example.com   203.0.113.10   80, 443   5m
```

:::warning
Le provisionnement du certificat Let's Encrypt peut prendre quelques minutes. Si le certificat reste en etat `False`, verifiez que votre enregistrement DNS pointe correctement vers l'IP de l'Ingress Controller et que le port 80 est accessible (necessaire pour la validation HTTP-01).
:::

## Per approfondire

- [Reference API](../api-reference.md) -- Configuration des addons `certManager` et `ingressNginx`
- [Concepts](../concepts.md) -- Architecture du cluster et composants reseau
- [Comment configurer le networking](./configure-networking.md) -- Gestion avancee du reseau
