---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer un cluster Kubernetes en quelques minutes

Ce guide vous accompagne dans la création de votre premier cluster Kubernetes depuis la console Hikube, jusqu'au déploiement d'une application de test.

---

## Prérequis

- **Un compte Hikube** et l'accès à la [console Hikube](https://console.hikube.cloud)
- **Un projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- **`kubectl` installé sur votre poste**, pour travailler dans le cluster une fois créé
- **Notions de base Kubernetes** (pods, services, deployments)

---

## Étape 1 : Créer le cluster

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **Infrastructure** > **Kubernetes**. La page **Clusters Kubernetes** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un nouveau cluster** s'ouvre sur l'étape **Général**.

---

## Étape 2 : Configurer et valider

L'assistant comporte quatre étapes : **Général**, **Nœuds**, **Addons** et **Vérification**. Les jauges **Quotas du projet** indiquent en permanence la part du quota que le cluster réservera.

### Général

| Champ | Valeur pour ce guide |
|-------|----------------------|
| **Nom du cluster** | `demo-cluster` (3 à 16 caractères : minuscules, chiffres et tirets) |
| **Version de Kubernetes** | La version présélectionnée (la plus récente proposée) |
| **Endpoint API (Host)** | Laissez vide : l'adresse est générée automatiquement par la plateforme, sans configuration DNS de votre part |
| **Taille de l'instance Control Plane** | **Small** |
| **Haute Disponibilité du Control Plane** | **3 (HA)** |

Cliquez sur **Suivant**.

### Nœuds

Un premier groupe, `worker-pool-1`, est déjà présent. Dépliez-le et renseignez :

| Champ | Valeur pour ce guide |
|-------|----------------------|
| **Nom du groupe** | `worker-pool-1` |
| **Taille du stockage éphémère** | 20 Go |
| **Nombre minimum de nœuds** | 1 |
| **Nombre maximum de nœuds** | 3 |
| **Type d'instance** | Série **Standard (S)**, taille **Large** (`s1.large`, 4 vCPU, 8 Go) |
| **Exposé sur internet (IP Publique)** | Activé (imposé pour le premier groupe) |

Cliquez sur **Suivant**.

### Addons

**Cert-Manager**, **Ingress NGINX** et **Monitoring Agents** sont cochés par défaut. Gardez cette sélection pour ce guide. Les blocs de la **Configuration avancée** (Cilium, CoreDNS, Vertical Pod Autoscaler) n'ont pas besoin d'être modifiés.

Cliquez sur **Suivant**.

### Vérification

Le **Récapitulatif** reprend l'identité du cluster, le control plane, les groupes de nœuds et les **Extensions & Addons activés**. Vérifiez la configuration, puis cliquez sur **Déployer**.

---

## Étape 3 : Vérifier l'état

Après le déploiement, la console revient sur la liste **Clusters Kubernetes**. Le cluster `demo-cluster` y apparaît avec le statut **En création**.

Le provisionnement prend quelques minutes. Le statut passe ensuite à **Prêt**.

Cliquez sur le cluster (ou **Voir les détails** dans son menu **Actions**) pour ouvrir sa page de détail :

- **Général** : version de Kubernetes, preset du control plane et nombre d'instances ;
- **Pools de Nœuds** : chaque groupe avec son type d'instance et son nombre de nœuds actifs, par exemple « 1 nœud actif (De 1 à 3) » ;
- **Extensions** : addons activés.

**Résultat attendu** : statut **Prêt**, et au moins un nœud actif dans `worker-pool-1`.

---

## Étape 4 : Récupérer les identifiants

Sur la page de détail du cluster, section **Actions**, cliquez sur **Kubeconfig**. Le navigateur télécharge le fichier `kubeconfig-demo-cluster.yaml` et la console confirme : « Le fichier kubeconfig a été téléchargé. »

:::warning
Ce kubeconfig donne un accès administrateur complet au cluster. Conservez-le en lieu sûr et ne le versionnez pas.
:::

---

## Étape 5 : Connexion et tests

### Se connecter au cluster

```bash
# Utiliser le kubeconfig téléchargé
export KUBECONFIG=~/Downloads/kubeconfig-demo-cluster.yaml

# Tester la connexion
kubectl get nodes
```

**Résultat attendu** : un nœud par nœud actif du groupe, avec le statut `Ready`.

```console
NAME                        STATUS   ROLES    AGE   VERSION
demo-cluster-worker-xxxxx   Ready    <none>   2m    v1.xx.x
```

### Déployer une application de démonstration

```yaml title="demo-app.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-hikube
  labels:
    app: hello-hikube
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-hikube
  template:
    metadata:
      labels:
        app: hello-hikube
    spec:
      containers:
        - name: app
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: hello-hikube-service
spec:
  selector:
    app: hello-hikube
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-hikube-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-hikube-service
                port:
                  number: 80
```

```bash
kubectl apply -f demo-app.yaml

# Vérifier le déploiement
kubectl get pods -l app=hello-hikube
```

**Résultat attendu :**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### Tester l'accès

```bash
# Test direct du Service, sans passer par l'Ingress
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080

# Récupérer l'IP externe du contrôleur Ingress NGINX (colonne EXTERNAL-IP)
kubectl get svc -A | grep ingress-nginx-controller

# Tester l'Ingress sans configurer de DNS
curl -H "Host: demo.example.com" http://<EXTERNAL-IP>
```

Pour publier l'application sous votre propre domaine, créez un enregistrement DNS qui pointe vers cette IP externe, puis suivez [Comment déployer un Ingress avec TLS](./how-to/deploy-ingress-tls.md).

---

## Étape 6 : Dépannage rapide

| Symptôme | Vérification |
|----------|--------------|
| Le bouton **Suivant** reste grisé et une jauge **Quotas du projet** est dépassée | Le projet n'a pas assez de quota pour le control plane et le **maximum** de nœuds de chaque groupe. Réduisez le nombre maximum de nœuds, le gabarit ou le stockage éphémère. |
| Le cluster reste **En création** au-delà de quelques dizaines de minutes | [Contactez le support](mailto:support@hidora.io) en indiquant le nom du cluster et le projet. |
| **Kubeconfig** affiche « Impossible d'obtenir le fichier kubeconfig. » | Attendez que le cluster soit **Prêt**, puis réessayez. |
| `kubectl get nodes` ne liste aucun nœud `Ready` | Vérifiez dans **Pools de Nœuds** le nombre de nœuds actifs, puis `kubectl describe node <nom-du-nœud>`. |
| Pods en `Pending` | `kubectl describe pod <nom-du-pod>` ; si les nœuds sont saturés, augmentez le **Nombre maximum de nœuds** via **Modifier**. |
| L'Ingress ne répond pas | Vérifiez que l'addon **Ingress NGINX** est activé et qu'au moins un groupe est **Exposé sur internet (IP Publique)**. |

Pour aller plus loin, consultez la page [Dépannage](./troubleshooting.md).

---

## Étape 7 : Nettoyage

Supprimez d'abord l'application de test :

```bash
kubectl delete -f demo-app.yaml
```

Puis supprimez le cluster depuis la console :

1. Dans **Infrastructure** > **Kubernetes**, ouvrez le menu **Actions** du cluster et choisissez **Supprimer** (ou cliquez sur **Supprimer** depuis sa page de détail).
2. Dans la fenêtre « Supprimer demo-cluster ? », saisissez le nom exact du cluster pour confirmer.
3. Cliquez sur **Supprimer définitivement**.

:::warning
La suppression est irréversible : toutes les données associées au cluster sont définitivement perdues.
:::

---

## Résumé

Vous avez créé :

- un cluster Kubernetes avec un control plane managé en haute disponibilité ;
- un groupe de nœuds avec auto-scaling de 1 à 3 nœuds ;
- une application d'exemple exposée par Ingress NGINX.

## Prochaines étapes

- **[Concepts](./concepts.md)** : détail de chaque champ de l'assistant
- **[Comment ajouter et modifier un groupe de nœuds](./how-to/manage-node-groups.md)**
- **[GPU](../gpu/overview.md)** : utiliser des GPU avec Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Guides pratiques", href: "../how-to/manage-node-groups"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
