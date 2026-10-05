---
title: "Comment configurer le networking"
---

# Comment configurer le networking

Ce guide explique comment gérer la configuration réseau de votre cluster Kubernetes Hikube, en utilisant les NetworkPolicies Kubernetes et les outils d'observabilité Cilium/Hubble.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**) et chargé dans votre session :
  ```bash
  export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
  ```
- Notions de base sur le networking Kubernetes (Services, Pods, namespaces)

## Étapes

### 1. Comprendre le réseau Hikube

:::note
Cilium est le CNI (Container Network Interface) des clusters Kubernetes Hikube. Il fournit le networking, la sécurité réseau et l'observabilité. Il est toujours présent ; sa configuration se surcharge dans la console, section **Configuration avancée** des addons (voir [Cilium](../plugins/cilium.md)).
:::

Les clusters Hikube intègrent :

- **Cilium** comme CNI : réseau pod-to-pod, services et application des NetworkPolicies ;
- **Hubble** pour l'observabilité : visualisation des flux réseau, à activer via la surcharge Cilium.

Par défaut, tous les pods peuvent communiquer entre eux sans restriction. Les NetworkPolicies permettent de restreindre ces communications.

L'exposition vers internet passe par les groupes de nœuds marqués **Exposé sur internet (IP Publique)** dans la console, qui hébergent le contrôleur [Ingress NGINX](../plugins/ingress-nginx.md).

### 2. Créer une NetworkPolicy

Définissez des règles pour contrôler le trafic entrant (Ingress) et sortant (Egress) de vos pods :

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
- **autorise le trafic entrant** vers les pods `app: web` uniquement depuis les pods `app: frontend` sur le port 80 ;
- **autorise le trafic sortant** des pods `app: web` uniquement vers les pods `app: database` sur le port 5432 ;
- **bloque tout autre trafic** entrant et sortant pour les pods `app: web`.

### 3. Appliquer et tester

```bash
# Appliquer la NetworkPolicy
kubectl apply -f network-policy.yaml

# Vérifier que la politique est créée
kubectl get networkpolicies

# Tester la connectivité autorisée
kubectl exec -it deploy/frontend -- curl -s http://web-service:80

# Tester la connectivité bloquée (doit échouer)
kubectl exec -it deploy/other-app -- curl -s --connect-timeout 3 http://web-service:80
```

:::tip
Commencez par des politiques permissives, puis restreignez progressivement. Une politique trop restrictive peut casser la communication entre vos services.
:::

**Exemple de politique par défaut pour isoler un namespace :**

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
La politique `default-deny-all` bloque **tout le trafic** dans le namespace, y compris l'accès DNS. Si vous l'appliquez, ajoutez immédiatement une politique autorisant le trafic DNS (port 53) en sortie, sinon la résolution de noms sera cassée.
:::

### 4. Utiliser Hubble pour le debugging réseau

Hubble n'est pas activé par défaut. Pour l'activer, modifiez le cluster dans la console (**Modifier**), dépliez **Cilium** dans la section **Configuration avancée** des addons, saisissez la surcharge suivante dans **Configuration Helm (YAML) — optionnel**, puis cliquez sur **Enregistrer** :

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

Une fois Cilium redéployé, utilisez la CLI Hubble embarquée dans les pods Cilium :

```bash
# Repérer le namespace et un pod Cilium
kubectl get pods -A -l k8s-app=cilium

# Vérifier le statut de Hubble
kubectl exec -n <namespace-cilium> -it ds/cilium -- hubble status

# Observer les flux réseau en temps réel
kubectl exec -n <namespace-cilium> -it ds/cilium -- hubble observe

# Voir les flux refusés par les NetworkPolicies
kubectl exec -n <namespace-cilium> -it ds/cilium -- hubble observe --verdict DROPPED

# Filtrer par namespace
kubectl exec -n <namespace-cilium> -it ds/cilium -- hubble observe --namespace production
```

:::tip
La commande `hubble observe --verdict DROPPED` est particulièrement utile pour identifier les flux bloqués par une NetworkPolicy et ajuster vos règles.
:::

## Vérification

```bash
# Lister toutes les NetworkPolicies
kubectl get networkpolicies -A

# Détails d'une politique
kubectl describe networkpolicy allow-web

# Vérifier l'état de Cilium
kubectl exec -n <namespace-cilium> -it ds/cilium -- cilium status
```

**Résultat attendu pour `kubectl get networkpolicies` :**

```console
NAME        POD-SELECTOR   AGE
allow-web   app=web        5m
```

## Pour aller plus loin

- [Concepts](../concepts.md) : architecture réseau et groupes de nœuds exposés
- [Comment déployer un Ingress avec TLS](./deploy-ingress-tls.md) : exposition HTTPS de vos applications
