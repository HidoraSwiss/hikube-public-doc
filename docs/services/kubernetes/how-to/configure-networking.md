---
title: "Comment configurer le networking"
---

# Comment configurer le networking

Ce guide explique comment gerer la configuration reseau de votre cluster Kubernetes Hikube, en utilisant les NetworkPolicies Kubernetes et les outils d'observabilite Cilium/Hubble.

## Prerequis

- Un cluster Kubernetes Hikube deploye (voir le [demarrage rapide](../quick-start.md))
- Le kubeconfig du cluster enfant configure (`export KUBECONFIG=cluster-admin.yaml`)
- Notions de base sur le networking Kubernetes (Services, Pods, namespaces)

## Etapes

### 1. Comprendre le reseau Hikube

:::note
Cilium est le CNI (Container Network Interface) par defaut sur les clusters Kubernetes Hikube. Il fournit le networking, la securite reseau et l'observabilite.
:::

Les clusters Hikube integrent :

- **Cilium** comme CNI : gestion du reseau pod-to-pod, des services et de l'application des NetworkPolicies
- **Hubble** pour l'observabilite : visualisation des flux reseau en temps reel et debugging

Par defaut, tous les pods peuvent communiquer entre eux sans restriction. Les NetworkPolicies permettent de restreindre ces communications.

### 2. Creer une NetworkPolicy

Definissez des regles pour controler le trafic entrant (Ingress) et sortant (Egress) de vos pods :

```yaml title="network-policy.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

Cette politique :
- **Autorise le trafic entrant** vers les pods `app: web` uniquement depuis les pods `app: frontend` sur le port 80
- **Autorise le trafic sortant** des pods `app: web` uniquement vers les pods `app: database` sur le port 5432
- **Bloque tout autre trafic** entrant et sortant pour les pods `app: web`

### 3. Appliquer et tester

```bash
# Appliquer la NetworkPolicy
kubectl apply -f network-policy.yaml

# Verifier que la politique est creee
kubectl get networkpolicies

# Tester la connectivite autorisee
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Tester la connectivite bloquee (devrait echouer)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Commencez par des politiques permissives en mode observation, puis restreignez progressivement. Une politique trop restrictive peut casser la communication entre vos services.
:::

**Exemple de politique par defaut pour isoler un namespace :**

```yaml title="default-deny.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

:::warning
La politique `default-deny-all` bloque **tout le trafic** dans le namespace, y compris l'acces DNS. Si vous l'appliquez, ajoutez immediatement une politique autorisant le trafic DNS (port 53) en sortie, sinon la resolution de noms sera cassee.
:::

### 4. Utiliser Hubble pour le debugging reseau

Hubble fournit une visibilite complete sur les flux reseau du cluster. Utilisez-le pour diagnostiquer les problemes de connectivite :

```bash
# Verifier le statut de Hubble
kubectl exec -n kube-system -it ds/cilium -- hubble status

# Observer les flux reseau en temps reel
kubectl exec -n kube-system -it ds/cilium -- hubble observe

# Filtrer les flux pour un pod specifique
kubectl exec -n kube-system -it ds/cilium -- hubble observe --pod web-xxxxx

# Voir les flux refuses par les NetworkPolicies
kubectl exec -n kube-system -it ds/cilium -- hubble observe --verdict DROPPED

# Filtrer par namespace
kubectl exec -n kube-system -it ds/cilium -- hubble observe --namespace production
```

:::tip
La commande `hubble observe --verdict DROPPED` est particulierement utile pour identifier les flux bloques par une NetworkPolicy et ajuster vos regles.
:::

## Verification

Verifiez que vos politiques reseau sont correctement appliquees :

```bash
# Lister toutes les NetworkPolicies
kubectl get networkpolicies -A

# Details d'une politique
kubectl describe networkpolicy allow-web

# Verifier l'etat de Cilium
kubectl exec -n kube-system -it ds/cilium -- cilium status
```

**Resultat attendu pour `kubectl get networkpolicies` :**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Pour aller plus loin

- [Reference API](../api-reference.md) -- Configuration complete du cluster
- [Concepts](../concepts.md) -- Architecture reseau et flux de communication
- [Comment deployer un Ingress avec TLS](./deploy-ingress-tls.md) -- Exposition HTTPS de vos applications
